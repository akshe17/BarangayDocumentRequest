import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * useFillDocument — Generic PDF placeholder filler
 * ─────────────────────────────────────────────────
 * Works with ANY document type. Just put ${placeholder}
 * text anywhere in your PDF and this hook will find it
 * and replace it with the matching value from the data map.
 *
 * HOW TO PREPARE A TEMPLATE PDF:
 *   Open your PDF in any editor (Word → export as PDF, Canva, etc.)
 *   Type ${first_name}, ${last_name}, ${purpose}, etc. wherever
 *   you want data to appear. Save and upload to Laravel storage.
 *
 * AVAILABLE PLACEHOLDERS (auto-resolved from request object):
 *   ${first_name}       — resident's first name
 *   ${last_name}        — resident's last name
 *   ${full_name}        — "First Last"
 *   ${middle_initial}   — middle initial (if stored on user)
 *   ${age}              — computed age from birthdate
 *   ${birthdate}        — formatted birthdate
 *   ${civil_status}     — civil status name
 *   ${gender}           — gender name
 *   ${address}          — house_no + zone + barangay
 *   ${house_no}         — house number
 *   ${zone}             — zone/purok name
 *   ${purpose}          — stated purpose from request
 *   ${day}              — current day (issuance)
 *   ${month}            — current month (issuance)
 *   ${year}             — current year (issuance)
 *   ${date}             — full formatted date today
 *   ${valid_until}      — 1 year from today
 *   ${series_no}        — auto-generated: YYYY-XXXX
 *   ${request_id}       — raw request ID
 *   ${document_name}    — document type name
 *
 * USAGE:
 *   const { fill, filling, error } = useFillDocument();
 *   <button onClick={() => fill(request)}>Print</button>
 *
 * INSTALL:
 *   npm install pdf-lib
 */

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function computeAge(birthdate) {
  if (!birthdate) return "";
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

function formatDate(date, opts = {}) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...opts,
  });
}

/**
 * Build the data map from a DocumentRequest object.
 * Add more mappings here as your system grows.
 */
function buildDataMap(request) {
  const resident = request?.resident ?? {};
  const user = resident?.user ?? {};
  const zone = user?.zone ?? {};
  const civilStatus = resident?.civil_status ?? {};
  const gender = resident?.gender ?? {};
  const doc = request?.document_type ?? {};

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const firstName = user.first_name ?? "";
  const lastName = user.last_name ?? "";

  return {
    // Identity
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    middle_initial: user.middle_initial ?? "",

    // Personal details
    age: computeAge(resident.birthdate),
    birthdate: resident.birthdate ? formatDate(resident.birthdate) : "",
    civil_status: civilStatus.status_name ?? "",
    gender: gender.gender_name ?? "",

    // Address
    house_no: resident.house_no ?? "",
    zone: zone.zone_name ?? "",
    address: [
      resident.house_no,
      zone.zone_name,
      "Barangay Bonbon, Cagayan de Oro City",
    ]
      .filter(Boolean)
      .join(", "),

    // Request details
    purpose: request?.purpose ?? "",
    document_name: doc.document_name ?? "",
    request_id: String(request?.request_id ?? ""),
    series_no: `${today.getFullYear()}-${String(request?.request_id ?? 0).padStart(4, "0")}`,

    // Dates (issuance = today)
    day: String(today.getDate()),
    month: today.toLocaleString("en-PH", { month: "long" }),
    year: String(today.getFullYear()),
    date: formatDate(today),
    valid_until: formatDate(validUntil),
  };
}

/* ─────────────────────────────────────────────────────────────
   CORE — scan PDF page for ${key} tokens and draw replacements
───────────────────────────────────────────────────────────── */

