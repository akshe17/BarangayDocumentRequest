import { useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import api from "../axious/api";
export function useFillDocument() {
  const [filling, setFilling] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toProperCase = (str) =>
    (str || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  /**
   * Convert any string to a snake_case template tag key.
   * "Number of Years Living in Area" → "number_of_years_living_in_area"
   * "Name of Partner"               → "name_of_partner"
   */
  const toSnakeCase = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_") // non-alphanumeric → _
      .replace(/^_+|_+$/g, ""); // trim leading/trailing _

  /**
   * Build dynamic data from RequestFormData entries.
   * Each entry has:
   *   field_value              — the resident's answer
   *   field_definition.field_label — the question label
   *
   * We turn every label into a snake_case key so the template author
   * can use {number_of_years_living_in_area}, {name_of_partner}, etc.
   */
  const buildFormDataMap = (request) => {
    const formData = request?.form_data ?? request?.formData ?? [];
    const map = {};

    formData.forEach((entry) => {
      const label =
        entry?.field_definition?.field_label ??
        entry?.fieldDefinition?.field_label ??
        null;
      const value = entry?.field_value ?? "";

      if (!label) return;

      const key = toSnakeCase(label);
      map[key] = toProperCase(value) || "";

      // Also store the original label as-is (spaces → underscores) for
      // templates that were authored with the raw label
      const rawKey = label.replace(/\s+/g, "_");
      if (rawKey !== key) map[rawKey] = map[key];
    });

    return map;
  };

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

    const staticData = {
      // ── Identity ──────────────────────────────────────────────
      last_name: toProperCase(user.last_name),
      first_name: toProperCase(user.first_name),
      full_name_text:
        `${toProperCase(user.last_name)}, ${toProperCase(user.first_name)} ${
          user.middle_initial ? user.middle_initial.toUpperCase() + "." : ""
        }`.trim(),
      "M.I": user.middle_initial ? user.middle_initial.toUpperCase() + "." : "",

      // ── Resident profile ───────────────────────────────────────
      age_text: `${age} years old`,
      civil_status: toProperCase(resi.civil_status?.status_name || "N/A"),
      gender: toProperCase(resi.gender?.gender_name || "N/A"),
      house_no: resi.house_no || "",

      // ── Dates ─────────────────────────────────────────────────
      birthday_text: birth
        ? birth.toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
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

      // ── Location ───────────────────────────────────────────────
      address_text: `${resi.house_no || ""}, ${user.zone?.zone_name || ""}, Bonbon, CDO`,
      zone_name: user.zone?.zone_name || "",

      // ── Request ────────────────────────────────────────────────
      purpose_text: toProperCase(request.purpose || "General Purpose"),
      document_name: request?.document_type?.document_name || "",
    };

    // ── Dynamic form fields (override static only if key collides AND static is blank) ──
    const dynamicData = buildFormDataMap(request);

    // Merge: static wins on collisions so core fields can't be accidentally
    // overwritten by a form field with a similar label
    return { ...dynamicData, ...staticData };
  };

  // ── XML tag cleaner (unchanged) ────────────────────────────────────────────

  const cleanTagsInXml = (xml) => {
    let result = xml.replace(/\{\{([\s\S]{1,400}?)\}\}/g, (match, inner) => {
      const tagName = inner
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, "")
        .trim();
      if (/^[\w.]+$/.test(tagName)) return `{${tagName}}`;
      return match;
    });
    result = result.replace(
      /<w:r[^>]*>(?:<w:rPr>[\s\S]*?<\/w:rPr>)?<w:t[^>]*>[^<]*\{\{[^<]*<\/w:t><\/w:r>/g,
      "",
    );
    result = result.replace(
      /<w:r[^>]*>(?:<w:rPr>[\s\S]*?<\/w:rPr>)?<w:t[^>]*>[^<]*\}\}[^<]*<\/w:t><\/w:r>/g,
      "",
    );
    result = result.replace(/\{\{/g, "").replace(/\}\}/g, "");
    return result;
  };

  const buildCleanZip = (rawArrayBuffer) => {
    const zip = new PizZip(rawArrayBuffer);
    const allFiles = Object.keys(zip.files);
    console.log(
      "%c📦 All files in docx zip:",
      "color:#8b5cf6;font-weight:bold",
      allFiles,
    );

    allFiles.forEach((filename) => {
      if (!filename.endsWith(".xml") && !filename.endsWith(".rels")) return;
      try {
        const original = zip.files[filename].asText();
        if (!original.includes("{{")) return;
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
      documentType: request?.document_type?.document_name ?? "unknown",
      resident:
        `${request?.resident?.user?.first_name ?? ""} ${request?.resident?.user?.last_name ?? ""}`.trim(),
      formFields: [], // ← new: shows which dynamic fields were found
      tagsInTemplate: [],
      tagsInjected: [],
      tagsMissing: [],
      tagsUnused: [],
      errors: [],
      warnings: [],
      status: "pending",
    };

    try {
      // Log dynamic form fields for debug panel
      const formData = request?.form_data ?? request?.formData ?? [];
      log.formFields = formData.map((e) => ({
        label:
          e?.field_definition?.field_label ??
          e?.fieldDefinition?.field_label ??
          "?",
        key: toSnakeCase(
          e?.field_definition?.field_label ??
            e?.fieldDefinition?.field_label ??
            "",
        ),
        value: e?.field_value ?? "",
      }));

      const res = await api.get("/clerk/template", {
        params: { path: log.templatePath },
        responseType: "arraybuffer",
      });
      log.warnings.push(`Template fetched: ${res.data.byteLength} bytes`);

      const zip = buildCleanZip(res.data);

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

      const safeData = new Proxy(allData, {
        get: (target, key) => (key in target ? target[key] : ""),
      });

      let doc = null;
      for (const attempt of [
        { zip, paragraphLoop: true },
        { zip, paragraphLoop: false },
      ]) {
        try {
          doc = new Docxtemplater(attempt.zip, {
            paragraphLoop: attempt.paragraphLoop,
            linebreaks: true,
            delimiters: { start: "{", end: "}" },
            nullGetter: () => "",
          });
          break;
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

      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const filename = `${(allData.full_name_text || "document").replace(/\s+/g, "_")}.docx`;
      saveAs(out, filename);
      log.warnings.push(`Saved as: ${filename}`);
    } catch (fatalErr) {
      log.status = "fatal";
      log.errors.push(`[FATAL] ${fatalErr?.message ?? String(fatalErr)}`);
      throw fatalErr;
    } finally {
      setFilling(false);
      setDebugInfo(log);
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
      if (log.formFields.length) {
        console.log(
          "%c📝 Dynamic form fields:",
          "color:#8b5cf6;font-weight:bold",
        );
        console.table(log.formFields);
      }
      console.table({
        "Tags in template": log.tagsInTemplate.join(", ") || "—",
        "Tags injected": log.tagsInjected.join(", ") || "—",
        "Missing (no data)": log.tagsMissing.join(", ") || "none ✓",
        "Unused (extra)": log.tagsUnused.join(", ") || "none",
      });
      if (log.errors.length) console.error("Errors:", log.errors);
      if (log.warnings.length) console.warn("Warnings:", log.warnings);
      console.groupEnd();
    }
  };

  const clearDebug = () => setDebugInfo(null);
  return { fill, filling, debugInfo, clearDebug };
}
