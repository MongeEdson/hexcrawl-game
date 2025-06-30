// Classe principal do jogo
class HexcrawlGame {
    constructor() {
        this.terrainManager = new TerrainManager();
        this.timeManager = new TimeManager();
        this.hexManager = new HexManager(this.terrainManager);
        this.player = new Player();
        this.ui = null;
        
        // Tabela 1 - Ações e custos
        this.actionTable = {
            viajar: { cost: 'entrance', time: 6, name: 'Viajar' },
            marchar: { cost: 'half_entrance', time: 6, name: 'Marchar' },
            explorar: { cost: 'double_entrance', time: 6, name: 'Explorar' },
            descansar: { cost: 1, time: 1, name: 'Descansar' },
            acampar: { cost: 'all_remaining', time: 8, name: 'Acampar' },
            forragear: { cost: 1, time: 6, name: 'Forragear' },
            cacar: { cost: 2, time: 18, name: 'Caçar' },
            pescar: { cost: 1, time: 6, name: 'Pescar' },
            procurar_agua: { cost: 1, time: 6, name: 'Procurar Água' },
            revelar: { cost: 0, time: 0, name: 'Revelar' }
        };
    }

    // Inicializa o jogo
    initialize() {
        this.ui = new UIManager(this);
        this.newGame();
    }

    // Inicia um novo jogo
    newGame() {
        // Gera hex inicial
        const initialTerrain = this.terrainManager.generateInitialTerrain();
        const initialClimate = this.terrainManager.generateClimateZone();
        
        // Cria hex inicial
        this.hexManager.createHex(0, 0, initialTerrain, initialClimate, 'NORMAL', true);
        this.hexManager.currentHex = { q: 0, r: 0 };
        
        // Reseta jogador
        this.player = new Player();
        this.player.resetJourneyPoints();
        
        // Reseta tempo
        this.timeManager = new TimeManager();
        
        // Atualiza UI
        if (this.ui) {
            this.ui.updateUI();
            this.ui.render();
            this.ui.addLogEntry(`Jogo iniciado! Você está em um hex de ${this.terrainManager.getTerrainInfo(initialTerrain).name}.`);
        }
    }

    // Obtém ações disponíveis
    getAvailableActions() {
        const actions = [];
        const currentHex = this.hexManager.getCurrentHex();
        const adjacent = this.hexManager.getAdjacentHexes(currentHex.q, currentHex.r);
        
        // Ações no hex atual
        actions.push(this.createActionInfo('explorar'));
        actions.push(this.createActionInfo('descansar'));
        actions.push(this.createActionInfo('forragear'));
        actions.push(this.createActionInfo('cacar'));
        
        // Pescar apenas se houver água
        if (currentHex.terrain === 'OCEANO' || currentHex.terrain === 'PANTANO') {
            actions.push(this.createActionInfo('pescar'));
        }
        
        actions.push(this.createActionInfo('procurar_agua'));
        actions.push(this.createActionInfo('acampar'));
        
        // Ações para hexágonos adjacentes
        const hasUndiscovered = adjacent.some(adj => !adj.hex || !adj.hex.discovered);
        if (hasUndiscovered) {
            actions.push(this.createActionInfo('revelar'));
        }
        
        const hasDiscovered = adjacent.some(adj => adj.hex && adj.hex.discovered);
        if (hasDiscovered) {
            actions.push(this.createActionInfo('viajar'));
            actions.push(this.createActionInfo('marchar'));
        }
        
        return actions;
    }

