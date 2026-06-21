import "@supabase/functions-js/edge-runtime.d.ts";

// Configuración de CORS para que tu página de Vercel pueda enviar archivos sin bloqueos de seguridad
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Función interna para generar el token de acceso seguro hacia Google Drive v3
async function getGoogleDriveAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const cleanKey = privateKey.replace(/\\n/g, "\n");
  const crypto = globalThis.crypto;

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodeB64 = (obj: any) => btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const tokenString = `${encodeB64(header)}.${encodeB64(claim)}`;

  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = cleanKey.substring(pemHeader.length, cleanKey.length - pemFooter.length).replace(/\s/g, "");
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
  if (!response.ok) throw new Error(`Google Auth Error: ${data.error_description || data.error}`);
  return data.access_token;
}

// Servidor de la Edge Function
Deno.serve(async (req) => {
  // Responder inmediatamente a las peticiones de control CORS del navegador
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Tomar las credenciales ocultas del servidor de Supabase
    const clientEmail = Deno.env.get("DRIVE_CLIENT_EMAIL");
    const privateKey = Deno.env.get("DRIVE_PRIVATE_KEY");

    if (!clientEmail || !privateKey) {
      throw new Error("Las variables de entorno de Google Drive no están configuradas en Supabase.");
    }

    // Procesar el archivo enviado desde tu formulario de React
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string; // Por si deseas meterlo en una carpeta específica

    if (!file) {
      return new Response(JSON.stringify({ error: "No se encontró ningún archivo para subir." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Autenticar con Google de forma invisible
    const accessToken = await getGoogleDriveAccessToken(clientEmail, privateKey);

    // Configurar metadatos del archivo para la API de Google
    const metadata: any = { name: file.name, mimeType: file.type };
    if (folderId) metadata.parents = [folderId];

    // Construir el cuerpo Multipart para enviar metadatos + binario del archivo
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

    // Subir el archivo a Google Drive
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
    if (!driveResponse.ok) throw new Error(`Google Drive API Error: ${JSON.stringify(driveData)}`);

    // Responder a Vercel con el ID del archivo guardado con éxito
    return new Response(JSON.stringify({ success: true, fileId: driveData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});