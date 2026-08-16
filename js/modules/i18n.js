import { translations } from './translations.js';
import { updateToggleText } from './theme.js';
import { resetTypewriter, setLanguageData, initReadMore } from './ui.js';

export let currentLanguage = localStorage.getItem('portfolio-lang') || 'es';
export let languageData = {};

export const changeLanguage = (language) => {
    currentLanguage = language;
    localStorage.setItem('portfolio-lang', language);
    languageData = translations[language];

    // Actualizar atributo lang del html
    document.documentElement.lang = language;

    // Inyectar textos según data-section y data-value
    const textsToChange = document.querySelectorAll("[data-section]");
    textsToChange.forEach((element) => {
        const section = element.dataset.section;
        const value = element.dataset.value;
        if (languageData[section] && languageData[section][value]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = languageData[section][value];
                // Limpiar el innerHTML por si acaso fue inyectado previamente
                element.innerHTML = '';
            } else {
                element.innerHTML = languageData[section][value];
            }
        }
    });

    updateToggleText(languageData);
    setLanguageData(languageData);
    resetTypewriter(language);
    
    // Necesitamos que el DOM se haya actualizado (inner HTML inyectado) antes de truncar de nuevo
    setTimeout(initReadMore, 50);
};

export const initI18n = () => {
    // Inicializar el idioma al cargar
    changeLanguage(currentLanguage);

    // Event listener para las banderas
    const flagsElement = document.getElementById("flags");
    flagsElement?.addEventListener("click", (e) => {
        const language = e.target.closest('.flags__item')?.dataset.language;
        if (language) {
            changeLanguage(language);
        }
    });
};