    // Cria informações de uma ação
    createActionInfo(actionId) {
        const action = this.actionTable[actionId];
        const currentHex = this.hexManager.getCurrentHex();
        
        let cost = 0;
        let enabled = true;
        
        // Calcula custo
        if (typeof action.cost === 'number') {
            cost = action.cost;
        } else if (action.cost === 'entrance') {
            cost = this.terrainManager.getEntranceCost(currentHex.terrain);
        } else if (action.cost === 'half_entrance') {
            cost = Math.ceil(this.terrainManager.getEntranceCost(currentHex.terrain) / 2);
        } else if (action.cost === 'double_entrance') {
            cost = this.terrainManager.getEntranceCost(currentHex.terrain) * 2;
        } else if (action.cost === 'all_remaining') {
            cost = this.player.currentJourneyPoints;
        }
        
        // Verifica se pode realizar a ação
        if (actionId === 'acampar') {
            enabled = true; // Sempre pode acampar
        } else if (actionId === 'revelar') {
            enabled = true; // Revelar não custa PJ
        } else {
            enabled = this.player.canPerformAction(cost);
        }
        
        // Verifica condições especiais
        if (actionId === 'descansar' && !this.player.isExhausted()) {
            enabled = false;
        }
        
        return {
            id: actionId,
            name: action.name,
            cost: cost,
            time: action.time,
            enabled: enabled
        };
    }

    // Executa uma ação
    performAction(actionId, target = null) {
        const action = this.actionTable[actionId];
        if (!action) return false;
        
        const actionInfo = this.createActionInfo(actionId);
        
        // Verifica se pode realizar a ação
        if (!actionInfo.enabled && actionId !== 'acampar' && actionId !== 'revelar') {
            this.ui.addLogEntry(`Não é possível realizar ${action.name}. PJ insuficientes.`);
            return false;
        }
        
        // Executa a ação específica
        let success = false;
        let message = '';
        
        switch (actionId) {
            case 'viajar':
                success = this.performTravel(target, false);
                message = success ? 'Você viajou para um novo hex.' : 'Não foi possível viajar.';
                break;
                
            case 'marchar':
                success = this.performTravel(target, true);
                message = success ? 'Você marchou para um novo hex.' : 'Não foi possível marchar.';
                break;
                
            case 'explorar':
                success = this.performExplore();
                message = 'Você explorou a área.';
                break;
                
            case 'descansar':
                success = this.performRest();
                message = success ? 'Você descansou e removeu a exaustão.' : 'Você não está exausto.';
                break;
                
            case 'acampar':
                success = this.performCamp();
                message = 'Você acampou e recuperou seus PJ.';
                break;
                
            case 'forragear':
                success = this.performForage();
                message = 'Você procurou por comida.';
                break;
                
            case 'cacar':
                success = this.performHunt();
                message = 'Você caçou na área.';
                break;
                
            case 'pescar':
                success = this.performFish();
                message = 'Você pescou na área.';
                break;
                
            case 'procurar_agua':
                success = this.performSearchWater();
                message = 'Você procurou por água.';
                break;
                
            case 'revelar':
                success = this.performReveal(target);
                message = success ? 'Você revelou um novo hex!' : 'Não foi possível revelar.';
                break;
        }
        
        if (success) {
            // Gasta PJ e tempo
            if (actionId !== 'revelar') {
                this.player.spendJourneyPoints(actionInfo.cost);
                const timeResult = this.timeManager.advanceTime(actionInfo.time);
                
                // Verifica se é um novo dia
                if (timeResult.newDay) {
                    this.player.resetJourneyPoints();
                    this.ui.addLogEntry('Um novo dia começou! Seus PJ foram restaurados.');
                }
            }
            
            this.ui.addLogEntry(message);
            this.ui.updateUI();
            this.ui.render();
        }
        
        return success;
    }

    // Viaja ou marcha para um hex
    performTravel(target, isMarching = false) {
        if (!target) {
            // Seleciona automaticamente o primeiro hex adjacente descoberto
            const currentHex = this.hexManager.getCurrentHex();
            const adjacent = this.hexManager.getAdjacentHexes(currentHex.q, currentHex.r);
            const discovered = adjacent.find(adj => adj.hex && adj.hex.discovered);
            
            if (!discovered) return false;
            target = { q: discovered.q, r: discovered.r };
        }
        
        const targetHex = this.hexManager.getHex(target.q, target.r);
        if (!targetHex || !targetHex.discovered) return false;
        
        // Move para o hex
        const success = this.hexManager.moveToHex(target.q, target.r);
        
        if (success && isMarching) {
            // Marchar dobra o custo de descansar
            this.player.addExhaustion();
        }
        
        return success;
    }

