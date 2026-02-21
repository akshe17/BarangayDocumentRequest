import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../axious/api";
import DocumentToast from "../../components/admin/DocumentToast";
import DocumentList from "../../components/admin/DocumentList";
import DocumentForm from "../../components/admin/DocumentForm";
const DocumentsManagement = () => {
  // ── View ─────────────────────────────────────────────────────────────────
  const [view, setView] = useState("list");
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ── List ─────────────────────────────────────────────────────────────────
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ── Form ─────────────────────────────────────────────────────────────────
  const [docName, setDocName] = useState("");
  const [docFee, setDocFee] = useState("");
  const [docStatus, setDocStatus] = useState(true);
  const [documentFile, setDocumentFile] = useState(null);
  const [existingFilePath, setExistingFilePath] = useState("");
  const [removeFile, setRemoveFile] = useState(false);
  const [requirements, setRequirements] = useState([
    { requirement_name: "", description: "" },
  ]);
  const [fields, setFields] = useState([
    { field_label: "", field_type: "text", is_required: true },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fileInputRef = useRef(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSelectedDoc(null);
    setDocName("");
    setDocFee("");
    setDocStatus(true);
    setDocumentFile(null);
    setExistingFilePath("");
    setRemoveFile(false);
    setRequirements([{ requirement_name: "", description: "" }]);
    setFields([{ field_label: "", field_type: "text", is_required: true }]);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── GET /api/document-types ───────────────────────────────────────────────
  const fetchDocumentTypes = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const { data } = await api.get("/document-types");
      setDocumentTypes(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      setListError(
        err.response?.data?.message || err.message || "Failed to load.",
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  // ── Open edit form ────────────────────────────────────────────────────────
  const handleEditDoc = (doc) => {
    setSelectedDoc(doc);
    setDocName(doc.document_name);
    setDocFee(doc.fee);
    setDocStatus(!!doc.in_use);
    setDocumentFile(null);
    setExistingFilePath(doc.template_path ?? "");
    setRemoveFile(false);
    setRequirements(
      doc.requirements?.length
        ? doc.requirements.map((r) => ({
            requirement_id: r.requirement_id,
            requirement_name: r.requirement_name,
            description: r.description ?? "",
          }))
        : [{ requirement_name: "", description: "" }],
    );
    setFields(
      doc.form_fields?.length
        ? doc.form_fields.map((f) => ({
            field_id: f.field_id,
            field_label: f.field_label,
            field_type: f.field_type,
            is_required: !!f.is_required,
          }))
        : [{ field_label: "", field_type: "text", is_required: true }],
    );
    setFormError(null);
    setView("add");
  };

  // ── Open assigned document file ───────────────────────────────────────────
  const handleOpenFile = (doc) => {
    const path = doc?.template_path;
    if (!path) return;
    // Build full URL — adjust base if your API URL differs
    const baseUrl = api.defaults?.baseURL?.replace(/\/api$/, "") ?? "";
    const fileUrl = path.startsWith("http")
      ? path
      : `${baseUrl}/storage/${path}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // ── File helpers ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setRemoveFile(false);
    }
  };

  const handleRemoveFile = () => {
    setDocumentFile(null);
    setExistingFilePath("");
    setRemoveFile(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayFileName = documentFile
    ? documentFile.name
    : existingFilePath
      ? existingFilePath.split("/").pop()
      : null;

  // ── POST / PUT ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!docName.trim()) {
      setFormError("Document name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("document_name", docName.trim());
    formData.append("fee", parseFloat(docFee) || 0);
    formData.append("in_use", docStatus ? 1 : 0);

    if (documentFile) formData.append("template_file", documentFile);
    if (removeFile) formData.append("remove_template", 1);

    const reqs = requirements.filter((r) => r.requirement_name.trim());
    reqs.forEach((r, i) => {
      if (r.requirement_id)
        formData.append(`requirements[${i}][requirement_id]`, r.requirement_id);
      formData.append(
        `requirements[${i}][requirement_name]`,
        r.requirement_name.trim(),
      );
      formData.append(
        `requirements[${i}][description]`,
        (r.description ?? "").trim(),
      );
    });

    const flds = fields.filter((f) => f.field_label.trim());
    flds.forEach((f, i) => {
      if (f.field_id)
        formData.append(`form_fields[${i}][field_id]`, f.field_id);
      formData.append(`form_fields[${i}][field_label]`, f.field_label.trim());
      formData.append(`form_fields[${i}][field_type]`, f.field_type);
      formData.append(`form_fields[${i}][is_required]`, f.is_required ? 1 : 0);
    });

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (selectedDoc) {
        await api.post(
          `/document-types/${selectedDoc.document_id}`,
          formData,
          config,
        );
        showToast("Template updated successfully.");
      } else {
        await api.post("/document-types", formData, config);
        showToast("Template created successfully.");
      }
      await fetchDocumentTypes();
      setView("list");
      resetForm();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        err.message ||
        "Something went wrong.";
      setFormError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle status ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (e, doc) => {
    e.stopPropagation();
    const newVal = doc.in_use ? 0 : 1;
    setDocumentTypes((prev) =>
      prev.map((d) =>
        d.document_id === doc.document_id ? { ...d, in_use: newVal } : d,
      ),
    );
    try {
      await api.patch(`/document-types/${doc.document_id}`, { in_use: newVal });
    } catch (err) {
      setDocumentTypes((prev) =>
        prev.map((d) =>
          d.document_id === doc.document_id ? { ...d, in_use: doc.in_use } : d,
        ),
      );
      showToast(
        err.response?.data?.message || "Failed to update status.",
        "error",
      );
    }
  };

  // ── Mutators ──────────────────────────────────────────────────────────────
  const addReq = () =>
    setRequirements((p) => [...p, { requirement_name: "", description: "" }]);
  const removeReq = (i) =>
    setRequirements((p) => p.filter((_, idx) => idx !== i));
  const updateReq = (i, k, v) =>
    setRequirements((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });

  const addField = () =>
    setFields((p) => [
      ...p,
      { field_label: "", field_type: "text", is_required: true },
    ]);
  const removeField = (i) => setFields((p) => p.filter((_, idx) => idx !== i));
  const updateField = (i, k, v) =>
    setFields((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredDocs = documentTypes.filter((doc) => {
    const matchSearch = doc.document_name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && doc.in_use) ||
      (filter === "inactive" && !doc.in_use);
    return matchSearch && matchFilter;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  if (view === "add") {
    return (
      <DocumentForm
        selectedDoc={selectedDoc}
        docName={docName}
        setDocName={setDocName}
        docFee={docFee}
        setDocFee={setDocFee}
        docStatus={docStatus}
        setDocStatus={setDocStatus}
        documentFile={documentFile}
        existingFilePath={existingFilePath}
        displayFileName={displayFileName}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        onOpenFile={handleOpenFile}
        requirements={requirements}
        addReq={addReq}
        removeReq={removeReq}
        updateReq={updateReq}
        fields={fields}
        addField={addField}
        removeField={removeField}
        updateField={updateField}
        saving={saving}
        formError={formError}
        handleSave={handleSave}
        onBack={() => {
          setView("list");
          resetForm();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentToast toast={toast} />
      <DocumentList
        documentTypes={documentTypes}
        loadingList={loadingList}
        listError={listError}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filteredDocs={filteredDocs}
        onEdit={handleEditDoc}
        onToggleStatus={handleToggleStatus}
        onOpenFile={handleOpenFile}
        onNew={() => {
          resetForm();
          setView("add");
        }}
        onRetry={fetchDocumentTypes}
      />
    </div>
  );
};

export default DocumentsManagement;
