// Avisos silenciosos a Discord (a través de /api): visitas, clics en
// proyectos, redes sociales y descargas del CV. Solo en producción.
//
// Historia (16/11/2026): al pasar de js/scripts.js a módulos (16/08/2026) se
// perdieron los avisos de proyectos, redes y CV, y los tres canales llevaban
// tres meses sin recibir nada. Además se quita la cabecera X-Log-Secret: iba
// escrita aquí, a la vista de cualquiera, así que no protegía nada. Ahora el
// servidor solo acepta peticiones de esta web y con límite (api/_track.js).

const isProduction = () => location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';

function baseData() {
    return {
        timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        language: navigator.language || navigator.userLanguage,
        screen: `${screen.width}x${screen.height}`,
        userAgent: navigator.userAgent,
        page: location.href,
    };
}

/** Envía el aviso sin molestar: keepalive para que llegue aunque el enlace cambie de página. */
export function send(endpoint, extra = {}) {
    if (!isProduction()) return;
    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseData(), ...extra }),
        keepalive: true,
    }).catch(() => { });
}

const SOCIAL_LINKS = {
    'linkedin-link': 'linkedin',
    'instagram-link': 'instagram',
    'whatsapp-link': 'whatsapp',
    'github-link': 'github',
    'github-link-profile': 'github',
};

export function initTracking() {
    send('/api/log', { referrer: document.referrer || null });

    // Un solo oyente para toda la página: también vale para tarjetas que se
    // pintan después (filtros, buscador).
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        if (SOCIAL_LINKS[link.id]) {
            send('/api/log-social', { social: SOCIAL_LINKS[link.id] });
        } else if (link.dataset.project) {
            send('/api/log-project', { project: link.dataset.project, action: link.dataset.projectAction || 'web' });
        } else if (link.classList.contains('button--cv')) {
            send('/api/log-cv', { cvLanguage: /-en\.pdf$/i.test(link.getAttribute('href') || '') ? 'en' : 'es' });
        }
    });
}
