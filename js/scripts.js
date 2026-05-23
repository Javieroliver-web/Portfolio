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
                // Cabecera de seguridad compartida con el servidor para bloquear peticiones externas
                'X-Log-Secret': 'pf-log-9x3k7m2w8q4e1r6t0y5',
            },
            body: JSON.stringify(visitData),
        }).catch(() => { }); // silencioso: no muestra errores al usuario
    };
    initVisitLogger();
    // ────────────────────────────────────────────────────────────────────────

    // ── Soporte de teclado (A11y) ───────────────────────────────────────────
    document.addEventListener("keydown", (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
            e.preventDefault(); // Evitar scroll al pulsar espacio
            e.target.click();
        }
    });
    // ────────────────────────────────────────────────────────────────────────

    // ── Referencias a elementos del DOM ─────────────────────────────────────
    const toggleTheme = document.getElementById("toggle-icon");
    const toggleIcon = document.getElementById("toggle-image");
    const toggleText = document.getElementById("toggle-text");
    const toggleColors = document.getElementById("toggle-colors");
    const rootStyles = document.documentElement.style;
    const flagsElement = document.getElementById("flags");
    const textsToChange = document.querySelectorAll("[data-section]");
    // ────────────────────────────────────────────────────────────────────────

    // ── Estado de idioma (restaurado desde localStorage) ─────────────────────
    let currentLanguage = localStorage.getItem('portfolio-lang') || 'es';
    let languageData = {};
    // ────────────────────────────────────────────────────────────────────────

    // ── Restaurar preferencias guardadas (tema, color y idioma) ─────────────
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
        toggleIcon.src = 'assets/icons/sun.png';
    }
    const savedHue = localStorage.getItem('portfolio-hue');
    const savedSat = localStorage.getItem('portfolio-sat');
    const savedLight = localStorage.getItem('portfolio-light');
    // Si el usuario ya eligió un color, lo restauramos; si no, aplicamos azul por defecto
    const defaultHue = '214';
    const defaultSat = '84%';
    const defaultLight = '56%';
    const activeHue = savedHue || defaultHue;
    const activeSat = savedSat || defaultSat;
    const activeLight = savedLight || defaultLight;
    rootStyles.setProperty('--primary-hue', activeHue);
    rootStyles.setProperty('--primary-sat', activeSat);
    rootStyles.setProperty('--primary-light', activeLight);
    // Marcar visualmente el color activo en el picker
    document.querySelectorAll('.colors__item').forEach(item => {
        item.classList.remove('colors__item--active');
    });
    const activeItem = document.querySelector(`.colors__item[data-hue="${activeHue}"]`);
    if (activeItem) {
        activeItem.classList.add('colors__item--active');
    }
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Actualiza el texto del botón de tema (Modo Oscuro / Modo Claro)
     * según el estado actual del body y el idioma activo.
     * No hace nada si aún no se ha cargado el idioma.
     */
    const updateToggleText = () => {
        if (!languageData.theme) return;

        if (document.body.classList.contains("dark")) {
            toggleText.textContent = languageData.theme["mode-dark"];
        } else {
            toggleText.textContent = languageData.theme["mode-white"];
        }
    };

    // ── Objeto de traducciones (ES / EN) ─────────────────────────────────────
    const translations = {
        "es": {
            "theme": { "mode-dark": "Modo Oscuro", "mode-white": "Modo Claro" },
            "profile": {
                "rol": "DESARROLLADOR WEB<br>FULL-STACK JUNIOR",
                "description": "He adquirido conocimientos en diversas tecnologías durante mis estudios y experiencia laboral. Afronto mi futuro con ambición, manteniendo una actitud positiva y segura en todo lo que hago. Disfruto mucho del trabajo en equipo con personas de todas las edades, ya que me permite escuchar distintas perspectivas y aprender continuamente."
            },
            "experiences": {
                "section-title": "Experiencia",
                "ayesa-meta": "Ayesa · Contrato de prácticas · Sevilla, Andalucía, España · Híbrido",
                "first-job-title": "Desarrollador Full Stack Junior",
                "first-job-dates": "Febrero 2026 - Actualidad",
                "first-job-description": "Prácticas de segundo curso de FP Grado Superior de Desarrollo de Aplicaciones Web (DAW).",
                "second-job-title": "Actividades de programación informática",
                "second-job-dates": "Noviembre 2023 - Noviembre 2024",
                "second-job-description": "Participé en el mantenimiento de la plataforma \"Secretaria Virtual\". Utilicé tecnologías como Java, SQL y PL/SQL. Mi responsabilidad principal fue llevar a cabo los cambios solicitados en la base de datos y participar en las correcciones de errores de la web junto a mi equipo. Utilicé Git para el control de versiones.",
                "third-job-title": "Desarrollador Front-End Junior",
                "third-job-dates": "Marzo 2023 - Junio 2023",
                "third-job-description": "Prácticas de primer curso de FP Grado Medio Sistemas Microinformáticos y Redes (SMR)."
            },
            "education": {
                "section-title": "Educación",
                "skills-label": "Aptitudes",
                "first-edu-title": "Ciclo Formativo de Grado Superior, Desarrollo de Aplicaciones Web",
                "first-edu-school": "Centro Educativo Altair",
                "first-edu-dates": "sept. 2025 - jul. 2026",
                "first-edu-description": "Segundo año de Grado Superior de Desarrollo de Aplicaciones Web (DAW).",
                "first-edu-btn": "Ver notas",
                "second-edu-title": "Ciclo Formativo de Grado Superior, Desarrollo de Aplicaciones Web",
                "second-edu-school": "MEDAC",
                "second-edu-dates": "sept. 2024 - jul. 2025",
                "second-edu-description": "Primer año de Grado Superior de Desarrollo de Aplicaciones Web (DAW). Nota: 6.41",
                "third-edu-title": "Formación Profesional de Grado Medio, Sistemas Microinformáticos y Redes",
                "third-edu-school": "Diocesanos Nuestra Señora de las Mercedes Sevilla",
                "third-edu-dates": "",
                "third-edu-description": "Nota: 8.1"
            },
            "licenses": {
                "section-title": "Licencias y certificaciones",
                "license-1-title": "Permiso de conducción B",
                "license-1-issuer": "Dirección General de Tráfico",
                "license-1-dates": "Expedición nov. 2024 · Vencimiento: nov. 2034",
                "ayesa-certs-title": "Cursos y certificados Ayesa",
                "ayesa-certs-issuer": "Ayesa · 8 certificados",
                "ayesa-certs-btn": "Ver documentos",
                "modal-title": "Cursos y certificados Ayesa",
                "modal-subtitle": "8 certificados emitidos por Ayesa",
                "cert-1-title": "Certificado Curso Seguridad de la Información",
                "cert-1-btn": "Previsualizar",
                "cert-2-title": "Certificado Curso Prevención Riesgos Laborales",
                "cert-2-btn": "Previsualizar",
                "cert-3-title": "Certificado Reglamento Protección de Datos",
                "cert-3-btn": "Previsualizar",
                "cert-4-title": "Certificado Gestión Ambiental",
                "cert-4-btn": "Previsualizar",
                "cert-5-title": "Certificado Personal Expuesto",
                "cert-5-btn": "Previsualizar",
                "cert-6-title": "Certificado Reciclaje Riesgos Laborales",
                "cert-6-btn": "Previsualizar",
                "cert-7-title": "Certificado Continuidad de Negocio",
                "cert-7-btn": "Previsualizar",
                "cert-8-title": "Certificado Igualdad de Oportunidades en la Empresa",
                "cert-8-btn": "Previsualizar"
            },
            "projects": {
                "section-title": "Proyectos",
                "filter-all": "Todos",
                "sort-default": "Por defecto",
                "sort-newest": "Más recientes",
                "sort-oldest": "Más antiguos",
                "sort-az": "Alfabético (A-Z)",
                "sort-za": "Alfabético (Z-A)",
                "first-project-title": "Portfolio web",
                "first-project-date": "Iniciado en Junio 2025",
                "first-project-description": "<p>Mi portfolio personal, diseñado y desarrollado desde cero como un proyecto vivo que refleja mi evolución como desarrollador Full-Stack.</p><p style=\"margin-top: 0.8rem;\">El frontend está construido con <strong>HTML, CSS y JavaScript Vanilla</strong>, implementando una arquitectura modular con soporte multi-idioma, temas dinámicos interactivos y un diseño responsivo. En el backend, cuenta con una <strong>API REST en Node.js</strong> contenedorizada con <strong>Docker</strong> para gestionar telemetría y logging de visitas. Todo el ciclo de vida (CI/CD) está automatizado y desplegado en <strong>Vercel</strong>, garantizando la calidad del código mediante inspección continua con <strong>SonarQube</strong>.</p>",
                "second-project-title": "Proyecto Vesta",
                "second-project-date": "Iniciado en Noviembre 2025",
                "second-project-description": "Este es mi proyecto personal que presenté como TFG en el fin de mi grado superior de Desarrollo de Aplicaciones Web (DAW). Se trata de un proyecto que simula un Marketplace de una empresa de seguros con algunas funciones extras que quise implementar. Originalmente fue desplegado en Google Cloud, pero ha sido migrado a Render (PaaS) y Neon (PostgreSQL serverless) por optimización de costes. Si os interesa podéis informaros desde la documentación que guardo en el repositorio del proyecto API.",
                "third-project-title": "Carnicería Raúl Oliver - Experiencia Digital Premium",
                "third-project-date": "Iniciado en Mayo 2026",
                "third-project-description": "<p>El proyecto nace con el objetivo de impulsar la transformación digital de un negocio tradicional, dotándolo de una presencia online moderna, atractiva y altamente funcional. Más allá de crear una simple página estática, el enfoque ha sido diseñar una experiencia de usuario (UX) inmersiva y fluida que logre transmitir la calidad y profesionalidad del comercio desde el primer clic.</p><p style=\"margin-top: 0.8rem;\">La arquitectura del proyecto ha sido concebida para deslumbrar visualmente con microinteracciones, asegurar tiempos de carga casi instantáneos y una adaptabilidad perfecta a cualquier dispositivo (Mobile First), demostrando un fuerte compromiso con los estándares de desarrollo frontend actual.</p><h3 style=\"margin-top: 0.8rem; font-size: 1.05rem; font-weight: 600;\">Tecnologías y Enfoque Técnico:</h3><ul style=\"margin-top: 0.5rem; margin-left: 1.2rem; list-style-type: disc; gap: 0.3rem; display: flex; flex-direction: column;\"><li><strong>Rendimiento:</strong> Construido con React 18 y Vite.</li><li><strong>Escalabilidad:</strong> Tipado estricto con TypeScript.</li><li><strong>Estilos:</strong> Tailwind CSS (v4), Radix UI y Material UI.</li><li><strong>Animaciones:</strong> Framer Motion y Embla Carousel para una experiencia fluida.</li></ul>",
                "third-project-warning": "⚠️ Proyecto en fase de desarrollo activo. La versión final puede variar."
            },
            "skills": { "section-title": "Habilidades Técnicas", "tools": "Herramientas" },
            "download": { "download-pdf": "Descargar CV en PDF", "button-cv": "Descargar PDF", "social-media": "Redes Sociales" },
            "footer": { "updated": "Actualizado:" }
        },
        "en": {
            "theme": { "mode-dark": "Dark Mode", "mode-white": "Light Mode" },
            "profile": {
                "rol": "JUNIOR FULL-STACK WEB DEVELOPER",
                "description": "I have acquired knowledge of various technologies during my studies and work experience. I face my future with ambition, maintaining a positive and confident attitude in everything I do. I truly enjoy working in teams with people of all ages, as it allows me to listen to different perspectives and continuously learn from them."
            },
            "experiences": {
                "section-title": "Experience",
                "ayesa-meta": "Ayesa · Internship contract · Seville, Andalusia, Spain · Hybrid",
                "first-job-title": "Full Stack Junior Developer",
                "first-job-dates": "February 2026 - Present",
                "first-job-description": "Second-year internship of the Higher Vocational Training in Web Application Development (DAW).",
                "second-job-title": "Computer Programming Activities",
                "second-job-dates": "November 2023 - November 2024",
                "second-job-description": "I participated in the maintenance of the 'Virtual Secretary' platform. I used technologies such as Java, SQL and PL/SQL. My main responsibilities were to carry out the requested changes in the database and participate in the resolution of web errors alongside my team. I used Git for version control.",
                "third-job-title": "Front-End Junior Developer",
                "third-job-dates": "March 2023 - June 2023",
                "third-job-description": "First-year internship of the Mid-Level Vocational Training in Microcomputer Systems and Networks (SMR)."
            },
            "education": {
                "section-title": "Education",
                "skills-label": "Skills",
                "first-edu-title": "Higher Vocational Training, Web Application Development",
                "first-edu-school": "Centro Educativo Altair",
                "first-edu-dates": "Sept. 2025 - Jul. 2026",
                "first-edu-description": "Second year of Higher Vocational Training in Web Application Development (DAW).",
                "first-edu-btn": "View grades",
                "second-edu-title": "Higher Vocational Training, Web Application Development",
                "second-edu-school": "MEDAC",
                "second-edu-dates": "Sept. 2024 - Jul. 2025",
                "second-edu-description": "First year of Higher Vocational Training in Web Application Development (DAW). Grade: 6.41",
                "third-edu-title": "Mid-Level Vocational Training, Microcomputer Systems and Networks",
                "third-edu-school": "Diocesanos Nuestra Señora de las Mercedes Sevilla",
                "third-edu-dates": "",
                "third-edu-description": "Grade: 8.1"
            },
            "licenses": {
                "section-title": "Licenses & Certifications",
                "license-1-title": "Driving license class B",
                "license-1-issuer": "Directorate-General for Traffic (DGT)",
                "license-1-dates": "Issued Nov 2024 · Expires: Nov 2034",
                "ayesa-certs-title": "Ayesa Courses & Certificates",
                "ayesa-certs-issuer": "Ayesa · 8 certificates",
                "ayesa-certs-btn": "View documents",
                "modal-title": "Ayesa Courses & Certificates",
                "modal-subtitle": "8 certificates issued by Ayesa",
                "cert-1-title": "Certificate in Information Security",
                "cert-1-btn": "Preview",
                "cert-2-title": "Certificate in Occupational Risk Prevention",
                "cert-2-btn": "Preview",
                "cert-3-title": "Certificate in Data Protection Regulation",
                "cert-3-btn": "Preview",
                "cert-4-title": "Certificate in Environmental Management",
                "cert-4-btn": "Preview",
                "cert-5-title": "Certificate for Exposed Personnel",
                "cert-5-btn": "Preview",
                "cert-6-title": "Occupational Risk Refresher Certificate",
                "cert-6-btn": "Preview",
                "cert-7-title": "Business Continuity Certificate",
                "cert-7-btn": "Preview",
                "cert-8-title": "Equal Opportunities in the Workplace Certificate",
                "cert-8-btn": "Preview"
            },
            "projects": {
                "section-title": "Projects",
                "filter-all": "All",
                "sort-default": "Default",
                "sort-newest": "Newest",
                "sort-oldest": "Oldest",
                "sort-az": "Alphabetical (A-Z)",
                "sort-za": "Alphabetical (Z-A)",
                "first-project-title": "Portfolio page",
                "first-project-date": "Started in June 2025",
                "first-project-description": "<p>My personal portfolio, designed and developed from scratch as a living project that reflects my evolution as a Full-Stack developer.</p><p style=\"margin-top: 0.8rem;\">The frontend is built with <strong>vanilla HTML, CSS, and JavaScript</strong>, implementing a modular architecture with multi-language support, interactive dynamic themes, and a responsive design. On the backend, it features a <strong>Node.js REST API</strong> containerized with <strong>Docker</strong> to manage telemetry and visit logging. The entire project lifecycle (CI/CD) is automated and deployed on <strong>Vercel</strong>, ensuring code quality through continuous inspection with <strong>SonarQube</strong>.</p>",
                "second-project-title": "Vesta Project",
                "second-project-date": "Started in November 2025",
                "second-project-description": "This is my personal project that I presented as my Final Degree Project at the end of my Higher Technician in Web Application Development (DAW). It simulates a Marketplace for an insurance company with some extra functions that I wanted to implement. It was originally hosted on Google Cloud, but has recently been migrated to Render (PaaS) and Neon (Serverless PostgreSQL) for cost optimization. If you are interested, you can find more information in the documentation kept in the API project repository.",
                "third-project-title": "Carnicería Raúl Oliver - Premium Digital Experience",
                "third-project-date": "Started in May 2026",
                "third-project-description": "<p>The project was created to drive the digital transformation of a traditional business, providing it with a modern, attractive, and highly functional online presence. Beyond creating a simple static page, the focus has been on designing an immersive and fluid user experience (UX) that conveys the quality and professionalism of the business from the first click.</p><p style=\"margin-top: 0.8rem;\">The project's architecture has been designed to dazzle visually with micro-interactions, ensure near-instant load times, and perfect adaptability to any device (Mobile First), demonstrating a strong commitment to current frontend development standards.</p><h3 style=\"margin-top: 0.8rem; font-size: 1.05rem; font-weight: 600;\">Technologies and Technical Approach:</h3><ul style=\"margin-top: 0.5rem; margin-left: 1.2rem; list-style-type: disc; gap: 0.3rem; display: flex; flex-direction: column;\"><li><strong>Performance:</strong> Built with React 18 and Vite.</li><li><strong>Scalability:</strong> Strict typing with TypeScript.</li><li><strong>Styles:</strong> Tailwind CSS (v4), Radix UI, and Material UI.</li><li><strong>Animations:</strong> Framer Motion and Embla Carousel for a smooth experience.</li></ul>",
                "third-project-warning": "⚠️ Project in active development phase. The final version may vary."
            },
            "skills": { "section-title": "Technical Skills", "tools": "Tools" },
            "download": { "download-pdf": "Download CV in PDF", "button-cv": "Download PDF", "social-media": "Social Media" },
            "footer": { "updated": "Last updated:" }
        }
    };
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Cambia el idioma de la interfaz actualizando todos los elementos
     * que tengan los atributos `data-section` y `data-value`.
     * Busca el texto correspondiente en el objeto `translations` y lo
     * inyecta via innerHTML para soportar etiquetas HTML (p.ej. <br>).
     *
     * @param {string} language - Código del idioma a aplicar ('es' | 'en').
     */
    const changeLanguage = (language) => {
        languageData = translations[language];
        currentLanguage = language;
        document.documentElement.lang = language; // A11y & SEO

        for (const textToChange of textsToChange) {
            const section = textToChange.dataset.section;
            const value = textToChange.dataset.value;

            if (languageData[section] && languageData[section][value]) {
                textToChange.innerHTML = languageData[section][value];
            }
        }

        // Actualizar la ruta del CV y su nombre de descarga según el idioma
        const cvLink = document.querySelector(".button--cv");
        if (cvLink) {
            if (language === 'en') {
                cvLink.href = 'assets/descargas/cv_18-03-2026-en.pdf';
                cvLink.download = 'CV_Francisco_Javier_Parraga_EN.pdf';
            } else {
                cvLink.href = 'assets/descargas/cv_18-03-2026.pdf';
                cvLink.download = 'CV_Francisco_Javier_Parraga.pdf';
            }
        }

        updateToggleText();
        // Reiniciar typewriter al nuevo idioma (si ya fue inicializado)
        if (typeof window.__resetTypewriter === 'function') {
            window.__resetTypewriter();
        }
    };

    /**
     * Escucha clics en el selector de idioma (banderas).
     * Aplica el idioma correspondiente y lo guarda en localStorage.
     */
    flagsElement.addEventListener("click", (e) => {
        const flag = e.target.closest(".flags__item");
        if (flag) {
            changeLanguage(flag.dataset.language);
            localStorage.setItem('portfolio-lang', flag.dataset.language);
        }
    });

    /**
     * Alterna entre modo oscuro y modo claro al hacer clic en el botón
     * de tema. Actualiza el icono, el texto y guarda la preferencia
     * en localStorage.
     */
    toggleTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");

        if (isDark) {
            toggleIcon.src = "assets/icons/moon.png";
            localStorage.setItem('portfolio-theme', 'dark');
        } else {
            toggleIcon.src = "assets/icons/sun.png";
            localStorage.setItem('portfolio-theme', 'light');
        }

        updateToggleText();
    });

    /**
     * Escucha clics en el selector de colores de acento.
     * Lee los valores de hue, saturación y luminosidad del elemento
     * clicado y los aplica como variables CSS. Guarda la selección
     * en localStorage para persistirla entre sesiones.
     */
    toggleColors.addEventListener("click", (e) => {
        const target = e.target.closest(".colors__item");
        if (!target) return;

        if (target.dataset.hue) {
            const hue = target.dataset.hue;
            const sat = target.dataset.sat || '84%';
            const light = target.dataset.light || '56%';

            rootStyles.setProperty("--primary-hue", hue);
            rootStyles.setProperty("--primary-sat", sat);
            rootStyles.setProperty("--primary-light", light);

            localStorage.setItem('portfolio-hue', hue);
            localStorage.setItem('portfolio-sat', sat);
            localStorage.setItem('portfolio-light', light);

            // Actualizar indicador visual del color activo
            document.querySelectorAll('.colors__item').forEach(item => {
                item.classList.remove('colors__item--active');
            });
            target.classList.add('colors__item--active');
        }
    });

    // ── Inicialización ───────────────────────────────────────────────────────
    changeLanguage(currentLanguage);
    // ────────────────────────────────────────────────────────────────────────

    // ── Efecto Typewriter en el subtítulo de perfil ─────────────────────────
    /**
     * Cicla a través de una lista de roles, escribiéndolos y borrándolos
     * con velocidades realistas. Se reinicia automáticamente al cambiar idioma.
     */
    const typewriterEl = document.getElementById('typewriter-text');

    const typewriterRoles = {
        es: [
            'DESARROLLADOR WEB FULL-STACK',
            'EN BÚSQUEDA DE EMPLEO',
        ],
        en: [
            'FULL-STACK WEB DEVELOPER',
            'OPEN TO WORK',
        ],
    };

    let twIndex      = 0;   // índice del rol actual
    let twCharIndex  = 0;   // posición del carácter que se está escribiendo
    let twDeleting   = false;
    let twTimeout    = null;

    const SPEED_TYPE   = 65;   // ms por carácter al escribir
    const SPEED_DELETE = 35;   // ms por carácter al borrar
    const PAUSE_AFTER  = 2000; // ms de pausa tras terminar de escribir
    const PAUSE_NEXT   = 400;  // ms de pausa antes de empezar la siguiente word

    const typewriterTick = () => {
        if (!typewriterEl) return;
        const roles = typewriterRoles[currentLanguage] || typewriterRoles['es'];
        const current = roles[twIndex];

        if (twDeleting) {
            twCharIndex--;
            typewriterEl.textContent = current.substring(0, twCharIndex);
            if (twCharIndex === 0) {
                twDeleting = false;
                twIndex = (twIndex + 1) % roles.length;
                twTimeout = setTimeout(typewriterTick, PAUSE_NEXT);
                return;
            }
            twTimeout = setTimeout(typewriterTick, SPEED_DELETE);
        } else {
            twCharIndex++;
            typewriterEl.textContent = current.substring(0, twCharIndex);
            if (twCharIndex === current.length) {
                twDeleting = true;
                twTimeout = setTimeout(typewriterTick, PAUSE_AFTER);
                return;
            }
            twTimeout = setTimeout(typewriterTick, SPEED_TYPE);
        }
    };

    /**
     * Reinicia el typewriter desde el primer rol del idioma activo.
     * Cancela cualquier tick pendiente para evitar condiciones de carrera.
     */
    const resetTypewriter = () => {
        clearTimeout(twTimeout);
        twIndex     = 0;
        twCharIndex = 0;
        twDeleting  = false;
        if (typewriterEl) typewriterEl.textContent = '';
        twTimeout = setTimeout(typewriterTick, 300);
    };

    // Arrancar al cargar y exponer para que changeLanguage pueda reiniciarlo
    resetTypewriter();
    window.__resetTypewriter = resetTypewriter;
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Gestiona la navegación de la galería de imágenes de los proyectos.
     * Desplaza la galería a izquierda o derecha según el botón pulsado,
     * usando scroll suave con la anchura del contenedor como unidad.
     */
    document.addEventListener("click", (e) => {
        const button = e.target.closest(".gallery-button");
        if (!button) return;

        const container = button.closest(".card__image-container");
        if (!container) return;

        const gallery = container.querySelector(".project-gallery");
        if (!gallery) return;

        const scrollAmount = gallery.clientWidth;
        let scrollDirection = 0;

        if (button.classList.contains("gallery-button--right")) {
            scrollDirection = scrollAmount;
        } else {
            scrollDirection = -scrollAmount;
        }

        gallery.scrollBy({
            left: scrollDirection,
            behavior: 'smooth'
        });
    });

    // ── Lightbox ─────────────────────────────────────────────────────────────
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxClose = lightbox.querySelector('.lightbox__close');
    const imagesToPreview = document.querySelectorAll('[data-lightbox-img]');
    const lightboxPrev = lightbox.querySelector('.lightbox__nav--prev');
    const lightboxNext = lightbox.querySelector('.lightbox__nav--next');

    let currentLightboxGroup = [];
    let currentLightboxIndex = 0;

    const updateLightboxNav = () => {
        if (currentLightboxGroup.length <= 1) {
            if (lightboxPrev) lightboxPrev.style.display = 'none';
            if (lightboxNext) lightboxNext.style.display = 'none';
        } else {
            if (lightboxPrev) lightboxPrev.style.display = 'flex';
            if (lightboxNext) lightboxNext.style.display = 'flex';
        }
    };

    /**
     * Abre el lightbox mostrando la imagen indicada a pantalla completa.
     * Añade la clase 'active' al overlay y bloquea el scroll del body.
     *
     * @param {string} imgSrc - URL de la imagen a mostrar en el lightbox.
     */
    const openLightbox = (imgSrc) => {
        lightboxImage.src = imgSrc;
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-active');
        updateLightboxNav();
    };

    /**
     * Cierra el lightbox, elimina la clase 'active' del overlay,
     * restaura el scroll del body y limpia el src de la imagen.
     */
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-active');
        lightboxImage.src = "";
    };

    /**
     * Asigna el evento de clic a cada imagen con `data-lightbox-img`
     * para abrir el lightbox al pulsarla. Se detiene la propagación
     * para evitar que el clic en la imagen cierre el lightbox.
     */
    imagesToPreview.forEach(image => {
        image.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Buscar todas las imágenes relacionadas en la misma tarjeta/sección
            const container = image.closest('.card') || document.body;
            currentLightboxGroup = Array.from(container.querySelectorAll('[data-lightbox-img]'));
            currentLightboxIndex = currentLightboxGroup.indexOf(image);
            
            const imgSrc = image.getAttribute('data-lightbox-img');
            openLightbox(imgSrc);
        });
    });

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentLightboxGroup.length > 0) {
                currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxGroup.length) % currentLightboxGroup.length;
                lightboxImage.src = currentLightboxGroup[currentLightboxIndex].getAttribute('data-lightbox-img');
            }
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentLightboxGroup.length > 0) {
                currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxGroup.length;
                lightboxImage.src = currentLightboxGroup[currentLightboxIndex].getAttribute('data-lightbox-img');
            }
        });
    }

    /** Cierra el lightbox al hacer clic en el botón de cierre (×). */
    lightboxClose.addEventListener('click', () => {
        closeLightbox();
    });

    /** Cierra el lightbox al hacer clic fuera de la imagen (en el overlay). */
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    // ────────────────────────────────────────────────────────────────────────

    // ── Botón Volver Arriba ─────────────────────────────────────────────────
    const btnScrollTop = document.getElementById("btn-scroll-top");
    if (btnScrollTop) {
        window.addEventListener("scroll", () => {
            // Mostrar el boton cuando el usuario ha bajado mas de 300px desde el inicio
            if (window.scrollY > 300) {
                btnScrollTop.classList.add("show");
            } else {
                btnScrollTop.classList.remove("show");
            }
        });

        btnScrollTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // ── Filtro de proyectos ─────────────────────────────────────────
    /**
     * Lee el filtro activo del botón pulsado y muestra/oculta
     * las tarjetas de proyecto según su atributo data-tags.
     * Usa una clase CSS para la transición de opacidad.
     */
    const filterBar = document.getElementById('filter-bar');
    if (filterBar) {
        const projectCards = document.querySelectorAll('.card--project');

        filterBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            // Actualizar botón activo
            filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
            btn.classList.add('filter-btn--active');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                const tags = (card.dataset.tags || '').toLowerCase();
                const matches = filter === 'all' || tags.includes(filter);

                if (matches) {
                    card.classList.remove('card--hidden');
                } else {
                    card.classList.add('card--hidden');
                }
            });
        });
    }
    // ────────────────────────────────────────────────────────────────

    // ── Ordenamiento de proyectos ───────────────────────────────────
    const sortSelect = document.getElementById('sort-projects');
    const projectsList = document.getElementById('projects-list');
    
    if (sortSelect && projectsList) {
        // Guardar el orden original
        const originalOrder = Array.from(projectsList.children);

        sortSelect.addEventListener('change', (e) => {
            const sortType = e.target.value;
            const currentCards = Array.from(projectsList.children);

            if (sortType === 'default') {
                originalOrder.forEach(card => projectsList.appendChild(card));
            } else {
                currentCards.sort((a, b) => {
                    if (sortType === 'newest') {
                        return new Date(b.dataset.date) - new Date(a.dataset.date);
                    } else if (sortType === 'oldest') {
                        return new Date(a.dataset.date) - new Date(b.dataset.date);
                    } else if (sortType === 'az') {
                        return a.dataset.title.localeCompare(b.dataset.title);
                    } else if (sortType === 'za') {
                        return b.dataset.title.localeCompare(a.dataset.title);
                    }
                    return 0;
                });
                // Re-añadir en el nuevo orden
                currentCards.forEach(card => projectsList.appendChild(card));
            }
        });
    }
    // ────────────────────────────────────────────────────────────────

    // ── Modal de Cursos Ayesa ───────────────────────────────────────
    const ayesaModal    = document.getElementById('ayesa-modal');
    const btnOpenModal  = document.getElementById('btn-open-ayesa-modal');
    const btnCloseModal = ayesaModal?.querySelector('.ayesa-modal__close');
    const modalBackdrop = ayesaModal?.querySelector('.ayesa-modal__backdrop');

    const openAyesaModal = () => {
        ayesaModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        btnCloseModal?.focus();
    };

    const closeAyesaModal = () => {
        ayesaModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    btnOpenModal?.addEventListener('click', openAyesaModal);
    btnCloseModal?.addEventListener('click', closeAyesaModal);
    modalBackdrop?.addEventListener('click', closeAyesaModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ayesaModal?.classList.contains('active')) {
            closeAyesaModal();
        }
    });
    // ────────────────────────────────────────────────────────────────

    // ── Tracking de clics en Redes Sociales ────────────────────────
    /**
     * Registra silenciosamente cuándo alguien hace clic en un enlace
     * de red social, enviando los datos del visitante al webhook de Discord
     * configurado en DISCORD_SOCIAL_WEBHOOK_URL.
     * Solo se ejecuta en producción (no en localhost).
     */
    // Cada entrada mapea el id del enlace en el HTML con su nombre de red social
    const socialLinks = [
        { id: 'linkedin-link',  social: 'linkedin'  },
        { id: 'instagram-link', social: 'instagram' },
        { id: 'whatsapp-link',  social: 'whatsapp'  },
        { id: 'github-link',    social: 'github'    },
        { id: 'github-link-profile', social: 'github' }
    ];

    socialLinks.forEach(({ id, social }) => {
        const link = document.getElementById(id);
        if (!link) return;

        link.addEventListener('click', () => {
            const isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
            if (!isProduction) return;

            const clickData = {
                timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
                language: navigator.language || navigator.userLanguage,
                screen: `${screen.width}x${screen.height}`,
                userAgent: navigator.userAgent,
                page: location.href,
                social,
            };

            fetch('/api/log-social', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Cabecera de seguridad compartida con el servidor para bloquear peticiones externas
                    'X-Log-Secret': 'pf-log-9x3k7m2w8q4e1r6t0y5',
                },
                body: JSON.stringify(clickData),
            }).catch(() => { }); // silencioso: no muestra errores al usuario
        });
    });
    // ────────────────────────────────────────────────────────────────

    // ── Tracking de clics en Proyectos ──────────────────────────────
    /**
     * Detecta clics en los enlaces de los proyectos (Web, Code, API)
     * buscando el atributo data-project.
     */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-project]');
        if (!link) return;

        const isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
        if (!isProduction) return;

        const projectData = {
            timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
            language: navigator.language || navigator.userLanguage,
            screen: `${screen.width}x${screen.height}`,
            userAgent: navigator.userAgent,
            page: location.href,
            project: link.dataset.project,
            action: link.dataset.projectAction || 'unknown',
        };

        fetch('/api/log-project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Cabecera de seguridad compartida con el servidor
                'X-Log-Secret': 'pf-log-9x3k7m2w8q4e1r6t0y5',
            },
            body: JSON.stringify(projectData),
        }).catch(() => { }); // silencioso
    });
    // ────────────────────────────────────────────────────────────────

    // ── Tracking de Descargas de CV ─────────────────────────────────
    const cvDownloadBtn = document.querySelector('.button--cv');
    if (cvDownloadBtn) {
        cvDownloadBtn.addEventListener('click', () => {
            const isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
            if (!isProduction) return; // Se bloquea en localhost para no llenar de registros falsos

            // Sabe el idioma mirando a dónde apunta actualmente el enlace
            const cvLang = cvDownloadBtn.href.includes('-en.pdf') ? 'en' : 'es';

            const downloadData = {
                timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
                language: navigator.language || navigator.userLanguage,
                screen: `${screen.width}x${screen.height}`,
                userAgent: navigator.userAgent,
                page: location.href,
                cvLanguage: cvLang
            };

            fetch('/api/log-cv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Log-Secret': 'pf-log-9x3k7m2w8q4e1r6t0y5',
                },
                body: JSON.stringify(downloadData),
            }).catch(() => {});
        });
    }

});