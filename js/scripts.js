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
    

    const changeLanguage = async (language) => {
        try {
            const requestJson = await fetch(`./languages/${language}.json`);
            
            languageData = await requestJson.json(); 
            currentLanguage = language;
            

            for (const textToChange of textsToChange) {
                const section = textToChange.dataset.section;
                const value = textToChange.dataset.value;

                if (languageData[section] && languageData[section][value]) {
                    textToChange.innerHTML = languageData[section][value];
                }
            }
            
            
            
            updateToggleText();
            
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
            
            colorHeader.style.backgroundColor = "#968369";
            toggleIcon.src = "assets/icons/sun.png";
        } else {
            
            colorHeader.style.backgroundColor = "hsl(0, 0%, 20%)";
            toggleIcon.src = "assets/icons/moon.png";
        }

        
        updateToggleText();
        
    });

    toggleColors.addEventListener("click", (e) => {
        if (e.target.dataset.color) {
            rootStyles.setProperty("--primary-color", e.target.dataset.color);
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