    // Explora o hex atual
    performExplore() {
        const currentHex = this.hexManager.getCurrentHex();
        currentHex.explored = true;
        this.player.incrementHexesExplored();
        
        // Simula descoberta de algo interessante
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 5) {
            this.ui.addLogEntry('Você encontrou algo interessante durante a exploração!');
        }
        
        return true;
    }

    // Descansa
    performRest() {
        if (!this.player.isExhausted()) return false;
        return this.player.rest();
    }

    // Acampa
    performCamp() {
        this.player.forceCamp();
        const timeResult = this.timeManager.forceCamp();
        this.player.resetJourneyPoints();
        return true;
    }

    // Forrageia
    performForage() {
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 4) {
            const food = Math.floor(Math.random() * 3) + 1;
            this.player.addFood(food);
            this.ui.addLogEntry(`Você encontrou ${food} unidades de comida!`);
        } else {
            this.ui.addLogEntry('Você não encontrou comida.');
        }
        return true;
    }

    // Caça
    performHunt() {
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 5) {
            const food = Math.floor(Math.random() * 5) + 3;
            this.player.addFood(food);
            this.ui.addLogEntry(`Você caçou com sucesso e obteve ${food} unidades de comida!`);
        } else {
            this.ui.addLogEntry('A caça não foi bem-sucedida.');
        }
        return true;
    }

    // Pesca
    performFish() {
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 4) {
            const food = Math.floor(Math.random() * 4) + 2;
            this.player.addFood(food);
            this.ui.addLogEntry(`Você pescou com sucesso e obteve ${food} unidades de comida!`);
        } else {
            this.ui.addLogEntry('A pesca não foi bem-sucedida.');
        }
        return true;
    }

    // Procura água
    performSearchWater() {
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 4) {
            const water = Math.floor(Math.random() * 3) + 1;
            this.player.addWater(water);
            this.ui.addLogEntry(`Você encontrou ${water} unidades de água!`);
        } else {
            this.ui.addLogEntry('Você não encontrou água.');
        }
        return true;
    }

    // Revela um hex
    performReveal(target) {
        if (!target) {
            // Seleciona automaticamente o primeiro hex não descoberto
            const currentHex = this.hexManager.getCurrentHex();
            const adjacent = this.hexManager.getAdjacentHexes(currentHex.q, currentHex.r);
            const undiscovered = adjacent.find(adj => !adj.hex || !adj.hex.discovered);
            
            if (!undiscovered) return false;
            target = { q: undiscovered.q, r: undiscovered.r };
        }
        
        const currentHex = this.hexManager.getCurrentHex();
        const newHex = this.hexManager.revealHex(
            target.q, 
            target.r, 
            currentHex.terrain, 
            currentHex.climate, 
            currentHex.danger
        );
        
        if (newHex) {
            const terrainInfo = this.terrainManager.getTerrainInfo(newHex.terrain);
            const dangerInfo = this.terrainManager.getDangerInfo(newHex.danger);
            this.ui.addLogEntry(`Novo hex revelado: ${terrainInfo.name} (${dangerInfo.name})`);
            return true;
        }
        
        return false;
    }

    // Salva o jogo
    saveGame() {
        const saveData = {
            version: '1.0',
            timestamp: Date.now(),
            terrainManager: {}, // Não precisa salvar, é estático
            timeManager: this.timeManager.serialize(),
            hexManager: this.hexManager.serialize(),
            player: this.player.serialize()
        };
        
        localStorage.setItem('hexcrawl_save', JSON.stringify(saveData));
        return true;
    }

    // Carrega o jogo
    loadGame() {
        const saveData = localStorage.getItem('hexcrawl_save');
        if (!saveData) return false;
        
        try {
            const data = JSON.parse(saveData);
            
            this.timeManager.deserialize(data.timeManager);
            this.hexManager.deserialize(data.hexManager);
            this.player.deserialize(data.player);
            
            return true;
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            return false;
        }
    }
}

// Inicializa o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const game = new HexcrawlGame();
    game.initialize();
    
    // Torna o jogo acessível globalmente para debug
    window.hexcrawlGame = game;
});

