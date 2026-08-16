export const initProjects = () => {
    // ── Galería de Proyectos (Scroll) ────────────────────────────────────────
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

    // ── Filtros y Ordenamiento ───────────────────────────────────────────────
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-projects');
    const projectsList = document.getElementById('projects-list');
    
    if (!filterButtons.length || !sortSelect || !projectsList) return;

    const allProjects = Array.from(projectsList.children);
    let currentFilter = 'all';

    // Añadir atributos data para ordenar
    allProjects.forEach(project => {
        const titleEl = project.querySelector('.card__title');
        if (titleEl) {
            project.dataset.title = titleEl.textContent.trim().toLowerCase();
        }
        
        // Extraer fecha del data-value (ej: "first-project-date")
        // Como las fechas en el HTML son "Iniciado en...", usaremos un índice simple para old/new
        // Basándonos en el orden original del HTML (asumiendo que el original es newest-first)
    });
    
    // Guardar orden original
    allProjects.forEach((el, index) => el.dataset.originalIndex = index);

    const sortProjects = (projectsArray, sortType) => {
        return projectsArray.sort((a, b) => {
            switch (sortType) {
                case 'az':
                    return a.dataset.title.localeCompare(b.dataset.title);
                case 'za':
                    return b.dataset.title.localeCompare(a.dataset.title);
                case 'oldest':
                    return parseInt(b.dataset.originalIndex) - parseInt(a.dataset.originalIndex);
                case 'newest':
                case 'default':
                default:
                    return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
            }
        });
    };

    const applyFiltersAndSort = () => {
        // Filtrar
        let filteredProjects = allProjects.filter(project => {
            return currentFilter === 'all' || project.dataset.category === currentFilter;
        });

        // Ordenar
        const sortType = sortSelect.value;
        filteredProjects = sortProjects(filteredProjects, sortType);

        // Renderizar
        projectsList.innerHTML = '';
        filteredProjects.forEach(project => {
            projectsList.appendChild(project);
        });
    };

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('filter-btn--active'));
            btn.classList.add('filter-btn--active');
            currentFilter = btn.dataset.filter;
            applyFiltersAndSort();
        });
    });

    sortSelect.addEventListener('change', () => {
        applyFiltersAndSort();
        sortSelect.classList.remove('is-open');
        sortSelect.blur();
    });

    sortSelect.addEventListener('mousedown', () => {
        sortSelect.classList.toggle('is-open');
    });

    sortSelect.addEventListener('blur', () => {
        sortSelect.classList.remove('is-open');
    });
};
