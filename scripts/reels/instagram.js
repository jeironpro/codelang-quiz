// Publicacion de reels en Instagram mediante la API Graph.
// Flujo: crear contenedor REELS, esperar a que termine de procesarse y publicar.

const BASE = 'https://graph.facebook.com/v21.0';
const TIEMPO_ESPERA_MS = 8000;
const MAX_INTENTOS = 30;

async function peticion(uri, params) {
  const url = new URL(uri);
  Object.entries(params).forEach(([clave, valor]) => url.searchParams.set(clave, String(valor)));
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  if (!respuesta.ok || datos.error) {
    const mensaje = datos.error?.message ?? `HTTP ${respuesta.status}`;
    throw new Error(`Instagram API: ${mensaje}`);
  }
  return datos;
}

export async function publicarReel({ videoUrl, caption }) {
  const token = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_BUSINESS_ID;
  if (!token || !igUserId) {
    throw new Error('Faltan IG_ACCESS_TOKEN o IG_BUSINESS_ID');
  }

  // Paso 1: crear el contenedor del reel apuntando a la URL publica del video.
  const contenedor = await peticion(`${BASE}/${igUserId}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    share_to_feed: 'true',
    access_token: token,
  });

  // Paso 2: esperar a que Instagram descargue y procese el video.
  let estado = null;
  for (let intento = 0; intento < MAX_INTENTOS; intento += 1) {
    await new Promise((resolver) => setTimeout(resolver, TIEMPO_ESPERA_MS));
    const consulta = await peticion(`${BASE}/${contenedor.id}`, {
      fields: 'status_code,status',
      access_token: token,
    });
    estado = consulta.status_code;
    if (estado === 'FINISHED') break;
    if (estado === 'ERROR') {
      throw new Error(`Instagram no pudo procesar el video: ${consulta.status ?? 'error'}`);
    }
  }
  if (estado !== 'FINISHED') {
    throw new Error('Instagram tardo demasiado en procesar el video');
  }

  // Paso 3: publicar el contenedor ya terminado.
  await peticion(`${BASE}/${igUserId}/media_publish`, {
    creation_id: contenedor.id,
    access_token: token,
  });

  return contenedor.id;
}
