import { useState, useRef } from "react";
import { Upload, CheckCircle2, X } from "lucide-react";

interface FileDropzoneProps {
  label: string;
  sublabel: string;
  accept?: string;
  icon?: React.ReactNode;
  name?: string;
  onChange?: (file: File | null) => void; // ✅ Agregamos esto para comunicar el archivo al padre
}

export function FileDropzone({ label, sublabel, accept = "*", icon, name, onChange }: FileDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      onChange?.(f); // ✅ Avisa al formulario del archivo arrastrado
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      onChange?.(f); // ✅ Avisa al formulario del archivo seleccionado
    }
  }

  function removeFile(e: React.MouseEvent) {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null); // ✅ Avisa al formulario que se limpió el archivo
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: dragging
          ? "2px dashed #F7BF16"
          : file
          ? "2px dashed #22c55e"
          : "2px dashed rgba(0,11,111,0.25)",
        borderRadius: 16,
        background: dragging
          ? "rgba(247,191,22,0.06)"
          : file
          ? "rgba(34,197,94,0.05)"
          : "rgba(0,11,111,0.03)",
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        position: "relative",
        userSelect: "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: file ? "rgba(34,197,94,0.1)" : "rgba(0,11,111,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {file ? (
          <CheckCircle2 size={26} color="#22c55e" />
        ) : icon ? (
          icon
        ) : (
          <Upload size={26} color="#000B6F" />
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: file ? "#22c55e" : "#000B6F",
            margin: 0,
          }}
        >
          {file ? file.name : label}
        </p>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "rgba(0,11,111,0.5)",
            margin: "4px 0 0",
          }}
        >
          {file ? `${(file.size / 1024).toFixed(1)} KB` : sublabel}
        </p>
      </div>

      {file && (
        <button
          onClick={removeFile}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.08)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            padding: 4,
            display: "flex",
          }}
        >
          <X size={14} color="#666" />
        </button>
      )}
    </div>
  );
}