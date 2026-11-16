// Aviso a Discord de cada visita al portfolio. Lógica común en _track.js.
import { handleTrack, visitorFields } from './_track.js';

export default function handler(req, res) {
    return handleTrack(req, res, {
        name: 'log.js',
        webhookEnv: 'DISCORD_WEBHOOK_URL',
        logFile: 'visits.log',
        buildEmbed: (_body, v) => ({
            username: '2B',
            embeds: [{
                title: '👤 Nueva visita al Portfolio',
                color: 0x3b82f6,
                fields: visitorFields(v, { referrer: true }),
                footer: { text: 'Portfolio | javieroliver-web' },
                timestamp: new Date().toISOString(),
            }],
        }),
    });
}
