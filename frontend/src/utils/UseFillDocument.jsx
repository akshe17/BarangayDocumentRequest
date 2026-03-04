import { useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import api from "../axious/api";
export function useFillDocument() {
  const [filling, setFilling] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null); // null = hidden

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toProperCase = (str) =>
    (str || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const buildDataMap = (request) => {
    const resi = request?.resident ?? {};
    const user = resi?.user ?? {};
    const today = new Date();

    const birth = resi.birthdate ? new Date(resi.birthdate) : null;
    let age = "N/A";
    if (birth) {
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    }

    return {
      last_name: toProperCase(user.last_name),
      first_name: toProperCase(user.first_name),
      full_name_text:
        `${toProperCase(user.last_name)}, ${toProperCase(user.first_name)} ${
          user.middle_initial ? user.middle_initial.toUpperCase() + "." : ""
        }`.trim(),
      "M.I": user.middle_initial ? user.middle_initial.toUpperCase() + "." : "",
      age_text: `${age} years old`,
      civil_status: toProperCase(resi.civil_status?.status_name || "N/A"),
      birthday_text: birth
        ? birth.toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      address_text: `${resi.house_no || ""}, ${user.zone?.zone_name || ""}, Bonbon, CDO`,
      purpose_text: toProperCase(request.purpose || "General Purpose"),
      day_text: String(today.getDate()),
      month_text: today.toLocaleString("en-PH", { month: "long" }),
      year_text: String(today.getFullYear()),
      valid_until: new Date(
        new Date().setFullYear(today.getFullYear() + 1),
      ).toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  // Word splits {{tag}} across multiple XML runs with <w:proofErr>, <w:r> etc between them.
  // Strategy: strip ALL xml tags from the text content first, then the braces are adjacent.
  const cleanTagsInXml = (xml) => {
    // Convert {{tag}} (with possible XML noise inside) → {tag} single-brace format
    // docxtemplater uses single braces by default — double braces are loop/section syntax
    return xml.replace(/\{\{([\s\S]{1,400}?)\}\}/g, (match, inner) => {
      const tagName = inner
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, "")
        .trim();
      if (/^[\w.]+$/.test(tagName)) return `{${tagName}}`;
      return match;
    });
  };

  // Patch EVERY xml file in the zip (docxtemplater may read from any of them)
  // then re-serialize + reload to flush PizZip internal cache
  const buildCleanZip = (rawArrayBuffer) => {
    const zip = new PizZip(rawArrayBuffer);

    // Log all files so we can see what docxtemplater is actually reading
    const allFiles = Object.keys(zip.files);
    console.log(
      "%c📦 All files in docx zip:",
      "color:#8b5cf6;font-weight:bold",
      allFiles,
    );

    // Patch every .xml file — not just document.xml
    allFiles.forEach((filename) => {
      if (!filename.endsWith(".xml") && !filename.endsWith(".rels")) return;
      try {
        const original = zip.files[filename].asText();
        if (!original.includes("{{")) return; // skip files with no tags
        const cleaned = cleanTagsInXml(original);
        if (cleaned !== original) {
          console.log(`%c✓ Patched: ${filename}`, "color:#10b981");
          zip.file(filename, cleaned);
        }
      } catch {
        /* binary file, skip */
      }
    });

    const binary = zip.generate({ type: "uint8array", compression: "DEFLATE" });
    return new PizZip(binary);
  };

  const extractUsedTags = (zip) => {
    const xml = zip.files["word/document.xml"]?.asText() ?? "";
    // Match single-brace {tag} — what the cleaned XML contains
    const matches = [...xml.matchAll(/\{([\w.]+)\}/g)];
    return new Set(matches.map((m) => m[1].trim()));
  };

  // ── Main fill function ─────────────────────────────────────────────────────

  const fill = async (request) => {
    if (!request) return;
    setFilling(true);
    setDebugInfo(null);

    const log = {
      templatePath: request?.document_type?.template_path ?? "unknown",
      documentType: request?.document_type?.type_name ?? "unknown",
      resident:
        `${request?.resident?.user?.first_name ?? ""} ${request?.resident?.user?.last_name ?? ""}`.trim(),
      tagsInTemplate: [],
      tagsInjected: [],
      tagsMissing: [], // in template but not in our data map
      tagsUnused: [], // in our data map but not in template
      errors: [],
      warnings: [],
      status: "pending",
    };

    try {
      // 1. Fetch template
      const res = await api.get("/clerk/template", {
        params: { path: log.templatePath },
        responseType: "arraybuffer",
      });
      log.warnings.push(`Template fetched: ${res.data.byteLength} bytes`);

      // 2. Clean broken tags + rebuild zip from scratch
      const zip = buildCleanZip(res.data);

      // DEBUG: log the cleaned XML around any {{ to verify patching worked
      const debugXml = zip.files["word/document.xml"]?.asText() ?? "";
      const tagMatches = [
        ...debugXml.matchAll(/[\s\S]{0,60}\{[\w]+\}[\s\S]{0,60}/g),
      ];
      console.group(
        "%c🔧 Cleaned XML tag contexts",
        "color:#06b6d4;font-weight:bold",
      );
      tagMatches.forEach((m) => console.log(m[0].replace(/\s+/g, " ")));
      console.groupEnd();
      const allData = buildDataMap(request);
      const usedTags = extractUsedTags(zip);

      log.tagsInTemplate = [...usedTags];
      log.tagsInjected = Object.keys(allData).filter((k) => usedTags.has(k));
      log.tagsMissing = [...usedTags].filter((t) => !(t in allData));
      log.tagsUnused = Object.keys(allData).filter((k) => !usedTags.has(k));

      if (log.tagsMissing.length) {
        log.warnings.push(
          `Tags in template with no data: ${log.tagsMissing.join(", ")}`,
        );
      }

      // Only inject what the template actually uses
      const data = Object.fromEntries(
        Object.entries(allData).filter(([k]) => usedTags.has(k)),
      );

      // 3. Compile + Render — always use the fixed zip, swallow ALL errors
      //    nullGetter returns "" for any unknown/missing tag so nothing throws
      // Build a safe data proxy — returns "" for ANY key, known or unknown
      // This means {{incorrect_name}}, {{typo}}, any garbage tag → silently blank
      const safeData = new Proxy(allData, {
        get: (target, key) => (key in target ? target[key] : ""),
      });

      // 3. Compile — try with fixed zip, catch and log but never fatal
      let doc = null;
      const attempts = [
        { zip, paragraphLoop: true },
        { zip, paragraphLoop: false }, // retry without paragraphLoop if first fails
      ];

      for (const attempt of attempts) {
        try {
          doc = new Docxtemplater(attempt.zip, {
            paragraphLoop: attempt.paragraphLoop,
            linebreaks: true,
            delimiters: { start: "{", end: "}" }, // single braces — {{ is loop syntax in docxtemplater
            nullGetter: () => "", // blank for any unresolved/missing tag
          });
          break; // success — stop trying
        } catch (compileErr) {
          const errs = compileErr?.properties?.errors ?? [compileErr];
          errs.forEach((e) =>
            log.errors.push(
              `[COMPILE] ${e.properties?.xtag ?? "?"} @ offset ${e.properties?.offset ?? "?"}: ${e.message}`,
            ),
          );
        }
      }

      if (!doc) {
        log.warnings.push(
          "Could not instantiate Docxtemplater — saving unfilled template",
        );
        log.status = "partial";
        const rawOut = zip.generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(
          rawOut,
          `${(allData.full_name_text || "document").replace(/\s+/g, "_")}_template.docx`,
        );
        setDebugInfo(log);
        return;
      }

      // 4. Render — inject safe proxy so missing/wrong tags → ""
      doc.setData(safeData);
      try {
        doc.render();
        log.status = log.errors.length ? "partial" : "success";
      } catch (renderErr) {
        const errs = renderErr?.properties?.errors ?? [renderErr];
        errs.forEach((e) =>
          log.errors.push(
            `[RENDER] ${e.properties?.xtag ?? "?"} @ offset ${e.properties?.offset ?? "?"}: ${e.message}`,
          ),
        );
        log.status = "partial";
        log.warnings.push(
          "Render errors — document saved with partial substitution",
        );
      }

      // 5. Generate + save regardless of errors
      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const filename = `${(data.full_name_text || "document").replace(/\s+/g, "_")}.docx`;
      saveAs(out, filename);
      log.warnings.push(`Saved as: ${filename}`);
    } catch (fatalErr) {
      // Only truly fatal errors (network, unreadable zip) reach here
      log.status = "fatal";
      log.errors.push(`[FATAL] ${fatalErr?.message ?? String(fatalErr)}`);
      throw fatalErr;
    } finally {
      setFilling(false);
      setDebugInfo(log);
      // Always print a clean summary to console
      console.groupCollapsed(
        `%c📄 UseFillDocument — ${log.status.toUpperCase()} — ${log.documentType}`,
        log.status === "success"
          ? "color:#10b981;font-weight:bold"
          : log.status === "partial"
            ? "color:#f59e0b;font-weight:bold"
            : "color:#ef4444;font-weight:bold",
      );
      console.log("Template path:", log.templatePath);
      console.log("Resident:", log.resident);
      console.table({
        "Tags in template": log.tagsInTemplate.join(", ") || "—",
        "Tags injected": log.tagsInjected.join(", ") || "—",
        "Missing (no data)": log.tagsMissing.join(", ") || "none ✓",
        "Unused (extra)": log.tagsUnused.join(", ") || "none",
      });
      if (log.errors.length) {
        console.error("Errors:", log.errors);
      }
      if (log.warnings.length) {
        console.warn("Warnings:", log.warnings);
      }
      console.groupEnd();
    }
  };

  const clearDebug = () => setDebugInfo(null);

  return { fill, filling, debugInfo, clearDebug };
}
