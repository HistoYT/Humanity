// Juego de Decisiones: Gobierno Corporativo

const gameData = {
    scenarios: [
        {
            id: 1,
            title: "Presión por resultados",
            text: "Tu empresa necesita aumentar ganancias rápidamente. Un empleado sugiere reporting no del todo transparente para mostrar mejores números. ¿Qué haces?",
            optionA: {
                text: "Rechazar la propuesta y establecer auditorías internas más estrictas",
                transparency: +20,
                gains: -5,
                reputation: +15
            },
            optionB: {
                text: "Permitir el reporting flexible para alcanzar objetivos",
                transparency: -25,
                gains: +30,
                reputation: -20
            }
        },
        {
            id: 2,
            title: "Conflicto de intereses",
            text: "Un miembro de la junta directiva tiene relaciones familiares con un proveedor importante. Esto podría crear un conflicto de intereses. ¿Cómo actúas?",
            optionA: {
                text: "Establecer reglas claras de recusación e implementarlas firmemente",
                transparency: +25,
                gains: -10,
                reputation: +20
            },
            optionB: {
                text: "Ignorarlo; confiar en que hará lo correcto",
                transparency: -30,
                gains: +20,
                reputation: -25
            }
        },
        {
            id: 3,
            title: "Decisión final",
            text: "Se descubre un problema de seguridad en un producto. Publicarlo puede costar millones, pero ocultarlo viola regulaciones. ¿Cuál es tu decisión?",
            optionA: {
                text: "Revelar transparentemente y reparar el daño con integridad",
                transparency: +30,
                gains: -20,
                reputation: +35
            },
            optionB: {
                text: "Minimizar el problema y esperar a que pase desapercibido",
                transparency: -40,
                gains: +40,
                reputation: -40
            }
        },
        {
            id: 4,
            title: "Presión accionista vs. sostenibilidad",
            text: "Los accionistas exigen máximas ganancias trimestrales. La junta propone reducir gastos en investigación ambiental (muy costosa) y pagar dividendos extraordinarios. Sabes que esto comprometería objetivos ESG a largo plazo. ¿Qué decides?",
            optionA: {
                text: "Mantener inversión ambiental y explicar el valor a largo plazo a accionistas",
                transparency: +15,
                gains: -18,
                reputation: +25
            },
            optionB: {
                text: "Ceder a la presión; reducir gastos ambientales para maximizar dividendos",
                transparency: -35,
                gains: +35,
                reputation: -30
            }
        },
        {
            id: 5,
            title: "Silenciamiento de denunciante interno",
            text: "Un empleado te informa sobre prácticas laborales cuestionables en una filial. Tu equipo legal sugiere ofrecerle una compensación generosa a cambio de su silencio. Revelar el problema públicamente causará escándalo, pero ocultarlo es éticamente cuestionable. ¿Cuál es tu postura?",
            optionA: {
                text: "Investigar transparentemente, remediar el problema y proteger al denunciante",
                transparency: +40,
                gains: -25,
                reputation: +40
            },
            optionB: {
                text: "Ofrecer compensación confidencial para enterrar el asunto discretamente",
                transparency: -50,
                gains: +15,
                reputation: -45
            }
        },
        {
            id: 6,
            title: "Crisis de confianza global",
            text: "Una investigación periodística revela prácticas cuestionables de décadas. Tienes dos opciones: admitir responsabilidad histórica, pedir perdón y restructurar completamente, o negar y culpar a 'malas manzanas' del pasado. ¿Cómo respondes?",
            optionA: {
                text: "Asumir responsabilidad total, transparencia radical y reforma institucional profunda",
                transparency: +50,
                gains: -30,
                reputation: +50
            },
            optionB: {
                text: "Negar culpa corporativa y culpar a empleados anteriores; mantener status quo",
                transparency: -60,
                gains: +20,
                reputation: -60
            }
        }
    ]
};

class CorporateGame {
    constructor() {
        this.currentScenario = 0;
        this.stats = {
            transparency: 50,
            gains: 50,
            reputation: 50
        };
        this.init();
    }

