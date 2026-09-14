// Receptor de errores de JavaScript de las webs de Javier (Portfolio, Carnicería
// y BecaMax). Cada web los manda con navigator.sendBeacon y este endpoint los
// reenvía a Discord, para que un fallo en producción llegue a Javier en vez de
// perderse en la consola de un visitante.
//
// La URL del webhook no puede ir en el código de las webs (sería pública y
// cualquiera podría escribir en el canal), por eso pasa por aquí.
//
// Webhook: DISCORD_ERRORS_WEBHOOK_URL (canal propio de errores) o, si no está,
// DISCORD_WEBHOOK_URL (el de las visitas).

const ALLOWED_ORIGINS = new Set([
    'https://portfolio-javieroliver-web.vercel.app',
    'https://javieroliver-web.github.io', // Portfolio y Carnicería en GitHub Pages
    'https://becamax.vercel.app',
]);

const SITES = { portfolio: 'Portfolio', carniceria: 'Carnicería Raúl Oliver', becamax: 'BecaMax' };

// Deduplicado por instancia: el mismo error repetido en bucle en un navegador
// no debe inundar el canal. No persiste entre instancias serverless, pero
// corta las ráfagas, que es lo que importa (el cliente además limita a 5).
const recent = new Map();
const DEDUPE_MS = 10 * 60 * 1000;

const cap = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export default async function handler(req, res) {
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: 'Origin not allowed' });

    const webhookUrl = process.env.DISCORD_ERRORS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.error('[error.js] Sin DISCORD_ERRORS_WEBHOOK_URL ni DISCORD_WEBHOOK_URL');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    // sendBeacon manda text/plain para evitar el preflight CORS: llega como string.
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
    }
    if (!body || typeof body !== 'object' || !SITES[body.site]) {
        return res.status(400).json({ error: 'Invalid report' });
    }

    const report = {
        site: SITES[body.site],
        type: cap(body.type, 20) || 'error',
        message: cap(body.message, 300) || '(sin mensaje)',
        source: cap(body.source, 200),
        line: Number.isFinite(body.line) ? body.line : null,
        col: Number.isFinite(body.col) ? body.col : null,
        stack: cap(body.stack, 900),
        page: cap(body.page, 200),
        userAgent: cap(req.headers['user-agent'], 160),
    };

    const key = `${report.site}|${report.message}|${report.source}:${report.line}`;
    const now = Date.now();
    for (const [k, t] of recent) if (now - t > DEDUPE_MS) recent.delete(k);
    if (recent.has(key)) return res.status(202).json({ ok: true, deduplicated: true });
    recent.set(key, now);

    const where = report.source ? `${report.source}${report.line ? `:${report.line}:${report.col ?? 0}` : ''}` : '—';
    const payload = {
        username: 'Errores web',
        embeds: [{
            title: `🚨 ${report.site}: error de JavaScript`,
            color: 0xef4444,
            description: '```' + report.message.replace(/```/g, "'''") + '```',
            fields: [
                { name: 'Tipo', value: report.type, inline: true },
                { name: 'Dónde', value: where.slice(0, 1000), inline: false },
                { name: 'Página', value: report.page || '—', inline: false },
                { name: 'Navegador', value: report.userAgent || '—', inline: false },
                ...(report.stack ? [{ name: 'Traza', value: '```' + report.stack.replace(/```/g, "'''").slice(0, 990) + '```', inline: false }] : []),
            ],
            timestamp: new Date().toISOString(),
        }],
    };

    try {
        const r = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!r.ok) {
            console.error('[error.js] Discord respondió', r.status, await r.text());
            return res.status(502).json({ error: 'Discord error' });
        }
        return res.status(202).json({ ok: true });
    } catch (err) {
        console.error('[error.js] Excepción enviando a Discord:', err.message);
        return res.status(502).json({ error: 'Discord error' });
    }
}
