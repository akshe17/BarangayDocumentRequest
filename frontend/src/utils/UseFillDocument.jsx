import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import api from "../axious/api";

export function useFillDocument() {
  const [filling, setFilling] = useState(false);

  // Helper to prepare the data exactly as the PDF fields expect them
  const buildDataMap = (request) => {
    const resi = request?.resident ?? {};
    const user = resi?.user ?? {};
    const today = new Date();

    // Calculate Age
    const birth = resi.birthdate ? new Date(resi.birthdate) : null;
    let age = "N/A";
    if (birth) {
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    }

    return {
      // These keys MUST match the "Name" you gave the text fields in the PDF editor
      last_name: (user.last_name || "").toUpperCase(),
      first_name: (user.first_name || "").toUpperCase(),
      "M.I": user.middle_initial ? `${user.middle_initial}.` : "",
      age_text: `${age} years old`.toUpperCase(),
      civil_status: (resi.civil_status?.status_name || "N/A").toUpperCase(),
      birthday_text: resi.birthdate
        ? new Date(resi.birthdate).toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      address_text:
        `${resi.house_no || ""}, ${user.zone?.zone_name || ""}, Bonbon, CDO`.toUpperCase(),
      purpose_text: (request.purpose || "General Purpose").toUpperCase(),
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

  const fill = async (request) => {
    if (!request) return;
    setFilling(true);

    try {
      const templatePath = request?.document_type?.template_path;

      // 1. Get the PDF file from your server
      const res = await api.get(`/clerk/template`, {
        params: { path: templatePath },
        responseType: "arraybuffer",
      });

      // 2. Load the PDF document
      const pdfDoc = await PDFDocument.load(res.data);

      // 3. Access the form fields
      const form = pdfDoc.getForm();
      const data = buildDataMap(request);

      // 4. Fill each field
      Object.keys(data).forEach((fieldName) => {
        try {
          const field = form.getTextField(fieldName);
          field.setText(String(data[fieldName]));
        } catch (err) {
          // This just means the specific PDF doesn't have this field, which is fine
          console.warn(`Field "${fieldName}" not found in this PDF template.`);
        }
      });

      // 5. Flatten (important: this makes the text permanent so it can't be edited)
      form.flatten();

      // 6. Save and Open
      const filledBytes = await pdfDoc.save();
      const blob = new Blob([filledBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error generating PDF. Check console for details.");
    } finally {
      setFilling(false);
    }
  };

  return { fill, filling };
}
