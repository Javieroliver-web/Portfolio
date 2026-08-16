import { initI18n, languageData } from './modules/i18n.js';
import { initTheme } from './modules/theme.js';
import { initUI, initReadMore, setLanguageData } from './modules/ui.js';
import { initProjects } from './modules/projects.js';
import { initModals } from './modules/modal.js';
import { initContactForm } from './modules/contact.js';
import { initCopyButtons } from './modules/copy.js';

document.addEventListener("DOMContentLoaded", () => {
    // ── Tracking silencioso de visitas (solo en producción) ──────────────────
    const initVisitLogger = () => {
        const isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
        if (!isProduction) return;

        const visitData = {
            timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
            referrer: document.referrer || null,
            language: navigator.language || navigator.userLanguage,
            screen: `${screen.width}x${screen.height}`,
            userAgent: navigator.userAgent,
            page: location.href,
        };
        fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Log-Secret': 'pf-log-9x3k7m2w8q4e1r6t0y5',
            },
            body: JSON.stringify(visitData),
        }).catch(() => { }); // silencioso
    };
    initVisitLogger();

    // ── Inicialización de módulos ────────────────────────────────────────────
    
    // 1. Inicializar tema y colores
    initTheme();
    
    // 2. Inicializar i18n
    initI18n();

    // 3. Compartir languageData con UI e inicializar interfaz
    setLanguageData(languageData);
    initUI();
    setTimeout(initReadMore, 500); // Pequeño retraso para asegurar inyección de textos

    // 4. Inicializar Lógica de Proyectos (Filtros, Galería)
    initProjects();

    // 5. Inicializar Modales (Ayesa y Lightbox con A11y)
    initModals();

    // 6. Inicializar Formulario de Contacto (Spam control y AJAX)
    initContactForm();

    // 7. Inicializar Botones de Copiar y Notificaciones (Toast)
    initCopyButtons();
});
