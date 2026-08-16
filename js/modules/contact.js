import { currentLanguage } from './i18n.js';

export const initContactForm = () => {
    const contactForm = document.querySelector('.contact-form');
    const statusText = document.getElementById('contact-status');
    const MAX_MESSAGES_PER_DAY = 5;
    let countdownInterval;

    if (!contactForm || !statusText) return;

    // Mensajes traducidos para el estado del formulario
    const statusMessages = {
        es: {
            success: "¡Mensaje enviado con éxito! Te responderé pronto.",
            error: "Hubo un problema al enviar el mensaje. Inténtalo más tarde.",
            spam: "Límite de 5 mensajes diarios alcanzado."
        },
        en: {
            success: "Message sent successfully! I'll get back to you soon.",
            error: "There was a problem sending your message. Please try again later.",
            spam: "Daily limit of 5 messages reached."
        }
    };

    const showStatus = (type, lang) => {
        if (countdownInterval) clearInterval(countdownInterval);
        statusText.textContent = statusMessages[lang][type];
        statusText.className = 'contact-status'; // Reset classes
        statusText.classList.add(`contact-status--${type}`);
        
        // Limpiar el mensaje de éxito o error después de 5 segundos
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusText.textContent = '';
                statusText.className = 'contact-status';
            }, 5000);
        }
    };

    const checkSpamStatus = () => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        let sentHistory = JSON.parse(localStorage.getItem('portfolio-messages')) || [];
        sentHistory = sentHistory.filter(timestamp => (now - timestamp) < oneDay);
        
        if (sentHistory.length >= MAX_MESSAGES_PER_DAY) {
            return { allowed: false, nextTime: sentHistory[0] + oneDay };
        }
        return { allowed: true, sentHistory, now };
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita la recarga de la página
        const lang = currentLanguage || 'es';
        const spamStatus = checkSpamStatus();

        if (!spamStatus.allowed) {
            if (countdownInterval) clearInterval(countdownInterval);
            
            const updateCountdown = () => {
                const diff = spamStatus.nextTime - Date.now();
                if (diff <= 0) {
                    clearInterval(countdownInterval);
                    statusText.textContent = "";
                    statusText.className = 'contact-status';
                    return;
                }
                const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                
                const timeString = `${h}h ${m}m ${s}s`;
                const waitText = lang === 'es' ? `Disponible en ${timeString}` : `Available in ${timeString}`;
                
                statusText.textContent = `${statusMessages[lang]['spam']} ${waitText}`;
                statusText.className = 'contact-status contact-status--spam';
            };
            
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
            return;
        }

        // Registrar el nuevo mensaje antes de enviarlo
        spamStatus.sentHistory.push(spamStatus.now);
        localStorage.setItem('portfolio-messages', JSON.stringify(spamStatus.sentHistory));

        const formData = new FormData(contactForm);
        const actionUrl = contactForm.getAttribute('action');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showStatus('success', lang);
                contactForm.reset();
            } else {
                showStatus('error', lang);
                // Si el mensaje falló en formspree, revertimos el contador
                let sentHistory = JSON.parse(localStorage.getItem('portfolio-messages')) || [];
                if (sentHistory.length > 0) {
                    sentHistory.pop();
                    localStorage.setItem('portfolio-messages', JSON.stringify(sentHistory));
                }
            }
        } catch (error) {
            showStatus('error', lang);
            let sentHistory = JSON.parse(localStorage.getItem('portfolio-messages')) || [];
            if (sentHistory.length > 0) {
                sentHistory.pop();
                localStorage.setItem('portfolio-messages', JSON.stringify(sentHistory));
            }
        }
    });
};
