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

    // Función para calcular y aplicar los porcentajes de las barras de habilidades
    const calculateSkillBars = () => {
        const skillBars = document.querySelectorAll(".skills__bar[data-years]");
        
        skillBars.forEach(bar => {
            const years = parseFloat(bar.getAttribute("data-years"));
            
            // Calcular porcentaje basado en años (máximo 2 años = 100%)
            let percentage = Math.min((years / 2) * 100, 100);
            
            // Redondear al múltiplo de 10 más cercano para usar las clases CSS existentes
            percentage = Math.round(percentage / 10) * 10;
            
            // Aplicar la clase correspondiente
            bar.className = "skills__bar";
            bar.classList.add(`skills__bar--${percentage}`);
        });
    };

    const changeLanguage = async (language) => {
        try {
            const requestJson = await fetch(`./languages/${language}.json`);
            const texts = await requestJson.json();

            for (const textToChange of textsToChange) {
                const section = textToChange.dataset.section;
                const value = textToChange.dataset.value;

                if (texts[section] && texts[section][value]) {
                    textToChange.innerHTML = texts[section][value];
                }
            }
            
            // Actualizar el texto del toggle theme según el idioma
            if (document.body.classList.contains("dark")) {
                toggleText.textContent = texts.theme["mode-dark"];
            } else {
                toggleText.textContent = texts.theme["mode-white"];
            }
        } catch (error) {
            console.error("Error al cargar el idioma:", error);
        }
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
            // Modo claro
            colorHeader.style.backgroundColor = "#968369";
            toggleIcon.src = "assets/icons/sun.png";
            toggleText.textContent = "Modo Claro";
        } else {
            // Modo oscuro
            colorHeader.style.backgroundColor = "hsl(0, 0%, 20%)";
            toggleIcon.src = "assets/icons/moon.png";
            toggleText.textContent = "Modo Oscuro";
        }
    });

    toggleColors.addEventListener("click", (e) => {
        if (e.target.dataset.color) {
            rootStyles.setProperty("--primary-color", e.target.dataset.color);
        }
    });

    // Inicializar las barras de habilidades
    calculateSkillBars();

    // Cargar idioma por defecto (español)
    changeLanguage('es');

});