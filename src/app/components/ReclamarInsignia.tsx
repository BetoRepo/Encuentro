import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export function ReclamarInsignia() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codigo = searchParams.get("code");
  const [mensaje, setMensaje] = useState("Procesando tu insignia...");

  useEffect(() => {
    async function reclamar() {
      const userRaw = localStorage.getItem("enj_user");
      if (!userRaw) {
        alert("Debes iniciar sesión para reclamar tu insignia.");
        return navigate("/login");
      }
      const user = JSON.parse(userRaw);

      if (!codigo) return setMensaje("Código QR inválido.");

      // 1. Obtener la insignia por su código
      const { data: insignia, error: errInsignia } = await supabase
        .from("insignias")
        .select("id, nombre")
        .eq("codigo", codigo)
        .single();

      if (errInsignia || !insignia) return setMensaje("La insignia no existe.");

      // 2. Registrar en la tabla participante_insignias
      const { error: insertError } = await supabase
        .from("participante_insignias")
        .insert([{ user_id: user.id, insignia_id: insignia.id, otorgado_por: "QR_POSTA" }]);

      if (insertError) {
        if (insertError.code === "23505") { // Violación de unicidad
          setMensaje(`¡Ya tenías la insignia "${insignia.nombre}" en tu perfil! ⚜️`);
        } else {
          setMensaje("Error al reclamar la insignia.");
        }
      } else {
        setMensaje(`¡Felicidades! Ganaste la insignia "${insignia.nombre}" 🎉`);
      }
    }
    reclamar();
  }, [codigo]);

  return (
    <div style={{ textAlign: "center", padding: 40, color: "#000B6F" }}>
      <h2>{mensaje}</h2>
      <button onClick={() => navigate("/perfil")} style={{ marginTop: 20, padding: "10px 20px" }}>
        Ir a mi Perfil
      </button>
    </div>
  );
}