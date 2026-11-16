// Aviso a Discord de los clics en las redes sociales. Lógica común en _track.js.
import { handleTrack, visitorFields } from './_track.js';

export const SOCIALS = {
    linkedin: { label: 'LinkedIn', emoji: '💼', color: 0x0a66c2 },
    instagram: { label: 'Instagram', emoji: '📸', color: 0xe1306c },
    whatsapp: { label: 'WhatsApp', emoji: '💬', color: 0x25d366 },
    github: { label: 'GitHub', emoji: '💻', color: 0x333333 },
};

export default function handler(req, res) {
    return handleTrack(req, res, {
        name: 'log-social.js',
        webhookEnv: 'DISCORD_SOCIAL_WEBHOOK_URL',
        logFile: 'social-clicks.log',
        logExtra: b => ({ social: b.social }),
        buildEmbed: (body, v) => {
            const meta = SOCIALS[body.social];
            if (!meta) return null;
            return {
                username: 'Vivy',
                embeds: [{
                    title: `${meta.emoji} Clic en ${meta.label} desde el Portfolio`,
                    color: meta.color,
                    fields: [{ name: '📱 Red Social', value: meta.label, inline: true }, ...visitorFields(v)],
                    footer: { text: 'Portfolio | javieroliver-web — Social tracker' },
                    timestamp: new Date().toISOString(),
                }],
            };
        },
    });
}
