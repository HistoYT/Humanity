document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.service-btn');
  const panels = document.querySelectorAll('.service-panel');

  if (!buttons.length || !panels.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Remover clase active de todos los botones y paneles
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      // 2. Activar el botón clickeado
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // 3. Activar el panel correspondiente
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Lógica para el Carrusel Móvil (Botones Anterior/Siguiente)
  const prevBtn = document.querySelector('.svc-prev');
  const nextBtn = document.querySelector('.svc-next');

  if (prevBtn && nextBtn) {
    const switchService = (direction) => {
      const activeBtn = document.querySelector('.service-btn.active');
      const btnsArray = Array.from(buttons);
      let currentIndex = btnsArray.indexOf(activeBtn);

      if (currentIndex === -1) currentIndex = 0;

      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % btnsArray.length; // Loop al inicio
      } else {
        newIndex = (currentIndex - 1 + btnsArray.length) % btnsArray.length; // Loop al final
      }

      // Simular click en el nuevo botón para activar toda la lógica existente
      btnsArray[newIndex].click();
      
      // Desplazar la lista de botones para que el activo sea visible
      btnsArray[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    nextBtn.addEventListener('click', () => switchService('next'));
    prevBtn.addEventListener('click', () => switchService('prev'));
  }
});
