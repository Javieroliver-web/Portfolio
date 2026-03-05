export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Webhook proporcionado anteriormente o variable de entorno
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1478670444197314722/HFh25OqSJUtdRMERUISdYwUYf9QW6ROHZWJxaLrI8JEnXlAvs_WChmoN_F_MgSAZYFMA";

    if (!webhookUrl) {
        console.error("[log.js] Error: Webhook not configured");
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const { timestamp, referrer, language, screen, userAgent, page } = req.body;

    // Función auxiliar para parsear el navegador
    function parseUserAgent(ua) {
        if (!ua) return 'Desconocido';
        if (ua.includes('Edg/')) return 'Edge';
        if (ua.includes('Chrome') && !ua.includes('Edg/')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
        return ua.substring(0, 50); // Fallback: Raw UA truncado
    }

    const browserName = parseUserAgent(userAgent);

    // Obtener la IP del usuario (Vercel inyecta x-forwarded-for)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'IP desconocida';

    // Obtener localización (Vercel inyecta estas cabeceras automáticamente)
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

    // Detectar si es un bot de Vercel (Generador de capturas/previsualizaciones)
    const isVercelBot = userAgent && userAgent.toLowerCase().includes('vercel-screenshot');
    const finalBrowserName = isVercelBot ? `🤖 Vercel Bot (${browserName})` : browserName;

    const embed = {
        username: '2B',
        embeds: [
            {
                title: '👤 Nueva visita al Portfolio',
                color: 0x3b82f6,
                fields: [
                    { name: '🕐 Hora', value: timestamp || 'Desconocida', inline: true },
                    { name: '🌍 Idioma', value: language || 'Desconocido', inline: true },
                    { name: '🖥️ Pantalla', value: screen || 'Desconocida', inline: true },
                    { name: '🔗 Referrer', value: referrer || 'Acceso directo', inline: false },
                    { name: '🌐 Página', value: page || 'Desconocida', inline: false },
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
            console.error("[log.js] Error enviando a Discord:", response.status, errorText);
            return res.status(500).json({ error: 'Discord error', details: errorText });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[log.js] Excepción Capturada:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
