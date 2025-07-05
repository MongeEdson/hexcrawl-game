// Módulo de Interface do Usuário
class UIManager {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('hex-map');
        this.ctx = this.canvas.getContext('2d');
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.hoveredHex = null;
        
        this.initializeEventListeners();
        this.resizeCanvas();
    }

    // Inicializa event listeners
    initializeEventListeners() {
        // Controles do mapa
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.game.hexManager.setZoom(this.game.hexManager.zoom + 0.2);
            this.render();
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.game.hexManager.setZoom(this.game.hexManager.zoom - 0.2);
            this.render();
        });

        document.getElementById('center-map').addEventListener('click', () => {
            this.game.hexManager.centerOnCurrentHex();
            this.render();
        });

        // Controles do jogo
        document.getElementById('save-btn').addEventListener('click', () => {
            this.game.saveGame();
            this.addLogEntry('Jogo salvo com sucesso!');
        });

        document.getElementById('load-btn').addEventListener('click', () => {
            if (this.game.loadGame()) {
                this.addLogEntry('Jogo carregado com sucesso!');
                this.updateUI();
                this.render();
            } else {
                this.addLogEntry('Nenhum jogo salvo encontrado.');
            }
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.showModal('Novo Jogo', 'Tem certeza que deseja iniciar um novo jogo? O progresso atual será perdido.', () => {
                this.game.newGame();
                this.addLogEntry('Novo jogo iniciado!');
                this.updateUI();
                this.render();
            });
        });

        // Eventos do canvas
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Redimensionamento
        window.addEventListener('resize', () => this.resizeCanvas());

        // Fechar menu de contexto ao clicar fora
        document.addEventListener('click', (e) => this.hideContextMenu());
        document.addEventListener('contextmenu', (e) => {
            if (!this.canvas.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Modal
        document.getElementById('modal-confirm').addEventListener('click', () => {
            if (this.modalCallback) {
                this.modalCallback();
            }
            this.hideModal();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.hideModal();
        });
    }

    // Redimensiona o canvas
    resizeCanvas() {
        const container = document.getElementById('map-section');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.game.hexManager.mapCenter = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.render();
    }

    // Eventos do mouse
    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMousePos = this.getMousePos(e);
    }

    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);
        
        if (this.isDragging) {
            const deltaX = mousePos.x - this.lastMousePos.x;
            const deltaY = mousePos.y - this.lastMousePos.y;
            this.game.hexManager.moveMap(deltaX, deltaY);
            this.render();
        } else {
            // Hover effect
            const hexCoords = this.game.hexManager.pixelToHex(mousePos.x, mousePos.y);
            const newHoveredHex = `${hexCoords.q},${hexCoords.r}`;
            
            if (newHoveredHex !== this.hoveredHex) {
                this.hoveredHex = newHoveredHex;
                this.render();
            }
        }
        
        this.lastMousePos = mousePos;
    }

    handleMouseUp(e) {
        this.isDragging = false;
    }

    handleClick(e) {
        if (this.isDragging) return;
        
        // Esconde o menu de contexto se estiver visível
        this.hideContextMenu();
    }

    handleRightClick(e) {
        e.preventDefault(); // Previne o menu de contexto padrão do navegador
        
        const mousePos = this.getMousePos(e);
        const hexCoords = this.game.hexManager.pixelToHex(mousePos.x, mousePos.y);
        
        // Mostra o menu de contexto
        this.showContextMenu(mousePos.x, mousePos.y, hexCoords);
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
        this.game.hexManager.setZoom(this.game.hexManager.zoom + zoomFactor);
        this.render();
    }

    // Obtém posição do mouse relativa ao canvas
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // Renderiza o mapa
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const visibleHexes = this.game.hexManager.getVisibleHexes();
        const currentHex = this.game.hexManager.getCurrentHex();
        
        // Desenha hexágonos
        visibleHexes.forEach(hex => {
            let color, strokeColor, lineWidth = 2;
            
            if (!hex.discovered) {
                // Hexágono não descoberto
                color = '#2c3e50';
                strokeColor = '#34495e';
            } else {
                // Hexágono descoberto
                const terrainInfo = this.game.terrainManager.getTerrainInfo(hex.terrain);
                color = terrainInfo.color;
                strokeColor = terrainInfo.darkColor;
                
                // Destaca hexágono atual
                if (currentHex && hex.q === currentHex.q && hex.r === currentHex.r) {
                    strokeColor = '#f39c12';
                    lineWidth = 4;
                }
                
                // Efeito hover
                if (this.hoveredHex === hex.key) {
                    color = this.lightenColor(color, 20);
                }
            }
            
            this.game.hexManager.drawHex(this.ctx, hex.q, hex.r, color, strokeColor, lineWidth);
            
            // Desenha texto se descoberto
            if (hex.discovered) {
                const terrainInfo = this.game.terrainManager.getTerrainInfo(hex.terrain);
                this.game.hexManager.drawHexText(this.ctx, hex.q, hex.r, terrainInfo.name.charAt(0), '#000');
            } else {
                this.game.hexManager.drawHexText(this.ctx, hex.q, hex.r, '?', '#7f8c8d');
            }
        });
        
        // Desenha indicador de posição atual
        if (currentHex) {
            const center = this.game.hexManager.hexToPixel(currentHex.q, currentHex.r);
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fill();
            this.ctx.strokeStyle = '#c0392b';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    // Clareia uma cor
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Atualiza interface do usuário
    updateUI() {
        const timeInfo = this.game.timeManager.getTimeInfo();
        const playerStatus = this.game.player.getStatus();
        const currentHex = this.game.hexManager.getCurrentHex();
        
        // Atualiza tempo
        document.getElementById('clock').textContent = timeInfo.formattedTime;
        document.getElementById('period').textContent = timeInfo.period.name;
        
        // Atualiza pontos de jornada
        document.getElementById('pj-current').textContent = playerStatus.currentJourneyPoints;
        document.getElementById('pj-max').textContent = playerStatus.maxJourneyPoints;
        document.getElementById('movement-value').textContent = playerStatus.movement;
        
        // Atualiza informações do hex atual
        if (currentHex) {
            const terrainInfo = this.game.terrainManager.getTerrainInfo(currentHex.terrain);
            const climateInfo = this.game.terrainManager.getClimateInfo(currentHex.climate);
            const dangerInfo = this.game.terrainManager.getDangerInfo(currentHex.danger);
            
            document.getElementById('hex-terrain').textContent = terrainInfo.name;
            document.getElementById('hex-climate').textContent = climateInfo.name;
            document.getElementById('hex-danger').textContent = dangerInfo.name;
            document.getElementById('hex-coords').textContent = `Hex (${currentHex.q}, ${currentHex.r})`;
        }
    }

    // Mostra o menu de contexto
    showContextMenu(x, y, hexCoords) {
        const contextMenu = document.getElementById('context-menu');
        const currentHex = this.game.hexManager.getCurrentHex();
        
        if (!currentHex) return;
        
        // Determina que tipo de ações estão disponíveis
        const clickedHex = this.game.hexManager.getHex(hexCoords.q, hexCoords.r);
        const adjacent = this.game.hexManager.getAdjacentHexes(currentHex.q, currentHex.r);
        const isCurrentHex = hexCoords.q === currentHex.q && hexCoords.r === currentHex.r;
        const isAdjacent = adjacent.some(adj => adj.q === hexCoords.q && adj.r === hexCoords.r);
        
        let actions = [];
        
        if (isCurrentHex) {
            // Ações no hex atual
            actions = this.game.getAvailableActions().filter(action => 
                ['explorar', 'descansar', 'forragear', 'cacar', 'pescar', 'procurar_agua', 'acampar'].includes(action.id)
            );
        } else if (isAdjacent) {
            // Ações para hexágonos adjacentes
            if (!clickedHex || !clickedHex.discovered) {
                actions = [this.game.createActionInfo('revelar')];
            } else {
                actions = [
                    this.game.createActionInfo('viajar'),
                    this.game.createActionInfo('marchar')
                ];
            }
        }
        
        if (actions.length === 0) {
            return; // Não mostra menu se não há ações
        }
        
        // Popula o menu de contexto
        this.populateContextMenu(actions, hexCoords);
        
        // Posiciona o menu
        const rect = this.canvas.getBoundingClientRect();
        const menuX = rect.left + x;
        const menuY = rect.top + y;
        
        // Ajusta posição para não sair da tela
        const menuWidth = 250;
        const menuHeight = Math.min(300, actions.length * 50 + 60);
        
        let finalX = menuX;
        let finalY = menuY;
        
        if (menuX + menuWidth > window.innerWidth) {
            finalX = window.innerWidth - menuWidth - 10;
        }
        
        if (menuY + menuHeight > window.innerHeight) {
            finalY = window.innerHeight - menuHeight - 10;
        }
        
        contextMenu.style.left = `${finalX}px`;
        contextMenu.style.top = `${finalY}px`;
        contextMenu.classList.remove('hidden');
    }
    
    // Popula o menu de contexto com ações
    populateContextMenu(actions, hexCoords) {
        const actionsContainer = document.getElementById('context-menu-actions');
        actionsContainer.innerHTML = '';
        
        actions.forEach(action => {
            const actionElement = document.createElement('div');
            actionElement.className = `context-menu-item ${action.enabled ? '' : 'disabled'}`;
            
            actionElement.innerHTML = `
                <span class="context-menu-action-name">${action.name}</span>
                <span class="context-menu-action-cost">${action.cost} PJ / ${action.time}h</span>
            `;
            
            if (action.enabled) {
                actionElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.game.performAction(action.id, hexCoords);
                    this.hideContextMenu();
                });
            }
            
            actionsContainer.appendChild(actionElement);
        });
    }
    
    // Esconde o menu de contexto
    hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.classList.add('hidden');
    }

    // Adiciona entrada no log
    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('log-content');
        
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        
        const timestamp = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        entry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Limita o número de entradas do log para performance
        if (logContent.children.length > 100) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    // Adiciona entrada de teste no log
    addTestEntry(testName, result, details = '') {
        const status = result ? 'PASSOU' : 'FALHOU';
        const type = result ? 'test-pass' : 'test-fail';
        const message = `🧪 TESTE: ${testName} - ${status}${details ? ` (${details})` : ''}`;
        this.addLogEntry(message, type);
    }
    
    // Adiciona entrada de sistema no log
    addSystemEntry(message) {
        this.addLogEntry(`⚙️ SISTEMA: ${message}`, 'system');
    }
    
    // Adiciona entrada de debug no log
    addDebugEntry(message) {
        this.addLogEntry(`🐛 DEBUG: ${message}`, 'debug');
    }
    
    // Adiciona entrada de erro no log
    addErrorEntry(message) {
        this.addLogEntry(`❌ ERRO: ${message}`, 'error');
    }
    
    // Adiciona entrada de sucesso no log
    addSuccessEntry(message) {
        this.addLogEntry(`✅ SUCESSO: ${message}`, 'success');
    }

    // Mostra modal
    showModal(title, message, callback) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal').classList.remove('hidden');
        this.modalCallback = callback;
    }

    // Esconde modal
    hideModal() {
        document.getElementById('modal').classList.add('hidden');
        this.modalCallback = null;
    }
}

