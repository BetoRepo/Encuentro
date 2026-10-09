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

      // El código se valida en la base de datos: los códigos de las insignias no son visibles para los participantes.
      const { data, error } = await supabase.rpc("reclamar_insignia", { p_codigo: codigo });
      const resultado = Array.isArray(data) ? data[0] : data;

      if (error) setMensaje("Error al reclamar la insignia.");
      else if (!resultado) setMensaje("La insignia no existe.");
      else if (resultado.ya_la_tenia) setMensaje(`¡Ya tenías la insignia "${resultado.nombre}" en tu perfil! ⚜️`);
      else setMensaje(`¡Felicidades! Ganaste la insignia "${resultado.nombre}" 🎉`);
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