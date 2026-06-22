import "@supabase/functions-js/edge-runtime.d.ts";

// Configuración de CORS para permitir peticiones desde tu app en Vercel sin bloqueos de seguridad
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Función interna blindada para generar el token de acceso seguro mediante JWT hacia Google Drive
async function getGoogleDriveAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  // 1. Limpiar escapes de texto plano '\n' de forma robusta
  const cleanKey = privateKey.replace(/\\n/g, "\n").trim();
  const crypto = globalThis.crypto;

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/drive", // Scope completo para permitir la creación de carpetas y subida de archivos
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodeB64 = (obj: any) => btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const tokenString = `${encodeB64(header)}.${encodeB64(claim)}`;

  // 2. Extrae quirúrgicamente la llave privada aislando cabeceras o comillas residuales
  const matches = cleanKey.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!matches) {
    throw new Error("El formato de la clave DRIVE_PRIVATE_KEY es incorrecto (Faltan encabezados BEGIN/END).");
  }
  
  const pemContents = matches[1].replace(/\s/g, "").replace(/["']/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const rsaKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    rsaKey,
    new TextEncoder().encode(tokenString)
  );

  const signedJwt = `${tokenString}.${btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Detalle de rechazo de Google Auth:", data);
    throw new Error(`Google Auth Error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

// Servidor de la Edge Function en Deno
Deno.serve(async (req) => {
  // Responder de inmediato a las peticiones preflight OPTIONS del navegador (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientEmail = Deno.env.get("DRIVE_CLIENT_EMAIL");
    const privateKey = Deno.env.get("DRIVE_PRIVATE_KEY");

    if (!clientEmail || !privateKey) {
      throw new Error("Las variables de entorno de Google Drive no están configuradas en los Secrets de Supabase.");
    }

    const formData = await req.formData();
    const action = formData.get("action") as string; // Identifica la acción: 'create_folder' o 'upload_file'

    // Generar el token de acceso seguro para la operación actual
    const accessToken = await getGoogleDriveAccessToken(clientEmail, privateKey);

    // =========================================================================
    // OPERACIÓN A: CREAR CARPETA DEL PARTICIPANTE (DENTRO DE LA CARPETA PRINCIPAL)
    // =========================================================================
    if (action === "create_folder") {
      const folderName = formData.get("folder_name") as string || "Nueva Carpeta Participante";
      
      const driveResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          // 👇 TU ID REAL DE CARPETA YA INTEGRADO AQUÍ
          parents: ["1FeRqD2Ng-TRX6hSVE8TLWZUCiLecMZOr"] 
        }),
      });

      const driveData = await driveResponse.json();
      if (!driveResponse.ok) {
        throw new Error(`Google Drive Folder Error: ${JSON.stringify(driveData)}`);
      }

      // Devolvemos el ID de la subcarpeta del participante recién creada
      return new Response(JSON.stringify({ success: true, folderId: driveData.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // OPERACIÓN B: SUBIR ARCHIVOS MULTIPART (DENTRO DE LA SUBCARPETA DEL USUARIO)
    // =========================================================================
    if (action === "upload_file") {
      const file = formData.get("file") as File;
      const folderId = formData.get("folder_id") as string; // El ID de la carpeta del usuario generada en el paso A
      const customName = formData.get("custom_name") as string; // Nombre formateado desde React (ej: Foto_Perfil_V12345)

      if (!file) {
        return new Response(JSON.stringify({ error: "No se encontró ningún archivo para subir en la petición." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Preservar la extensión original del archivo (png, jpg, pdf, etc.)
      const fileExtension = file.name.split('.').pop();
      const finalName = customName ? `${customName}.${fileExtension}` : file.name;

      const metadata: any = { name: finalName, mimeType: file.type };
      if (folderId) metadata.parents = [folderId];

      // Construcción del cuerpo Multipart/Related exigido por la API de Google Drive
      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
      const fileBuffer = await file.arrayBuffer();
      const filePartHeader = `\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`;
      const encoder = new TextEncoder();
      
      const part1 = encoder.encode(metadataPart + filePartHeader);
      const part2 = new Uint8Array(fileBuffer);
      const part3 = encoder.encode(closeDelimiter);

      const body = new Uint8Array(part1.length + part2.length + part3.length);
      body.set(part1, 0);
      body.set(part2, part1.length);
      body.set(part3, part1.length + part2.length);

      const driveResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": body.length.toString(),
        },
        body: body,
      });

      const driveData = await driveResponse.json();
      if (!driveResponse.ok) throw new Error(`Google Drive Upload Error: ${JSON.stringify(driveData)}`);

      return new Response(JSON.stringify({ success: true, fileId: driveData.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Acción no válida o vacía
    return new Response(JSON.stringify({ error: "Acción no válida o no especificada en el formulario." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Fallo crítico capturado en logs de Supabase:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});