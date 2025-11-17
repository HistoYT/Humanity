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

    // Timeline interactions: expand item on click/keyboard and optionally start game from year
    const timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
    timelineItems.forEach((item, idx) => {
        item.addEventListener('click', ()=> selectTimeline(item, idx));
        item.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); selectTimeline(item, idx); } });
    });

    function selectTimeline(item, idx){
        // Visual toggle
        const isActive = item.classList.contains('active');
        timelineItems.forEach(i=>{ i.classList.remove('active'); i.setAttribute('aria-expanded','false'); });
        if(!isActive){ item.classList.add('active'); item.setAttribute('aria-expanded','true'); }

        // Start the game from the corresponding scenario index
        function startFromIndex(){
            if(window.corporateGame && typeof window.corporateGame.startFrom === 'function'){
                // Scroll to game section for clarity
                const gameSection = document.getElementById('game-section');
                if(gameSection){ gameSection.scrollIntoView({behavior:'smooth'}); }
                // Start game at selected scenario (resets stats)
                window.corporateGame.startFrom(idx);
            }
        }

        if(window.corporateGame){
            startFromIndex();
        } else {
            // Wait for gameReady if game not initialized yet
            document.addEventListener('gameReady', startFromIndex, { once: true });
        }
    }

    // Escuchar eventos del juego para actualizar la línea de tiempo
    document.addEventListener('gameDecision', function(e){
        const detail = e.detail || {};
        const idx = Number(detail.scenarioIndex || 0);
        const choice = detail.choice;
        const impact = detail.impact || {};
        const stats = detail.stats || {};

        // Map timeline items by index (fall back to order)
        const items = Array.from(document.querySelectorAll('.timeline-item'));
        if(items.length === 0) return;

        const target = items[idx];
        if(!target) return;

        // marcar visitado y resetear estados previos
        items.forEach((it,i)=>{
            if(i <= idx) it.classList.add('visited');
            // limpiar estados positivos/negativos
            it.classList.remove('positive','negative','warning');
        });

        // Determinar signo según impacto en transparencia (heurística)
        if(typeof impact.transparency === 'number'){
            if(impact.transparency > 0) target.classList.add('positive');
            if(impact.transparency < 0) target.classList.add('negative');
        } else {
            if(choice === 'a') target.classList.add('positive'); else target.classList.add('negative');
        }

        // Si las estadísticas quedan muy bajas en transparencia, marcar warning
        if(stats.transparency !== undefined && stats.transparency < 40){
            target.classList.add('warning');
        }

        // Actualizar detalle visible con un resumen corto y animar
        const detailElem = target.querySelector('.timeline-detail');
        if(detailElem){
            const summary = `${choice === 'a' ? 'Decisión ética' : 'Decisión arriesgada'} · T:${stats.transparency}% G:${stats.gains}% R:${stats.reputation}%`;
            detailElem.textContent = summary;
        }

        // Pulse animation
        target.classList.add('pulse');
        setTimeout(()=> target.classList.remove('pulse'), 900);
    });

    // Cuando el juego termina, marcar el último evento (2001) según resultado
    document.addEventListener('gameEnd', function(e){
        const detail = e.detail || {};
        const stats = detail.stats || {};
        const items = Array.from(document.querySelectorAll('.timeline-item'));
        if(items.length === 0) return;

        // Usamos el último item para representar el desenlace (2001)
        const last = items[items.length - 1];
        last.classList.add('visited');
        // si transparencia baja => negativo, si alta => positive
        if(stats.transparency !== undefined){
            if(stats.transparency < 45) last.classList.add('negative'); else last.classList.add('positive');
        }
        // actualizar detalle con mensaje final cortoplacista / crisis / liderazgo etc.
        const msg = detail.resultTitle ? `${detail.resultTitle} · T:${stats.transparency}% G:${stats.gains}% R:${stats.reputation}%` : `Resultado final · T:${stats.transparency}%`;
        const d = last.querySelector('.timeline-detail'); if(d) d.textContent = msg;
        last.classList.add('pulse'); setTimeout(()=> last.classList.remove('pulse'), 1400);
    });
});