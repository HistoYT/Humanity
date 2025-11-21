// Script de navegación: todos los botones "Empezar" llevan a la siguiente sección

document.addEventListener('DOMContentLoaded', function() {
    // Definir el orden de las secciones
    const sections = [
        { id: 'hero', nextId: 'info-section', button: 'startButton' },
        { id: 'info-section', nextId: 'dynamic-section', button: null },
        { id: 'dynamic-section', nextId: 'immersive-section', button: null },
        { id: 'immersive-section', nextId: 'info-alt-section', button: null },
        { id: 'info-alt-section', nextId: 'quality-section', button: null },
        { id: 'quality-section', nextId: 'escandalos-section', button: null },
        { id: 'escandalos-section', nextId: 'caso-enron', button: 'escStartBtn' },
        { id: 'intro-tema-section', nextId: 'def-gc-section', button: 'introTemasButton' },
        { id: 'def-gc-section', nextId: 'game-section', button: null },
        { id: 'game-section', nextId: 'fundaciones-section', button: null },
        { id: 'fundaciones-section', nextId: null, button: 'fundacionesStartBtn' }
    ];

    // Función para navegar a la siguiente sección
    function navigateToSection(nextSectionId) {
        const nextSection = document.getElementById(nextSectionId);
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Asignar listeners a todos los botones
    sections.forEach(section => {
        if (section.button) {
            const btn = document.getElementById(section.button);
            if (btn) {
                btn.addEventListener('click', function() {
                    if (section.nextId) {
                        navigateToSection(section.nextId);
                    }
                });
            }
        }
    });

    // Botón específico: volver a Escándalos desde Enron
    const volverBtn = document.getElementById('volver-esc');
    if (volverBtn) {
        volverBtn.addEventListener('click', function() {
            navigateToSection('escandalos-section');
        });
    }
});
