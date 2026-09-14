export const updateToggleText = (languageData) => {
    const toggleText = document.getElementById("toggle-text");
    if (!languageData || !languageData.theme) return;

    if (document.body.classList.contains("dark")) {
        toggleText.textContent = languageData.theme["mode-dark"];
    } else {
        toggleText.textContent = languageData.theme["mode-white"];
    }
};

export const initTheme = () => {
    const toggleTheme = document.getElementById("toggle-icon");
    const toggleIcon = document.getElementById("toggle-image");
    const rootStyles = document.documentElement.style;
    const toggleColors = document.getElementById("toggle-colors");

    // Restaurar preferencias guardadas (tema y color)
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
        toggleIcon.src = 'assets/icons/sun-64.png';
    }

    const savedHue = localStorage.getItem('portfolio-hue');
    const savedSat = localStorage.getItem('portfolio-sat');
    const savedLight = localStorage.getItem('portfolio-light');

    const defaultHue = '214';
    const defaultSat = '84%';
    const defaultLight = '56%';

    const activeHue = savedHue || defaultHue;
    const activeSat = savedSat || defaultSat;
    const activeLight = savedLight || defaultLight;

    rootStyles.setProperty('--primary-hue', activeHue);
    rootStyles.setProperty('--primary-sat', activeSat);
    rootStyles.setProperty('--primary-light', activeLight);

    // Marcar visualmente el color activo
    document.querySelectorAll('.colors__item').forEach(item => {
        item.classList.remove('colors__item--active');
    });
    const activeItem = document.querySelector(`.colors__item[data-hue="${activeHue}"]`);
    if (activeItem) {
        activeItem.classList.add('colors__item--active');
    }

    // Toggle modo oscuro/claro
    toggleTheme?.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        if (document.body.classList.contains("dark")) {
            toggleIcon.src = 'assets/icons/moon-64.png';
            localStorage.setItem('portfolio-theme', 'dark');
        } else {
            toggleIcon.src = 'assets/icons/sun-64.png';
            localStorage.setItem('portfolio-theme', 'light');
        }
        // Actualizar el texto del botón de modo usando la variable languageData importada
        import('./i18n.js').then(module => updateToggleText(module.languageData));
    });

    // Selector de colores
    toggleColors?.addEventListener("click", (e) => {
        if (e.target.classList.contains("colors__item")) {
            const hue = e.target.dataset.hue;
            const sat = e.target.dataset.sat;
            const light = e.target.dataset.light;

            rootStyles.setProperty("--primary-hue", hue);
            rootStyles.setProperty("--primary-sat", sat);
            rootStyles.setProperty("--primary-light", light);

            localStorage.setItem('portfolio-hue', hue);
            localStorage.setItem('portfolio-sat', sat);
            localStorage.setItem('portfolio-light', light);

            document.querySelectorAll('.colors__item').forEach(item => {
                item.classList.remove('colors__item--active');
            });
            e.target.classList.add('colors__item--active');
        }
    });
};
