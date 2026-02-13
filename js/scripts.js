document.addEventListener("DOMContentLoaded", () => {

    const toggleTheme = document.getElementById("toggle-icon");
    const toggleIcon = document.getElementById("toggle-image");
    const toggleText = document.getElementById("toggle-text");

    const toggleColors = document.getElementById("toggle-colors");

    const colorHeader = document.getElementById("--header");
    const cardText = document.getElementById("card__text");
    const cardTitles = document.querySelectorAll(".card__title");
    const cardSubtitle = document.getElementById("card__subtitle");

    const skillsTexts = document.querySelectorAll(".skills__tech");

    const rootStyles = document.documentElement.style;

    const flagsElement = document.getElementById("flags");

    const textsToChange = document.querySelectorAll("[data-section]");


    let currentLanguage = 'es';
    let languageData = {};




    const calculateSkillBars = () => {
        const skillBars = document.querySelectorAll(".skills__bar[data-years]");

        skillBars.forEach(bar => {
            const years = parseFloat(bar.getAttribute("data-years"));


            let percentage = Math.min((years / 2) * 100, 100);


            percentage = Math.round(percentage / 10) * 10;


            bar.className = "skills__bar";
            bar.classList.add(`skills__bar--${percentage}`);
        });
    };



    const updateToggleText = () => {
        if (!languageData.theme) return;

        if (document.body.classList.contains("dark")) {
            toggleText.textContent = languageData.theme["mode-dark"];
        } else {
            toggleText.textContent = languageData.theme["mode-white"];
        }
    };


    const translations = {
        "es": {
            "theme": { "mode-dark": "Modo Oscuro", "mode-white": "Modo Claro" },
            "profile": {
                "rol": "Desarrollador Front-end",
                "description": "Tengo conocimientos usando varias tecnologías durante mis estudios y etapa laboral. Me gusta ver mi futuro con ambición además de ser positivo y seguro de todo lo que hago. Disfruto también trabajando en equipo con personas de todas las edades a las que puedo escuchar y también aprender sobre ellos."
            },
            "experiences": {
                "first-job-title": "Desarrollador Web",
                "first-job-dates": "Noviembre 2023 - Noviembre 2024",
                "first-job-description": "Participé en el mantenimiento de la plataforma “Secretaria Virtual”. Utilicé tecnologías como Java, SQL y PL/SQL. Mi responsabilidad principal fue llevar a cabo los cambios solicitados en la base de datos y participar en las correcciones de errores de la web junto a mi equipo. Utilicé Git para el control de versiones."
            },
            "projects": {
                "first-project-title": "Portfolio page",
                "first-project-description": "Proyecto constantemente en desarrollo.",
                "second-project-title": "Área de trabajo Angular",
                "second-project-description": "Area de trabajo con algunos proyectos sencillos en Angular.",
                "third-project-title": "Proyecto Vesta",
                "third-project-description": "Este es mi proyecto personal que presenté como TFG en el fin de mi grado superior de Desarrollo de Aplicaciones Web (DAW). Se trata de un proyecto que simula un Marketplace de una empresa de seguros con algunas funciones interesantes que quise implementar, si os interesa podeis informaros desde la documentación que guardo en el respositorio del proyecto API.",
                "fourth-project-title": "Cuarto Proyecto",
                "fourth-project-description": "Descripción de mi cuarto proyecto."
            },
            "skills": { "years": "Años de experiencia" },
            "download": { "download-pdf": "Descargar CV en PDF", "button-cv": "Descargar PDF", "social-media": "Redes Sociales" }
        },
        "en": {
            "theme": { "mode-dark": "Dark Mode", "mode-white": "Light Mode" },
            "profile": {
                "rol": "Front-end Developer",
                "description": "I have knowledge using various technologies during my studies and work stage. I like to see my future with ambition in addition to being positive and confident in everything I do. Enjoy also working as a team with people of all ages through the ones that I can listen to and also learn about."
            },
            "experiences": {
                "first-job-title": "Web Developer",
                "first-job-dates": "November 2023 - November 2024",
                "first-job-description": "I participated in the maintenance of the platform (Secretary of the Interior Virtual). I used technologies such as Java, SQL and PL/SQL. My the main responsibility was to carry out the changes requested in the database and participate in corrections of web errors together with my team. I used Git for the version control."
            },
            "projects": {
                "first-project-title": "Portfolio page",
                "first-project-description": "Project constantly under development.",
                "second-project-title": "Angular Workspace",
                "second-project-description": "Workspace with some simple projects in Angular.",
                "third-project-title": "Vesta Project",
                "third-project-description": "This is my personal project that I presented as my Final Degree Project at the end of my Higher Technician in Web Application Development (DAW). It simulates a Marketplace for an insurance company with some interesting functions that I wanted to implement. If you are interested, you can find more information in the documentation kept in the API project repository.",
                "fourth-project-title": "Fourth Project",
                "fourth-project-description": "Description of my fourth project."
            },
            "skills": { "years": "Years of experience" },
            "download": { "download-pdf": "Download CV in PDF", "button-cv": "Download PDF", "social-media": "Social Media" }
        }
    };

    const changeLanguage = (language) => {
        languageData = translations[language];
        currentLanguage = language;

        for (const textToChange of textsToChange) {
            const section = textToChange.dataset.section;
            const value = textToChange.dataset.value;

            if (languageData[section] && languageData[section][value]) {
                textToChange.innerHTML = languageData[section][value];
            }
        }

        updateToggleText();
    };

    flagsElement.addEventListener("click", (e) => {
        const flag = e.target.closest(".flags__item");
        if (flag) {
            changeLanguage(flag.dataset.language);
        }
    });

    toggleTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (toggleIcon.src.includes("moon.png")) {
            toggleIcon.src = "assets/icons/sun.png";
        } else {
            toggleIcon.src = "assets/icons/moon.png";
        }

        updateToggleText();
    });

    toggleColors.addEventListener("click", (e) => {
        const target = e.target.closest(".colors__item");
        if (!target) return;

        if (target.dataset.hue) {
            rootStyles.setProperty("--primary-hue", target.dataset.hue);

            // Set saturation if present, else default
            if (target.dataset.sat) {
                rootStyles.setProperty("--primary-sat", target.dataset.sat);
            } else {
                rootStyles.setProperty("--primary-sat", "84%");
            }

            // Set lightness if present, else default
            if (target.dataset.light) {
                rootStyles.setProperty("--primary-light", target.dataset.light);
            } else {
                rootStyles.setProperty("--primary-light", "56%");
            }
        }
    });


    calculateSkillBars();


    changeLanguage('es');



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





    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxClose = lightbox.querySelector('.lightbox__close');
    const imagesToPreview = document.querySelectorAll('[data-lightbox-img]');


    const openLightbox = (imgSrc) => {
        lightboxImage.src = imgSrc;
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-active');
    };


    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-active');
        lightboxImage.src = "";
    };


    imagesToPreview.forEach(image => {
        image.addEventListener('click', (e) => {

            e.stopPropagation();


            const imgSrc = image.getAttribute('data-lightbox-img');
            openLightbox(imgSrc);
        });
    });





    lightboxClose.addEventListener('click', () => {
        closeLightbox();
    });


    lightbox.addEventListener('click', (e) => {

        if (e.target === lightbox) {
            closeLightbox();
        }
    });



});