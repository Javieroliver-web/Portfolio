export const initModals = () => {
    // ── Utilidad de Atrapafocos (Focus Trap) ─────────────────────────────────
    const trapFocus = (e, container) => {
        const focusableElements = container.querySelectorAll('a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    };

    let lastFocusedElement = null; // Guardar elemento para restaurar el foco

    // ── Lightbox ─────────────────────────────────────────────────────────────
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox?.querySelector('.lightbox__image');
    const lightboxClose = lightbox?.querySelector('.lightbox__close');
    const lightboxPrev = lightbox?.querySelector('.lightbox__nav--prev');
    const lightboxNext = lightbox?.querySelector('.lightbox__nav--next');

    let currentLightboxGroup = [];
    let currentLightboxIndex = 0;

    const updateLightboxNav = () => {
        if (!lightbox) return;
        if (currentLightboxGroup.length <= 1) {
            if (lightboxPrev) lightboxPrev.style.display = 'none';
            if (lightboxNext) lightboxNext.style.display = 'none';
        } else {
            if (lightboxPrev) {
                lightboxPrev.style.display = 'flex';
                const prevIndex = (currentLightboxIndex - 1 + currentLightboxGroup.length) % currentLightboxGroup.length;
                lightboxPrev.setAttribute('aria-label', `Imagen anterior (${prevIndex + 1} de ${currentLightboxGroup.length})`);
            }
            if (lightboxNext) {
                lightboxNext.style.display = 'flex';
                const nextIndex = (currentLightboxIndex + 1) % currentLightboxGroup.length;
                lightboxNext.setAttribute('aria-label', `Siguiente imagen (${nextIndex + 1} de ${currentLightboxGroup.length})`);
            }
        }
        if (lightboxImage) lightboxImage.setAttribute('alt', `Imagen ampliada ${currentLightboxIndex + 1} de ${currentLightboxGroup.length}`);
    };

    const openLightbox = (imgSrc) => {
        if (!lightbox) return;
        lastFocusedElement = document.activeElement;
        if (lightboxImage) lightboxImage.src = imgSrc;
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-active');
        updateLightboxNav();
        if (lightboxClose) lightboxClose.focus();
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-active');
        if (lightboxImage) lightboxImage.src = "";
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox__content')) {
                closeLightbox();
            }
        });
    }

    // Navegación de imágenes con teclas
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'ArrowLeft' && lightboxPrev?.style.display !== 'none') {
            lightboxPrev.click();
        } else if (e.key === 'ArrowRight' && lightboxNext?.style.display !== 'none') {
            lightboxNext.click();
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    // Delegación de eventos para abrir imágenes
    document.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-lightbox-img')) {
            const container = e.target.closest('.project-gallery');
            if (container) {
                currentLightboxGroup = Array.from(container.querySelectorAll('[data-lightbox-img]'));
                currentLightboxIndex = currentLightboxGroup.indexOf(e.target);
            } else {
                currentLightboxGroup = [e.target];
                currentLightboxIndex = 0;
            }
            openLightbox(e.target.dataset.lightboxImg || e.target.src);
        }
    });

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentLightboxGroup.length > 0) {
                currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxGroup.length) % currentLightboxGroup.length;
                if (lightboxImage) lightboxImage.src = currentLightboxGroup[currentLightboxIndex].dataset.lightboxImg;
                updateLightboxNav();
            }
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentLightboxGroup.length > 0) {
                currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxGroup.length;
                if (lightboxImage) lightboxImage.src = currentLightboxGroup[currentLightboxIndex].dataset.lightboxImg;
                updateLightboxNav();
            }
        });
    }


    // ── Modal de Cursos Ayesa ───────────────────────────────────────
    const ayesaModal    = document.getElementById('ayesa-modal');
    const btnOpenModal  = document.getElementById('btn-open-ayesa-modal');
    const btnCloseModal = ayesaModal?.querySelector('.ayesa-modal__close');
    const modalBackdrop = ayesaModal?.querySelector('.ayesa-modal__backdrop');

    const openAyesaModal = () => {
        if (!ayesaModal) return;
        lastFocusedElement = document.activeElement;
        ayesaModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        btnCloseModal?.focus();
    };

    const closeAyesaModal = () => {
        if (!ayesaModal) return;
        ayesaModal.classList.remove('active');
        document.body.style.overflow = '';
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    };

    btnOpenModal?.addEventListener('click', openAyesaModal);
    btnCloseModal?.addEventListener('click', closeAyesaModal);
    modalBackdrop?.addEventListener('click', closeAyesaModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ayesaModal?.classList.contains('active')) {
            closeAyesaModal();
        }
        
        if (e.key === 'Tab' && ayesaModal?.classList.contains('active')) {
            trapFocus(e, ayesaModal);
        }
        if (e.key === 'Tab' && lightbox?.classList.contains('active')) {
            trapFocus(e, lightbox);
        }
    });
};
