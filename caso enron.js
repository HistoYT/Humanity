// Interacciones inmersivas para la sección Caso Enron
document.addEventListener('DOMContentLoaded', function(){
    // Flip 3D de tarjetas (click + teclado)
    const cards = document.querySelectorAll('.caso-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e){
            toggleFlip(card);
        });
        card.addEventListener('keydown', function(e){
            if(e.key === 'Enter' || e.key === ' '){
                e.preventDefault();
                toggleFlip(card);
            }
        });
    });

    function toggleFlip(card){
        const pressed = card.getAttribute('aria-pressed') === 'true';
        if(pressed){
            card.classList.remove('is-flipped');
            card.setAttribute('aria-pressed','false');
        } else {
            card.classList.add('is-flipped');
            card.setAttribute('aria-pressed','true');
        }
    }

    // Botón volver a sección Escándalos
    const volverBtn = document.getElementById('volver-esc');
    if(volverBtn){
        volverBtn.addEventListener('click', function(){
            const esc = document.getElementById('escandalos-section');
            if(esc){
                esc.scrollIntoView({behavior:'smooth'});
            }
        });
    }

    // Parallax sutil en fotos: usa requestAnimationFrame para rendimiento
    const photos = document.querySelectorAll('.caso-photo');
    let ticking = false;
    window.addEventListener('scroll', onScroll, {passive:true});

    function onScroll(){
        if(!ticking){
            window.requestAnimationFrame(()=>{
                const rect = document.getElementById('caso-enron')?.getBoundingClientRect();
                if(rect){
                    const centerOffset = rect.top + rect.height/2 - window.innerHeight/2;
                    photos.forEach((p, i)=>{
                        const depth = (i+1) * 6; // pixels multiplier
                        const translateY = Math.round(-centerOffset / (60 + depth));
                        p.style.transform = `translateY(${translateY}px) rotate(${getRotationFor(i)})`;
                    });
                }
                ticking = false;
            });
            ticking = true;
        }
    }

    function getRotationFor(i){
        switch(i){
            case 0: return 'rotate(-6deg)';
            case 1: return 'rotate(6deg)';
            case 2: return 'rotate(-2deg)';
            case 3: return 'rotate(10deg)';
            default: return 'rotate(0deg)';
        }
    }

    // Inicializa posición una vez
    onScroll();

    // IntersectionObserver: detectar entrada/salida de la sección para revelar/ocultar
    const casoSection = document.getElementById('caso-enron');
    const casoVideo = casoSection?.querySelector('.caso-bg-video');
    if(casoSection){
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting && entry.intersectionRatio > 0.35){
                    casoSection.classList.add('in-view');
                    casoSection.setAttribute('aria-hidden','false');
                    // intentar reproducir video si está pausado
                    if(casoVideo && casoVideo.paused){ try{ casoVideo.play(); }catch(e){} }
                } else {
                    casoSection.classList.remove('in-view');
                    casoSection.setAttribute('aria-hidden','true');
                    // pausar video para ahorro de CPU
                    if(casoVideo && !casoVideo.paused){ try{ casoVideo.pause(); }catch(e){} }
                    // reset visual state: cerrar flips
                    cards.forEach(c=>{ c.classList.remove('is-flipped'); c.setAttribute('aria-pressed','false'); });
                }
            });
        },{threshold:[0,0.25,0.45,0.75]});

        observer.observe(casoSection);
    }

    // Timeline interactions: expand item on click/keyboard (independent, no game connection)
    const timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
    timelineItems.forEach((item) => {
        item.addEventListener('click', ()=> toggleTimelineItem(item));
        item.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleTimelineItem(item); } });
    });

    function toggleTimelineItem(item){
        // Visual toggle only (independent of game)
        const isActive = item.classList.contains('active');
        timelineItems.forEach(i=>{ i.classList.remove('active'); i.setAttribute('aria-expanded','false'); });
        if(!isActive){ item.classList.add('active'); item.setAttribute('aria-expanded','true'); }
    }

    // Timeline is now completely independent (no game event listeners)
});