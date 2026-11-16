import { initI18n, languageData } from './modules/i18n.js';
import { initTheme } from './modules/theme.js';
import { initUI, initReadMore, setLanguageData } from './modules/ui.js';
import { initProjects } from './modules/projects.js';
import { initModals } from './modules/modal.js';
import { initContactForm } from './modules/contact.js';
import { initCopyButtons } from './modules/copy.js';
import { initTracking } from './modules/tracking.js';

document.addEventListener("DOMContentLoaded", () => {
    // ── Avisos silenciosos de visitas y clics (solo en producción) ───────────
    initTracking();

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
