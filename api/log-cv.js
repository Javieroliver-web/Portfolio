import { appendLog } from './logger.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const webhookUrl = process.env.DISCORD_CV_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error('[log-cv.js] Error: DISCORD_CV_WEBHOOK_URL no configurado');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const secret = process.env.LOG_SECRET;
    if (secret && req.headers['x-log-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const { timestamp, language, screen, userAgent, page, cvLanguage } = req.body;

    function parseUserAgent(ua) {
        if (!ua) return 'Desconocido';
        if (ua.includes('Edg/')) return 'Edge';
        if (ua.includes('Chrome') && !ua.includes('Edg/')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
        return ua.substring(0, 50);
    }

    const browserName = parseUserAgent(userAgent);
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'IP desconocida';
    const ip = rawIp.split(',').pop().trim();

    const rawCountry = req.headers['x-vercel-ip-country'] || '';
    const rawRegion = req.headers['x-vercel-ip-country-region'] || '';
    const rawCity = req.headers['x-vercel-ip-city'] || '';

    const country = rawCountry ? decodeURIComponent(rawCountry) : '';
    const region = rawRegion ? decodeURIComponent(rawRegion) : '';
    const city = rawCity ? decodeURIComponent(rawCity) : '';

    let location = 'Desconocida';
    if (country) {
        location = `${city}${city ? ', ' : ''}${region}${region ? ' ' : ''}[${country}]`.trim();
    }

    const isVercelBot = userAgent && userAgent.toLowerCase().includes('vercel-screenshot');
    const finalBrowserName = isVercelBot ? `🤖 Vercel Bot (${browserName})` : browserName;

    // Diferenciar el idioma descargado para el mensaje de Discord
    const flagIcon = cvLanguage === 'en' ? '🇬🇧' : '🇪🇸';
    const cvName = cvLanguage === 'en' ? 'Curriculum en Inglés' : 'Curriculum en Español';

    const embed = {
        username: 'Yuki',
        embeds: [
            {
                title: `📄 ¡Han descargado tu CV! ${flagIcon}`,
                description: `Alguien acaba de hacer clic en descargar versión: **${cvName}**`,
                color: 0xffa500, // Naranja para resaltar descargas de CV frente al rojo de proyectos y azul de visitas
                fields: [
                    { name: '🕐 Hora', value: timestamp || 'Desconocida', inline: true },
                    { name: '🌍 Idioma Nav.', value: language || 'Desconocido', inline: true },
                    { name: '🖥️ Pantalla', value: screen || 'Desconocida', inline: true },
                    { name: '🔍 Navegador', value: finalBrowserName, inline: true },
                    { name: '🛡️ IP', value: ip, inline: true },
                    { name: '📍 Ubicación', value: location, inline: false },
                ],
                footer: { text: 'Portfolio | javieroliver-web' },
                timestamp: new Date().toISOString(),
            },
        ],
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[log-cv.js] Error enviando a Discord:", response.status, errorText);
            return res.status(500).json({ error: 'Discord error', details: errorText });
        }

        appendLog('cv_downloads.log', {
            timestamp, cvLanguage, language, screen,
            browser: finalBrowserName, ip, location, page,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[log-cv.js] Excepción Capturada:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
