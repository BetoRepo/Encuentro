import { useState, useRef } from "react";
import { Upload } from "lucide-react"; // O la librería de iconos que uses

interface FileDropzoneProps {
  label: string;
  sublabel?: string;
  accept?: string;
  icon?: React.ReactNode;
  onFileSelect: (file: File | null) => void;
}

export function FileDropzone({ label, sublabel, accept, icon, onFileSelect }: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manejar cuando se selecciona un archivo a través del explorador
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      onFileSelect(selectedFile); // ✅ Propaga el objeto File real al estado de Inscripcion
    }
  };

  // Manejar el arrastre (Drag & Drop)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFileName(droppedFile.name);
      onFileSelect(droppedFile); // ✅ Propaga el objeto File real al estado de Inscripcion
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: dragActive ? "2px dashed #D7007E" : "2px dashed rgba(0,11,111,0.2)",
        backgroundColor: dragActive ? "rgba(215,0,126,0.05)" : "#FAFBFF",
        borderRadius: 12,
        padding: "20px 16px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <div style={{ color: dragActive ? "#D7007E" : "#000B6F" }}>
        {icon || <Upload size={24} />}
      </div>

      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#000B6F" }}>
        {fileName ? `Cambiar: ${fileName}` : label}
      </div>
      {sublabel && !fileName && (
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(0,11,111,0.5)" }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}