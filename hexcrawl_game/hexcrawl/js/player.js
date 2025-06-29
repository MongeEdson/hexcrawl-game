// Módulo do Jogador
class Player {
    constructor() {
        this.movement = 6; // Valor base de movimento
        this.currentJourneyPoints = 6; // PJ atuais
        this.maxJourneyPoints = 6; // PJ máximos
        this.isOverloaded = false; // Sobrecarga
        this.exhausted = false; // Condição de exaustão
        
        // Recursos
        this.food = 5;
        this.water = 5;
        
        // Estatísticas
        this.stats = {
            hexesExplored: 0,
            daysElapsed: 0,
            actionsPerformed: 0
        };
    }

    // Calcula PJ máximos baseado no movimento
    calculateMaxJourneyPoints() {
        let baseMovement = this.movement;
        
        // Reduz movimento se sobrecarregado
        if (this.isOverloaded) {
            baseMovement -= 3;
        }
        
        this.maxJourneyPoints = Math.max(1, baseMovement);
        return this.maxJourneyPoints;
    }

    // Reseta PJ para o máximo (novo dia)
    resetJourneyPoints() {
        this.calculateMaxJourneyPoints();
        this.currentJourneyPoints = this.maxJourneyPoints;
        this.stats.daysElapsed++;
    }

    // Gasta pontos de jornada
    spendJourneyPoints(amount) {
        if (this.currentJourneyPoints >= amount) {
            this.currentJourneyPoints -= amount;
            this.stats.actionsPerformed++;
            return true;
        }
        return false;
    }

    // Verifica se pode realizar uma ação
    canPerformAction(cost) {
        return this.currentJourneyPoints >= cost;
    }

    // Força acampamento (gasta todos os PJ restantes)
    forceCamp() {
        this.currentJourneyPoints = 0;
        this.consumeSupplies();
        return true;
    }

    // Consome suprimentos (comida e água)
    consumeSupplies() {
        this.food = Math.max(0, this.food - 1);
        this.water = Math.max(0, this.water - 1);
    }

    // Descansa (remove exaustão)
    rest() {
        this.exhausted = false;
        return true;
    }

    // Adiciona exaustão
    addExhaustion() {
        this.exhausted = true;
    }

    // Verifica se está exausto
    isExhausted() {
        return this.exhausted;
    }

    // Define sobrecarga
    setOverloaded(overloaded) {
        this.isOverloaded = overloaded;
        this.calculateMaxJourneyPoints();
    }

    // Obtém status completo do jogador
    getStatus() {
        return {
            movement: this.movement,
            currentJourneyPoints: this.currentJourneyPoints,
            maxJourneyPoints: this.maxJourneyPoints,
            isOverloaded: this.isOverloaded,
            exhausted: this.exhausted,
            food: this.food,
            water: this.water,
            stats: { ...this.stats }
        };
    }

    // Adiciona recursos
    addFood(amount) {
        this.food += amount;
    }

    addWater(amount) {
        this.water += amount;
    }

    // Verifica se tem suprimentos suficientes
    hasSupplies() {
        return this.food > 0 && this.water > 0;
    }

    // Incrementa estatísticas
    incrementHexesExplored() {
        this.stats.hexesExplored++;
    }

    // Serializa para salvamento
    serialize() {
        return {
            movement: this.movement,
            currentJourneyPoints: this.currentJourneyPoints,
            maxJourneyPoints: this.maxJourneyPoints,
            isOverloaded: this.isOverloaded,
            exhausted: this.exhausted,
            food: this.food,
            water: this.water,
            stats: { ...this.stats }
        };
    }

    // Deserializa do salvamento
    deserialize(data) {
        this.movement = data.movement || 6;
        this.currentJourneyPoints = data.currentJourneyPoints || 6;
        this.maxJourneyPoints = data.maxJourneyPoints || 6;
        this.isOverloaded = data.isOverloaded || false;
        this.exhausted = data.exhausted || false;
        this.food = data.food || 5;
        this.water = data.water || 5;
        this.stats = data.stats || {
            hexesExplored: 0,
            daysElapsed: 0,
            actionsPerformed: 0
        };
    }
}