/**
 * pdf-lib doesn't let us edit existing text, so the strategy is:
 *
 * 1. Parse the raw content stream to find the exact byte positions
 *    of placeholder strings like "(${first_name})" in PDF syntax.
 * 2. COVER the original text with a white rectangle.
 * 3. DRAW the replacement value at the same position.
 *
 * We use pdfjs-dist (bundled with pdf-lib environments) to get
 * the text items with their transform matrices, which give us
 * the exact x/y on the page.
 *
 * Since pdf-lib alone can't read text positions, we use a
 * lightweight regex scan of the raw content stream to locate
 * placeholders, then cross-reference with the page dimensions.
 *
 * SIMPLER ALTERNATIVE (what we actually do):
 * Use pdf-lib to get the raw page content stream as a string,
 * find all Tj/TJ operators that contain ${key}, extract their
 * position from the preceding Td/Tm matrix, cover + redraw.
 */
async function fillPlaceholders(pdfDoc, page, dataMap, font, boldFont) {
  const { width: pageW, height: pageH } = page.getSize();

  // Get the raw content stream of the page
  const contentStreams = page.node.Contents();
  if (!contentStreams) return;

  // Decode the content stream to a string so we can search it
  let rawContent = "";
  try {
    // Handle both single stream and array of streams
    const streamObj =
      contentStreams.constructor.name === "PDFArray"
        ? contentStreams.get(0)
        : contentStreams;
    const bytes = streamObj.getContents
      ? streamObj.getContents()
      : (streamObj.contents ?? new Uint8Array());
    rawContent = new TextDecoder("latin1").decode(bytes);
  } catch {
    // Fallback: try direct decode
    try {
      rawContent = new TextDecoder("latin1").decode(
        pdfDoc.context.lookup(contentStreams)?.getContents?.() ??
          new Uint8Array(),
      );
    } catch {
      return;
    }
  }

  /**
   * PDF text operators we need to parse:
   *   BT                    — begin text block
   *   /FontName size Tf     — set font
   *   x y Td  OR            — move text position (relative)
   *   a b c d e f Tm        — set text matrix (absolute)
   *   (text) Tj             — show string
   *   [(text)] TJ           — show array of strings
   *   ET                    — end text block
   *
   * We scan for any Tj/TJ that contains ${key} and extract
   * the most recent Td/Tm values before it for position.
   */

  // Regex to find text show operations containing ${...}
  // Matches: (some text ${placeholder} more text) Tj
  const placeholderPattern = /\$\{([a-z_]+)\}/g;

  // Parse all text positions from the stream
  // We look for: <number> <number> Td|Tm patterns before each Tj
  const textBlocks = [];

  // Full PDF content stream parser (simplified)
  // Finds: [x y Td] or [a b c d e f Tm] then [(text) Tj]
  const streamLines = rawContent.split(/\r?\n/);

  let currentX = 0;
  let currentY = 0;
  let currentSize = 10;
  let lineX = 0; // accumulated from Td
  let lineY = 0;
  let inBT = false;
  let absX = 0; // from Tm
  let absY = 0;
  let useAbs = false;

  for (const line of streamLines) {
    const trimmed = line.trim();

    if (trimmed === "BT") {
      inBT = true;
      lineX = 0;
      lineY = 0;
      absX = 0;
      absY = 0;
      useAbs = false;
      continue;
    }
    if (trimmed === "ET") {
      inBT = false;
      continue;
    }
    if (!inBT) continue;

    // Font size: /Fx NN Tf
    const tfMatch = trimmed.match(/\/\S+\s+([\d.]+)\s+Tf/);
    if (tfMatch) {
      currentSize = parseFloat(tfMatch[1]);
      continue;
    }

    // Absolute position: a b c d e f Tm
    const tmMatch = trimmed.match(
      /^([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm$/,
    );
    if (tmMatch) {
      absX = parseFloat(tmMatch[5]);
      absY = parseFloat(tmMatch[6]);
      useAbs = true;
      lineX = 0;
      lineY = 0;
      continue;
    }

    // Relative position: x y Td or x y TD
    const tdMatch = trimmed.match(/^([-\d.]+)\s+([-\d.]+)\s+T[dD]$/);
    if (tdMatch) {
      lineX += parseFloat(tdMatch[1]);
      lineY += parseFloat(tdMatch[2]);
      useAbs = false;
      continue;
    }

    // Text show: (text) Tj
    const tjMatch = trimmed.match(/^\((.+)\)\s+Tj$/);
    if (tjMatch) {
      const text = tjMatch[1];
      if (placeholderPattern.test(text)) {
        const x = useAbs ? absX : currentX + lineX;
        const y = useAbs ? absY : currentY + lineY;
        textBlocks.push({ text, x, y, size: currentSize, op: "Tj" });
      }
      placeholderPattern.lastIndex = 0;
      continue;
    }

    // Text show array: [(text)] TJ
    const tjArrayMatch = trimmed.match(/^\[(.+)\]\s+TJ$/);
    if (tjArrayMatch) {
      const inner = tjArrayMatch[1];
      if (placeholderPattern.test(inner)) {
        const x = useAbs ? absX : currentX + lineX;
        const y = useAbs ? absY : currentY + lineY;
        textBlocks.push({
          text: inner.replace(/[()[\]]/g, ""),
          x,
          y,
          size: currentSize,
          op: "TJ",
        });
      }
      placeholderPattern.lastIndex = 0;
      continue;
    }
  }

  // Now cover + redraw each found placeholder block
  for (const block of textBlocks) {
    // Replace all ${key} in the text string with real values
    const filled = block.text.replace(
      /\$\{([a-z_]+)\}/g,
      (_, key) => dataMap[key] ?? "",
    );

    // Estimate the original text width to size the cover rectangle
    const originalWidth = block.text.length * (block.size * 0.55);
    const filledWidth = filled.length * (block.size * 0.55);
    const coverWidth = Math.max(originalWidth, filledWidth, 50);
    const coverHeight = block.size + 4;

    // White cover rectangle over original placeholder text
    page.drawRectangle({
      x: block.x - 1,
      y: block.y - 2,
      width: coverWidth + 10,
      height: coverHeight,
      color: rgb(1, 1, 1),
      opacity: 1,
    });

    // Draw replacement text
    page.drawText(filled, {
      x: block.x,
      y: block.y,
      size: block.size,
      font: font,
      color: rgb(0, 0, 0),
      maxWidth: coverWidth + 50,
    });
  }

  return textBlocks.length; // return count for debugging
}

/* ─────────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────────── */
export function useFillDocument() {
  const [filling, setFilling] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {object} request — full DocumentRequest from API
   *   Must include: resident.user, resident.user.zone,
   *   resident.civil_status, resident.gender, document_type
   */
  const fill = async (request) => {
    setFilling(true);
    setError(null);

    try {
      const templatePath = request?.document_type?.template_path;
      if (!templatePath)
        throw new Error("No template_path set on this document type.");

      // 1. Fetch template
      const url = `${window.location.origin}/storage/${templatePath}`;
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(
          `Could not load template (${res.status}). Check storage path.`,
        );
      const pdfBytes = await res.arrayBuffer();

      // 2. Load into pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
      });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 3. Build the data map
      const dataMap = buildDataMap(request);

      // 4. Fill every page (some docs are multi-page)
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        await fillPlaceholders(pdfDoc, page, dataMap, font, boldFont);
      }

      // 5. Save → blob → open in new tab
      const filledBytes = await pdfDoc.save();
      const blob = new Blob([filledBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error("[useFillDocument]", err);
      setError(err.message);
    } finally {
      setFilling(false);
    }
  };

  return { fill, filling, error };
}

/* ─────────────────────────────────────────────────────────────
   PLACEHOLDER REFERENCE
   ─────────────────────────────────────────────────────────────
   Copy-paste these into your PDF templates:

   ${first_name}       Jhjeralyn Jane
   ${last_name}        Bolasa
   ${full_name}        Jhjeralyn Jane Bolasa
   ${middle_initial}   C
   ${age}              20
   ${birthdate}        January 6, 2004
   ${civil_status}     Single
   ${gender}           Female
   ${house_no}         123
   ${zone}             Zone 4
   ${address}          123, Zone 4, Barangay Bonbon, Cagayan de Oro City
   ${purpose}          Employment
   ${day}              6
   ${month}            January
   ${year}             2026
   ${date}             January 6, 2026
   ${valid_until}      January 6, 2027
   ${series_no}        2026-0001
   ${request_id}       1
   ${document_name}    Barangay Clearance
───────────────────────────────────────────────────────────── */
