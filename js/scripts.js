document.addEventListener("DOMContentLoaded", () => {

    const toggleTheme = document.getElementById("toggle-icon");
    const toggleIcon = document.getElementById("toggle-image");
    const toggleText = document.getElementById("toggle-text");

    const toggleColors = document.getElementById("toggle-colors");

    const colorHeader = document.getElementById("--header");
    const cardText = document.getElementById("card__text");
    const cardTitle = document.getElementById("card__title");
    const cardSubtitle = document.getElementById("card__subtitle");

    const skillsText = document.getElementsByClassName("skills__tech")
    
    
    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
    const titleColor = getComputedStyle(document.documentElement).getPropertyValue("card__title");

    const rootStyles = document.documentElement.style;
    
    const flagsElement = document.getElementById("flags")

    const textsToChange = document.querySelectorAll("[data-section]");

        const changeLanguage = async (language) => {
        const requestJson = await fetch(`./languages/${language}
        .json`);
        const texts = await requestJson.json();

        for(const textToChange of textsToChange) {
            const section = textToChange.dataset.section;
            const value = textToChange.dataset.value;

            textToChange.innerHTML=texts[section][value];
        }
    };

    flagsElement.addEventListener("click", (e) => {
        changeLanguage(e.target.parentElement.dataset.language);
    })

    toggleTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        if (toggleIcon.src.includes("moon.png")){
            colorHeader.style.backgroundColor ="#968369"
            toggleIcon.src="assets/icons/sun.png";
            toggleText.textContent="Modo Claro";
            cardText.style.color="black";
            cardTitle.style.color="#7D7D7E";
            cardSubtitle.style.color="#7D7D7E";
            skillsText.style.color="#7D7D7E";
            
        }else{
            colorHeader.style.backgroundColor ="hsl(0, 0%, 20%)"
            toggleIcon.src = "assets/icons/moon.png";
            toggleText.textContent = "Modo Oscuro";
            cardText.style.color = textColor;
            cardTitle.style.color = titleColor;
            cardSubtitle.style.color= titleColor;
            skillsText.style.color = textColor;
            
        }
    });
    
    toggleColors.addEventListener("click", (e) => {
        rootStyles.setProperty("--primary-color", e.target.dataset.color);
    });

});