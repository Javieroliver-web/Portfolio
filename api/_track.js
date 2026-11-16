// Lógica común de los avisos de visitas y clics a Discord (log, log-project,
// log-social y log-cv). El prefijo "_" hace que Vercel no lo publique como
// función propia.
//
// Por qué (revisión del 16/11/2026): antes cada endpoint era una copia del
// otro y su única protección era la cabecera X-Log-Secret, que iba escrita en
// js/main.js (público): cualquiera podía leerla y llenar los canales de
// Discord. Ahora:
//   - solo se aceptan peticiones desde el propio portfolio (Origin),
//   - hay límite por IP y por instancia,
//   - todo lo que manda el navegador se recorta y los valores con nombre
//     (proyecto, red social, idioma del CV) tienen que ser de la lista.
import { appendLog } from './logger.js';
import { anonymizeIp, clientIp } from './_privacy.js';

export const ALLOWED_ORIGINS = new Set([
    'https://portfolio-javieroliver-web.vercel.app',
]);

const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const PER_IP = 20;   // una visita normal manda 1 aviso y unos pocos clics
const GLOBAL = 200;  // techo por instancia serverless
const perIp = new Map();
let globalHits = [];

export function overLimit(ip, now = Date.now()) {
    globalHits = globalHits.filter(t => now - t < LIMIT_WINDOW_MS);
    const hits = (perIp.get(ip) || []).filter(t => now - t < LIMIT_WINDOW_MS);
    if (hits.length >= PER_IP || globalHits.length >= GLOBAL) return true;
    hits.push(now);
    perIp.set(ip, hits);
    globalHits.push(now);
    if (perIp.size > 5000) perIp.clear();
    return false;
}

/** Para los tests: vacía los contadores. */
export function _resetLimits() { perIp.clear(); globalHits = []; }

/** Texto recortado y sin saltos raros; '' si no es texto. */
export const cap = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '');

function parseUserAgent(ua) {
    if (!ua) return 'Desconocido';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    return ua.substring(0, 50);
}

function decodeHeader(v) {
    if (!v) return '';
    try { return decodeURIComponent(v); } catch { return ''; }
}

function locationOf(req) {
    const country = decodeHeader(req.headers['x-vercel-ip-country']);
    const region = decodeHeader(req.headers['x-vercel-ip-country-region']);
    const city = decodeHeader(req.headers['x-vercel-ip-city']);
    if (!country) return 'Desconocida';
    return `${city}${city ? ', ' : ''}${region}${region ? ' ' : ''}[${country}]`.trim();
}

/**
 * Atiende un aviso. `buildEmbed(body, visitor)` devuelve el mensaje de Discord
 * o null si el cuerpo no es válido (-> 400). `visitor` lleva los datos comunes
 * ya limpios. `logFile`/`logExtra` son para el registro local (solo en desarrollo).
 */
export async function handleTrack(req, res, { name, webhookEnv, buildEmbed, logFile, logExtra = () => ({}) }) {
    const origin = req.headers.origin || '';
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: 'Origin not allowed' });

    const rawIp = clientIp(req);
    if (overLimit(rawIp)) return res.status(429).json({ error: 'Too many requests' });

    const webhookUrl = process.env[webhookEnv];
    if (!webhookUrl) {
        console.error(`[${name}] ${webhookEnv} no configurado`);
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const ua = cap(body.userAgent, 300);
    const browser = parseUserAgent(ua);
    const visitor = {
        timestamp: cap(body.timestamp, 40) || 'Desconocida',
        language: cap(body.language, 20) || 'Desconocido',
        screen: cap(body.screen, 20) || 'Desconocida',
        page: cap(body.page, 200) || 'Desconocida',
        referrer: cap(body.referrer, 200),
        browser: ua.toLowerCase().includes('vercel-screenshot') ? `🤖 Vercel Bot (${browser})` : browser,
        ip: anonymizeIp(rawIp),
        location: locationOf(req),
    };

    const embed = buildEmbed(body, visitor);
    if (!embed) return res.status(400).json({ error: 'Invalid request body' });

    try {
        const r = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed),
        });
        if (!r.ok) {
            // El detalle de Discord se queda en el log del servidor, no se le
            // devuelve a quien hizo la petición.
            console.error(`[${name}] Discord respondió`, r.status, await r.text());
            return res.status(502).json({ error: 'Discord error' });
        }
        if (logFile) appendLog(logFile, { ...visitor, ...logExtra(body) });
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error(`[${name}] Excepción enviando a Discord:`, err.message);
        return res.status(502).json({ error: 'Discord error' });
    }
}

/** Campos comunes del visitante para el embed. */
export function visitorFields(v, { referrer = false } = {}) {
    return [
        { name: '🕐 Hora', value: v.timestamp, inline: true },
        { name: '🌍 Idioma', value: v.language, inline: true },
        { name: '🖥️ Pantalla', value: v.screen, inline: true },
        ...(referrer ? [{ name: '🔗 Referrer', value: v.referrer || 'Acceso directo', inline: false }] : []),
        { name: '🌐 Página', value: v.page, inline: false },
        { name: '🔍 Navegador', value: v.browser, inline: true },
        { name: '🛡️ IP (anonimizada)', value: v.ip, inline: true },
        { name: '📍 Ubicación', value: v.location, inline: false },
    ];
}