    init() {
        document.getElementById('gameStartBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('decisionA')?.addEventListener('click', () => this.makeDecision('a'));
        document.getElementById('decisionB')?.addEventListener('click', () => this.makeDecision('b'));
        document.getElementById('gameRestartBtn')?.addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.currentScenario = 0;
        this.stats = { transparency: 50, gains: 50, reputation: 50 };
        this.showGameScreen();
        this.loadScenario();
    }

    showGameScreen() {
        document.getElementById('gameStart').style.display = 'none';
        document.getElementById('gamePlay').style.display = 'block';
        document.getElementById('gameResult').style.display = 'none';
    }

    loadScenario() {
        if (this.currentScenario >= gameData.scenarios.length) {
            this.showResults();
            return;
        }

        const scenario = gameData.scenarios[this.currentScenario];

        // Actualizar progreso
        document.getElementById('progressText').textContent = `Escenario ${this.currentScenario + 1} de ${gameData.scenarios.length}`;
        const progress = ((this.currentScenario + 1) / gameData.scenarios.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        // Cargar escenario
        document.getElementById('scenarioTitle').textContent = scenario.title;
        document.getElementById('scenarioText').textContent = scenario.text;

        // Cargar opciones
        document.getElementById('decisionA').textContent = scenario.optionA.text;
        document.getElementById('decisionB').textContent = scenario.optionB.text;

        // Desbloquear botones
        document.getElementById('decisionA').disabled = false;
        document.getElementById('decisionB').disabled = false;

        // Actualizar estadísticas visuales
        this.updateStatsDisplay();
    }

    makeDecision(option) {
        const scenario = gameData.scenarios[this.currentScenario];
        const decision = option === 'a' ? scenario.optionA : scenario.optionB;

        // Aplicar cambios
        this.stats.transparency += decision.transparency;
        this.stats.gains += decision.gains;
        this.stats.reputation += decision.reputation;

        // Limitar valores entre 0 y 100
        this.stats.transparency = Math.max(0, Math.min(100, this.stats.transparency));
        this.stats.gains = Math.max(0, Math.min(100, this.stats.gains));
        this.stats.reputation = Math.max(0, Math.min(100, this.stats.reputation));

        // Bloquear botones durante la transición
        document.getElementById('decisionA').disabled = true;
        document.getElementById('decisionB').disabled = true;

        // Actualizar stats
        this.updateStatsDisplay();

        // Pausa antes de siguiente escenario
        setTimeout(() => {
            this.currentScenario++;
            this.loadScenario();
        }, 1200);
    }

    updateStatsDisplay() {
        document.getElementById('statTransparency').style.width = this.stats.transparency + '%';
        document.getElementById('statTransparencyValue').textContent = this.stats.transparency + '%';

        document.getElementById('statGains').style.width = this.stats.gains + '%';
        document.getElementById('statGainsValue').textContent = this.stats.gains + '%';

        document.getElementById('statReputation').style.width = this.stats.reputation + '%';
        document.getElementById('statReputationValue').textContent = this.stats.reputation + '%';
    }

    showResults() {
        document.getElementById('gamePlay').style.display = 'none';
        document.getElementById('gameResult').style.display = 'flex';

        // Determinar mensaje final basado en balances
        let resultTitle = '';
        let resultMessage = '';

        const avg = (this.stats.transparency + this.stats.gains + this.stats.reputation) / 3;

        if (this.stats.transparency > 70 && this.stats.reputation > 70) {
            resultTitle = '✨ Liderazgo Ético';
            resultMessage = 'Tu empresa se ha convertido en un modelo de transparencia y ética empresarial. Los empleados confían en ti y los clientes te respaldan. ¡Verdadero éxito sostenible!';
        } else if (this.stats.gains > 75 && this.stats.transparency < 40) {
            resultTitle = '💰 Cortoplacismo';
            resultMessage = 'Ganaste dinero rápidamente, pero tu reputación se ha visto comprometida. Las regulaciones y auditorías externas ahora te vigilan de cerca. ¿Fue realmente rentable?';
        } else if (this.stats.reputation > 75) {
            resultTitle = '🌟 Reconocimiento Social';
            resultMessage = 'Tu empresa es admirada por su integridad. Aunque los números financieros no son espectaculares, tu marca es valiosa y atrae talento de calidad.';
        } else if (avg < 35) {
            resultTitle = '⚠️ Crisis Corporativa';
            resultMessage = 'Tu gestión ha llevado a la empresa a una crisis. Baja confianza, ganancias limitadas y reputación dañada. Se necesita un cambio urgente de dirección.';
        } else {
            resultTitle = '⚖️ Equilibrio Delicado';
            resultMessage = 'Has logrado un balance relativo entre transparencia, ganancias y reputación, aunque hay áreas para mejorar. El camino del equilibrio es desafiante pero posible.';
        }

        document.getElementById('resultTitle').textContent = resultTitle;
        document.getElementById('resultMessage').textContent = resultMessage;

        document.getElementById('resultTransparency').textContent = this.stats.transparency + '%';
        document.getElementById('resultGains').textContent = this.stats.gains + '%';
        document.getElementById('resultReputation').textContent = this.stats.reputation + '%';
    }

    restartGame() {
        document.getElementById('gameResult').style.display = 'none';
        document.getElementById('gameStart').style.display = 'flex';
        this.currentScenario = 0;
        this.stats = { transparency: 50, gains: 50, reputation: 50 };
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CorporateGame();
});
