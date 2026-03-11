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
     * Calcula y aplica el ancho de cada barra de habilidades en función
     * de los años de experiencia indicados en el atributo `data-years`.
     * Convierte los años a un porcentaje (máx. 100%) y lo redondea al
     * múltiplo de 10 más cercano para aplicar la clase CSS correspondiente.
     */
    const calculateSkillBars = () => {
        const skillBars = document.querySelectorAll(".skills__bar[data-years]");

        skillBars.forEach(bar => {
            const years = parseFloat(bar.getAttribute("data-years"));

            // Escala: 3 años = 100%
            let percentage = Math.min((years / 3) * 100, 100);

            // Redondeamos al múltiplo de 10 más cercano para las clases CSS
            percentage = Math.round(percentage / 10) * 10;

            bar.className = "skills__bar";
            bar.classList.add(`skills__bar--${percentage}`);
        });
    };

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
                "first-job-title": "Desarrollador Full Stack Junior",
                "first-job-dates": "Febrero 2026 - Actualidad",
                "first-job-description": "Prácticas de segundo curso de FP Grado Superior de Desarrollo de Aplicaciones Web (DAW).",
                "second-job-title": "Actividades de programación informática",
                "second-job-dates": "Noviembre 2023 - Noviembre 2024",
                "second-job-description": "Participé en el mantenimiento de la plataforma \"Secretaria Virtual\". Utilicé tecnologías como Java, SQL y PL/SQL. Mi responsabilidad principal fue llevar a cabo los cambios solicitados en la base de datos y participar en las correcciones de errores de la web junto a mi equipo. Utilicé Git para el control de versiones.",
                "third-job-title": "Desarrollador Front-End Junior",
                "third-job-dates": "Marzo 2023 - Junio 2023",
                "third-job-description": "Prácticas de primer curso de FP Grado Medio Sistemas Microinformaticos y Redes (SMR)."
            },
            "education": {
                "section-title": "Educación",
                "skills-label": "Aptitudes",
                "first-edu-title": "Ciclo Formativo de Grado Superior, Desarrollo de Aplicaciones Web",
                "first-edu-school": "Centro Educativo Altair",
                "first-edu-dates": "sept. 2025 - jul. 2026",
                "first-edu-description": "Segundo año de Grado Superior de Desarrollo de Aplicaciones Web (DAW).",
                "second-edu-title": "Ciclo Formativo de Grado Superior, Desarrollo de Aplicaciones Web",
                "second-edu-school": "MEDAC",
                "second-edu-dates": "sept. 2024 - jul. 2025",
                "second-edu-description": "Primer año de Grado Superior de Desarrollo de Aplicaciones Web (DAW). Nota: 6.41",
                "third-edu-title": "Formación Profesional de Grado Medio, Sistemas microinformaticos y redes",
                "third-edu-school": "Diocesanos Nuestra Señora de las Mercedes Sevilla",
                "third-edu-dates": "",
                "third-edu-description": "Nota: 8.1"
            },
            "licenses": {
                "section-title": "Licencias y certificaciones",
                "license-1-title": "Permiso de conducción B",
                "license-1-issuer": "Dirección General de Tráfico",
                "license-1-dates": "Expedición nov. 2024 · Vencimiento: nov. 2034",
                "cert-1-title": "Certificado Curso Seguridad de la Información",
                "cert-1-issuer": "Ayesa",
                "cert-1-btn": "Previsualizar",
                "cert-2-title": "Certificado Curso Prevención Riesgos Laborales",
                "cert-2-issuer": "Ayesa",
                "cert-2-btn": "Previsualizar"
            },
            "projects": {
                "first-project-title": "Portfolio page",
                "first-project-description": "Proyecto constantemente en desarrollo.",
                "second-project-title": "Proyecto Vesta",
                "second-project-description": "Este es mi proyecto personal que presenté como TFG en el fin de mi grado superior de Desarrollo de Aplicaciones Web (DAW). Se trata de un proyecto que simula un Marketplace de una empresa de seguros con algunas funciones extras que quise implementar, si os interesa podéis informaros desde la documentación que guardo en el repositorio del proyecto API.",
                "second-project-warning": "⚠️ Acceso web limitado hasta el 14 de abril de 2026 por restricciones de servidor."
            },
            "skills": { "years": "Años de experiencia" },
            "download": { "download-pdf": "Descargar CV en PDF", "button-cv": "Descargar PDF", "social-media": "Redes Sociales" }
        },
        "en": {
            "theme": { "mode-dark": "Dark Mode", "mode-white": "Light Mode" },
            "profile": {
                "rol": "JUNIOR FULL-STACK WEB DEVELOPER",
                "description": "I have acquired knowledge of various technologies during my studies and work experience. I face my future with ambition, maintaining a positive and confident attitude in everything I do. I truly enjoy working in teams with people of all ages, as it allows me to listen to different perspectives and continuously learn from them."
            },
            "experiences": {
                "section-title": "Experience",
                "first-job-title": "Full Stack Junior Developer",
                "first-job-dates": "February 2026 - Present",
                "first-job-description": "Internship of the second year of Higher Vocational Training in Web Application Development (DAW).",
                "second-job-title": "Computer Programming Activities",
                "second-job-dates": "November 2023 - November 2024",
                "second-job-description": "I participated in the maintenance of the platform \"Virtual Secretary\". I used technologies such as Java, SQL and PL/SQL. My main responsibility was to carry out the changes requested in the database and participate in corrections of web errors together with my team. I used Git for version control.",
                "third-job-title": "Front-End Junior Developer",
                "third-job-dates": "March 2023 - June 2023",
                "third-job-description": "Internship of the first year of Mid-Level Vocational Training in Microcomputer Systems and Networks (SMR)."
            },
            "education": {
                "section-title": "Education",
                "skills-label": "Skills",
                "first-edu-title": "Higher Vocational Training, Web Application Development",
                "first-edu-school": "Centro Educativo Altair",
                "first-edu-dates": "Sept. 2025 - Jul. 2026",
                "first-edu-description": "Second year of Higher Vocational Training in Web Application Development (DAW).",
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
                "cert-1-title": "Information Security Certificate Course",
                "cert-1-issuer": "Ayesa",
                "cert-1-btn": "Preview",
                "cert-2-title": "Occupational Risk Prevention Certificate Course",
                "cert-2-issuer": "Ayesa",
                "cert-2-btn": "Preview"
            },
            "projects": {
                "first-project-title": "Portfolio page",
                "first-project-description": "Project constantly under development.",
                "second-project-title": "Vesta Project",
                "second-project-description": "This is my personal project that I presented as my Final Degree Project at the end of my Higher Technician in Web Application Development (DAW). It simulates a Marketplace for an insurance company with some extra functions that I wanted to implement. If you are interested, you can find more information in the documentation kept in the API project repository.",
                "second-project-warning": "⚠️ Web access limited until April 14, 2026 due to server constraints."
            },
            "skills": { "years": "Years of experience" },
            "download": { "download-pdf": "Download CV in PDF", "button-cv": "Download PDF", "social-media": "Social Media" }
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

        updateToggleText();
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
    calculateSkillBars();
    changeLanguage(currentLanguage);
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
            const imgSrc = image.getAttribute('data-lightbox-img');
            openLightbox(imgSrc);
        });
    });

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

    // ── Footer: Última actualización (Fecha actual de carga del cliente) ────
    const lastUpdatedEl = document.getElementById("last-updated");
    if (lastUpdatedEl) {
        const today = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        lastUpdatedEl.textContent = today.toLocaleDateString('es-ES', options);
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
});