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
        // Limpa completamente o mapa existente
        this.hexManager = new HexManager(this.terrainManager);
        
        // Gera hex inicial
        const initialTerrain = this.terrainManager.generateInitialTerrain();
        const initialClimate = this.terrainManager.generateClimateZone();
        
        // Cria hex inicial
        this.hexManager.createHex(0, 0, initialTerrain, initialClimate, 'NORMAL', true);
        this.hexManager.currentHex = { q: 0, r: 0 };
        
        // Reseta jogador completamente
        this.player = new Player();
        this.player.resetJourneyPoints();
        
        // Reseta tempo completamente
        this.timeManager = new TimeManager();
        
        // Limpa o log de eventos
        if (this.ui) {
            this.ui.clearLog();
            this.ui.addLogEntry('Jogo iniciado. Bem-vindo ao Hexcrawl!');
            this.ui.addInfoEntry(`Jogo iniciado! Você está em um hex de ${this.terrainManager.getTerrainInfo(initialTerrain).name}.`);
        }
        
        // Executa testes de inicialização
        this.runInitializationTests();
        
        // Atualiza UI
        if (this.ui) {
            this.ui.updateUI();
            this.ui.render();
        }
    }
    
    // Executa testes automáticos de inicialização
    runInitializationTests() {
        this.ui.addSystemEntry('Executando testes de inicialização...');
        
        // Teste 1: Verificar se o jogador foi criado corretamente
        const playerValid = this.player && this.player.currentJourneyPoints === 6 && this.player.movement === 6;
        this.ui.addTestEntry('Criação do jogador', playerValid, `PJ: ${this.player?.currentJourneyPoints}, Movimento: ${this.player?.movement}`);
        
        // Teste 2: Verificar se o sistema de tempo foi inicializado
        const currentPeriod = this.timeManager.getCurrentPeriod();
        const timeValid = this.timeManager && this.timeManager.currentHour === 6 && currentPeriod?.name === 'Manhã';
        this.ui.addTestEntry('Sistema de tempo', timeValid, `Hora: ${this.timeManager?.currentHour}:00, Período: ${currentPeriod?.name || 'Erro'}`);
        
        // Teste 3: Verificar se o gerenciador de terrenos está funcionando
        const terrainValid = this.terrainManager && this.terrainManager.getTerrainInfo(initialTerrain);
        this.ui.addTestEntry('Sistema de terrenos', terrainValid, `Terreno inicial: ${this.terrainManager.getTerrainInfo(initialTerrain)?.name || 'Erro'}`);
        
        // Teste 4: Verificar se o gerenciador de hexágonos está funcionando
        const currentHex = this.hexManager.getCurrentHex();
        const hexValid = currentHex && currentHex.q === 0 && currentHex.r === 0;
        this.ui.addTestEntry('Sistema de hexágonos', hexValid, `Hex atual: (${currentHex?.q}, ${currentHex?.r})`);
        
        // Teste 5: Verificar se a interface está carregada
        const uiValid = this.ui && document.getElementById('hex-map') && document.getElementById('log-content');
        this.ui.addTestEntry('Interface do usuário', uiValid, `Canvas e log: ${uiValid ? 'Carregados' : 'Erro'}`);
        
        // Teste 6: Verificar se as ações estão disponíveis
        const actions = this.getAvailableActions();
        const actionsValid = actions && actions.length > 0;
        this.ui.addTestEntry('Sistema de ações', actionsValid, `Ações disponíveis: ${actions?.length || 0}`);
        
        // Teste 7: Verificar se hexágonos descobertos permanecem visíveis
        const visibleHexes = this.hexManager.getVisibleHexes();
        const discoveredHexes = visibleHexes.filter(hex => hex.discovered);
        this.ui.addTestEntry('Visibilidade de hexágonos descobertos', discoveredHexes.length > 0, `Hexágonos descobertos visíveis: ${discoveredHexes.length}`);
        
        const allTestsPassed = playerValid && timeValid && terrainValid && hexValid && uiValid && actionsValid;
        
        if (allTestsPassed) {
            this.ui.addSuccessEntry('Todos os testes de inicialização passaram!');
        } else {
            this.ui.addErrorEntry('Alguns testes de inicialização falharam!');
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
    createActionInfo(actionId, targetHex = null) {
        const action = this.actionTable[actionId];
        const currentHex = this.hexManager.getCurrentHex();
        
        let cost = 0;
        let enabled = true;
        
        // Calcula custo
        if (typeof action.cost === 'number') {
            cost = action.cost;
        } else if (action.cost === 'entrance') {
            // Para viajar/marchar, usa o custo do hex de destino
            if ((actionId === 'viajar' || actionId === 'marchar') && targetHex) {
                cost = this.terrainManager.getEntranceCost(targetHex.terrain);
            } else {
                cost = this.terrainManager.getEntranceCost(currentHex.terrain);
            }
        } else if (action.cost === 'half_entrance') {
            // Para marchar, usa metade do custo do hex de destino
            if (actionId === 'marchar' && targetHex) {
                cost = Math.ceil(this.terrainManager.getEntranceCost(targetHex.terrain) / 2);
            } else {
                cost = Math.ceil(this.terrainManager.getEntranceCost(currentHex.terrain) / 2);
            }
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
        
        // Testa se a ação é válida
        this.ui.addTestEntry(`Validação da ação ${actionId}`, !!action, `Ação encontrada: ${action ? 'Sim' : 'Não'}`);
        
        // Para ações de viagem, obtém o hex de destino
        let targetHex = null;
        if ((actionId === 'viajar' || actionId === 'marchar') && target) {
            targetHex = this.hexManager.getHex(target.q, target.r);
        }
        
        const actionInfo = this.createActionInfo(actionId, targetHex);
        
        // Verifica se pode realizar a ação
        if (!actionInfo.enabled && actionId !== 'acampar' && actionId !== 'revelar') {
            this.ui.addLogEntry(`Não é possível realizar ${action.name}. PJ insuficientes.`);
            this.ui.addTestEntry(`Execução da ação ${actionId}`, false, 'PJ insuficientes');
            return false;
        }
        
        // Testa recursos antes da ação
        const pjBefore = this.player.currentJourneyPoints;
        const timeBefore = this.timeManager.currentHour;
        
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
                
                // Testa se os recursos foram gastos corretamente
                const pjAfter = this.player.currentJourneyPoints;
                const timeAfter = this.timeManager.currentHour;
                
                const pjSpent = pjBefore - pjAfter;
                const expectedPjSpent = actionId === 'acampar' ? pjBefore : actionInfo.cost;
                const pjTestPassed = pjSpent === expectedPjSpent;
                
                this.ui.addTestEntry(`Gasto de PJ para ${actionId}`, pjTestPassed, `Esperado: ${expectedPjSpent}, Gasto: ${pjSpent}`);
                
                const timeChanged = timeAfter !== timeBefore;
                this.ui.addTestEntry(`Avanço do tempo para ${actionId}`, timeChanged, `De ${timeBefore}:00 para ${timeAfter}:00`);
                
                if (timeResult.newDay) {
                    this.ui.addSystemEntry('Novo dia iniciado! (PJ não restaurados automaticamente)');
                    this.ui.addTestEntry('Novo dia sem reset automático de PJ', this.player.currentJourneyPoints < this.player.maxJourneyPoints, `PJ atual: ${this.player.currentJourneyPoints}`);
                }
            }
            
            this.ui.addLogEntry(message);
            this.ui.addTestEntry(`Execução da ação ${actionId}`, true, 'Ação executada com sucesso');
        } else {
            this.ui.addTestEntry(`Execução da ação ${actionId}`, false, 'Ação falhou');
        }
        
        // Atualiza UI
        this.ui.updateUI();
        this.ui.render();
        
        return success;
    }

    // Executa viagem hex
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
        // Primeiro, consome todos os PJ restantes
        const pjGastos = this.player.currentJourneyPoints;
        this.player.forceCamp(); // Zera os PJ e consome suprimentos
        
        // Avança o tempo do acampamento
        const timeResult = this.timeManager.forceCamp();
        
        // Depois, restaura os PJ para o máximo
        this.player.resetJourneyPoints();
        
        this.ui.addDebugEntry(`Acampamento: ${pjGastos} PJ gastos, depois restaurados para ${this.player.maxJourneyPoints}`);
        
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

