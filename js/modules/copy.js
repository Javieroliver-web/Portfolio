/**
 * Copy to Clipboard functionality and Toast notifications
 */

export const initCopyButtons = () => {
    const copyBtns = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');
    let toastTimeout;

    if (!toast) return;

    copyBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const textToCopy = btn.getAttribute('data-copy');
            
            if (!textToCopy) return;

            try {
                // Check if the Clipboard API is supported
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    // Fallback for older browsers or non-secure contexts
                    const textArea = document.createElement("textarea");
                    textArea.value = textToCopy;
                    textArea.style.position = "absolute";
                    textArea.style.left = "-999999px";
                    document.body.prepend(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                    } catch (error) {
                        console.error('Fallback copy failed', error);
                    } finally {
                        textArea.remove();
                    }
                }
                showToast();
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });

    function showToast() {
        // Clear any existing timeout to prevent the toast from hiding prematurely if clicked multiple times
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toast.classList.remove('show');
            
            // Force a reflow so the transition restarts smoothly
            void toast.offsetWidth;
        }
        
        toast.classList.add('show');
        
        // Hide after 3 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};
