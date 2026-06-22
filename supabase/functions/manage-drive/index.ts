import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Nueva función ultra-simple para actualizar el Token de Acceso usando tu cuenta real
async function getGoogleDriveAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Error al refrescar token de Google:", data);
    throw new Error(`Google OAuth Error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Nuevas variables secretas de usuario real
    const clientId = Deno.env.get("DRIVE_CLIENT_ID");
    const clientSecret = Deno.env.get("DRIVE_CLIENT_SECRET");
    const refreshToken = Deno.env.get("DRIVE_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Faltan configurar las nuevas variables OAuth2 (DRIVE_CLIENT_ID, DRIVE_CLIENT_SECRET o DRIVE_REFRESH_TOKEN) en Supabase.");
    }

    const formData = await req.formData();
    const action = formData.get("action") as string;

    // Generar el token de acceso seguro simulando a tu usuario real
    const accessToken = await getGoogleDriveAccessToken(clientId, clientSecret, refreshToken);

    // =========================================================================
    // OPERACIÓN A: CREAR CARPETA DEL PARTICIPANTE
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
          parents: ["1FeRqD2Ng-TRX6hSVE8TLWZUCiLecMZOr"] // Tu ID real de carpeta principal
        }),
      });

      const driveData = await driveResponse.json();
      if (!driveResponse.ok) {
        throw new Error(`Google Drive Folder Error: ${JSON.stringify(driveData)}`);
      }

      return new Response(JSON.stringify({ success: true, folderId: driveData.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // OPERACIÓN B: SUBIR ARCHIVOS (¡Ahora con los permisos de tu cuenta real!)
    // =========================================================================
    if (action === "upload_file") {
      const file = formData.get("file") as File;
      const folderId = formData.get("folder_id") as string;
      const customName = formData.get("custom_name") as string;

      if (!file) {
        return new Response(JSON.stringify({ error: "No se encontró ningún archivo para subir en la petición." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fileExtension = file.name.split('.').pop();
      const finalName = customName ? `${customName}.${fileExtension}` : file.name;

      const metadata: any = { name: finalName, mimeType: file.type };
      if (folderId) metadata.parents = [folderId];

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

    return new Response(JSON.stringify({ error: "Acción no válida o no especificada." }), {
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