export let languageDataRef = {};
export const setLanguageData = (data) => {
    languageDataRef = data;
};

// ── Efecto Typewriter en el subtítulo de perfil ─────────────────────────
const typewriterRoles = {
    es: [
        'DESARROLLADOR WEB FULL-STACK',
        'BACK-END DEVELOPER EN AYESA DIGITAL',
    ],
    en: [
        'FULL-STACK WEB DEVELOPER',
        'BACK-END DEVELOPER AT AYESA DIGITAL',
    ],
};

let twIndex = 0;
let twCharIndex = 0;
let twDeleting = false;
let twTimeout = null;

const SPEED_TYPE = 65;
const SPEED_DELETE = 35;
const PAUSE_AFTER = 2000;
const PAUSE_NEXT = 400;

export const resetTypewriter = (lang = 'es') => {
    clearTimeout(twTimeout);
    twIndex = 0;
    twCharIndex = 0;
    twDeleting = false;
    const typewriterEl = document.getElementById('typewriter-text');
    if (typewriterEl) typewriterEl.textContent = '';
    
    const typewriterTick = () => {
        if (!typewriterEl) return;
        const roles = typewriterRoles[lang] || typewriterRoles['es'];
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

    twTimeout = setTimeout(typewriterTick, 300);
};

// ── Botones Ver Más / Ver Menos ──────────────────────────────────────────
const READ_MORE_THRESHOLD = 200;

export const initReadMore = () => {
    const labelMore = languageDataRef?.ui?.['read-more'] || 'Ver más';
    const labelLess = languageDataRef?.ui?.['read-less'] || 'Ver menos';

    const descriptions = document.querySelectorAll('.experience__description, .education__description');

    descriptions.forEach(desc => {
        const existingWrapper = desc.querySelector('.description-wrapper');
        if (existingWrapper) {
            desc.innerHTML = existingWrapper.querySelector('.description-text').innerHTML;
        }

        const plainText = desc.textContent.trim();
        if (plainText.length <= READ_MORE_THRESHOLD) return;

        const originalHTML = desc.innerHTML;
        const wrapper = document.createElement('div');
        wrapper.className = 'description-wrapper is-collapsed';

        const textSpan = document.createElement('div');
        textSpan.className = 'description-text';
        textSpan.innerHTML = originalHTML;

        const btn = document.createElement('button');
        btn.className = 'btn-read-more';
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `${labelMore} <i class="btn-read-more__icon">▾</i>`;

        btn.addEventListener('click', () => {
            const isExpanded = wrapper.classList.contains('is-expanded');
            if (isExpanded) {
                wrapper.classList.replace('is-expanded', 'is-collapsed');
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = `${labelMore} <i class="btn-read-more__icon">▾</i>`;
            } else {
                wrapper.classList.replace('is-collapsed', 'is-expanded');
                btn.setAttribute('aria-expanded', 'true');
                btn.innerHTML = `${labelLess} <i class="btn-read-more__icon">▾</i>`;
            }
        });

        wrapper.appendChild(textSpan);
        wrapper.appendChild(btn);

        desc.innerHTML = '';
        desc.appendChild(wrapper);
    });
};

export const initUI = () => {
    // Accesibilidad Teclado (botones div/roles custom)
    document.addEventListener("keydown", (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
            e.preventDefault();
            e.target.click();
        }
    });

    // Botón Volver Arriba
    const btnScrollTop = document.getElementById("btn-scroll-top");
    if (btnScrollTop) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                btnScrollTop.classList.add("visible");
            } else {
                btnScrollTop.classList.remove("visible");
            }
        });

        btnScrollTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
};
