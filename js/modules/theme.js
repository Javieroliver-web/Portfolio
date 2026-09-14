export const updateToggleText = (languageData) => {
    const toggleText = document.getElementById("toggle-text");
    if (!languageData || !languageData.theme) return;

    if (document.body.classList.contains("dark")) {
        toggleText.textContent = languageData.theme["mode-dark"];
    } else {
        toggleText.textContent = languageData.theme["mode-white"];
    }
};

const DEFAULT_SAT = '84%';
const DEFAULT_LIGHT = '56%';

// ── Contraste de los botones rellenos ─────────────────────────────────────
// Blanco sobre algunos acentos no llega al mínimo WCAG AA (4,5:1): el azul por
// defecto daba 3,8:1 y el verde 1,5:1. Para cada acento se busca el fondo:
//   1. Texto blanco oscureciendo el fondo como mucho 8 puntos de luz (azul: 56% -> 50%).
//   2. Si no basta, texto oscuro sobre el color original (verde).
const MIN_CONTRAST = 4.5;
const DARK_TEXT = 'hsl(240, 10%, 10%)';

const hslToRgb = (h, s, l) => {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)];
};
const luminance = rgb => {
    const [r, g, b] = rgb.map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

const updateButtonColors = (hue, sat, light) => {
    const h = parseFloat(hue), s = parseFloat(sat), l = parseFloat(light);
    const rootStyles = document.documentElement.style;
    for (let dl = l; dl >= l - 8; dl--) {
        if (contrast(hslToRgb(h, s, dl), [1, 1, 1]) >= MIN_CONTRAST) {
            rootStyles.setProperty('--button-bg', `hsl(${h}, ${s}%, ${dl}%)`);
            rootStyles.setProperty('--button-text', '#ffffff');
            return;
        }
    }
    rootStyles.setProperty('--button-bg', `hsl(${h}, ${s}%, ${l}%)`);
    rootStyles.setProperty('--button-text', DARK_TEXT);
};

const applyAccent = (hue, sat, light) => {
    const rootStyles = document.documentElement.style;
    rootStyles.setProperty('--primary-hue', hue);
    rootStyles.setProperty('--primary-sat', sat);
    rootStyles.setProperty('--primary-light', light);
    updateButtonColors(hue, sat, light);
};

export const initTheme = () => {
    const toggleTheme = document.getElementById("toggle-icon");
    const toggleIcon = document.getElementById("toggle-image");
    const toggleColors = document.getElementById("toggle-colors");

    // Restaurar preferencias guardadas (tema y color)
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
        toggleIcon.src = 'assets/icons/sun-64.png';
    }

    // Versiones anteriores guardaban el texto "undefined" al elegir un acento
    // sin data-sat/data-light: se trata como ausente.
    const saved = key => {
        const v = localStorage.getItem(key);
        return v && v !== 'undefined' ? v : null;
    };

    const activeHue = saved('portfolio-hue') || '214';
    const activeSat = saved('portfolio-sat') || DEFAULT_SAT;
    const activeLight = saved('portfolio-light') || DEFAULT_LIGHT;

    applyAccent(activeHue, activeSat, activeLight);

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
            // Sin data-sat/data-light se usan los valores por defecto: antes se
            // quedaban los del acento anterior (p. ej. el 40% de luz del vino).
            const sat = e.target.dataset.sat || DEFAULT_SAT;
            const light = e.target.dataset.light || DEFAULT_LIGHT;

            applyAccent(hue, sat, light);

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
