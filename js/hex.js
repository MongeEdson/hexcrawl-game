// Módulo de Hexágonos
class HexManager {
    constructor(terrainManager) {
        this.terrainManager = terrainManager;
        this.hexMap = new Map(); // Mapa de hexágonos descobertos
        this.currentHex = { q: 0, r: 0 }; // Coordenadas axiais
        this.hexSize = 30; // Tamanho do hexágono
        this.mapCenter = { x: 400, y: 300 }; // Centro do mapa
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
    }

    // Cria um novo hexágono
    createHex(q, r, terrain, climate, danger, discovered = false) {
        const key = this.getHexKey(q, r);
        const hex = {
            q, r,
            terrain,
            climate,
            danger,
            discovered,
            explored: false,
            key
        };
        
        this.hexMap.set(key, hex);
        return hex;
    }

    // Gera chave única para o hexágono
    getHexKey(q, r) {
        return `${q},${r}`;
    }

    // Obtém hexágono pelas coordenadas
    getHex(q, r) {
        return this.hexMap.get(this.getHexKey(q, r));
    }

    // Obtém hexágonos adjacentes
    getAdjacentHexes(q, r) {
        const directions = [
            { q: 1, r: 0 },   // Direita
            { q: 1, r: -1 },  // Direita-cima
            { q: 0, r: -1 },  // Cima
            { q: -1, r: 0 },  // Esquerda
            { q: -1, r: 1 },  // Esquerda-baixo
            { q: 0, r: 1 }    // Baixo
        ];
        
        return directions.map(dir => ({
            q: q + dir.q,
            r: r + dir.r,
            hex: this.getHex(q + dir.q, r + dir.r)
        }));
    }

    // Converte coordenadas axiais para pixel
    hexToPixel(q, r) {
        const x = this.hexSize * (3/2 * q);
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        
        return {
            x: x * this.zoom + this.mapCenter.x + this.offset.x,
            y: y * this.zoom + this.mapCenter.y + this.offset.y
        };
    }

    // Converte pixel para coordenadas axiais
    pixelToHex(x, y) {
        // Ajusta para offset e zoom
        const adjustedX = (x - this.mapCenter.x - this.offset.x) / this.zoom;
        const adjustedY = (y - this.mapCenter.y - this.offset.y) / this.zoom;
        
        const q = (2/3 * adjustedX) / this.hexSize;
        const r = (-1/3 * adjustedX + Math.sqrt(3)/3 * adjustedY) / this.hexSize;
        
        return this.roundHex(q, r);
    }

    // Arredonda coordenadas fracionárias para hexágono mais próximo
    roundHex(q, r) {
        const s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);
        
        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);
        
        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }
        
        return { q: rq, r: rr };
    }

    // Desenha um hexágono
    drawHex(ctx, q, r, color, strokeColor = '#333', lineWidth = 2) {
        const center = this.hexToPixel(q, r);
        const size = this.hexSize * this.zoom;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = center.x + size * Math.cos(angle);
            const y = center.y + size * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        
        // Preenchimento
        ctx.fillStyle = color;
        ctx.fill();
        
        // Contorno
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        
        return center;
    }

    // Desenha texto no hexágono
    drawHexText(ctx, q, r, text, color = '#000') {
        const center = this.hexToPixel(q, r);
        const fontSize = Math.max(8, this.hexSize * this.zoom * 0.3);
        
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, center.x, center.y);
    }

    // Revela um hexágono (gera novo terreno)
    revealHex(q, r, fromTerrain, climate, currentDanger) {
        const existingHex = this.getHex(q, r);
        if (existingHex && existingHex.discovered) {
            return existingHex;
        }
        
        // Gera novo terreno usando a Tabela 15
        const generation = this.terrainManager.generateNewTerrain(fromTerrain, climate, currentDanger);
        
        const hex = this.createHex(q, r, generation.terrain, climate, generation.danger, true);
        return hex;
    }

    // Move o jogador para um hexágono
    moveToHex(q, r) {
        const hex = this.getHex(q, r);
        if (!hex || !hex.discovered) {
            return false;
        }
        
        this.currentHex = { q, r };
        return true;
    }

    // Obtém hexágono atual
    getCurrentHex() {
        return this.getHex(this.currentHex.q, this.currentHex.r);
    }

    // Centraliza mapa no hexágono atual
    centerOnCurrentHex() {
        this.offset = { x: 0, y: 0 };
    }

    // Ajusta zoom
    setZoom(newZoom) {
        this.zoom = Math.max(0.5, Math.min(3, newZoom));
    }

    // Move o mapa
    moveMap(deltaX, deltaY) {
        this.offset.x += deltaX;
        this.offset.y += deltaY;
    }

    // Obtém todos os hexágonos visíveis
    getVisibleHexes() {
        const visible = [];
        
        // Adiciona hexágono atual
        const currentHex = this.getCurrentHex();
        if (currentHex) {
            visible.push(currentHex);
        }
        
        // Adiciona hexágonos adjacentes (descobertos e não descobertos)
        const adjacent = this.getAdjacentHexes(this.currentHex.q, this.currentHex.r);
        adjacent.forEach(adj => {
            if (adj.hex) {
                visible.push(adj.hex);
            } else {
                // Cria hexágono não descoberto
                const undiscoveredHex = {
                    q: adj.q,
                    r: adj.r,
                    terrain: null,
                    climate: null,
                    danger: null,
                    discovered: false,
                    explored: false,
                    key: this.getHexKey(adj.q, adj.r)
                };
                visible.push(undiscoveredHex);
            }
        });
        
        // CORREÇÃO: Adiciona TODOS os hexágonos descobertos, independente da distância
        this.hexMap.forEach(hex => {
            if (hex.discovered && !visible.find(v => v.key === hex.key)) {
                visible.push(hex);
            }
        });
        
        return visible;
    }

    // Serializa para salvamento
    serialize() {
        const hexArray = Array.from(this.hexMap.values());
        return {
            hexMap: hexArray,
            currentHex: this.currentHex,
            zoom: this.zoom,
            offset: this.offset
        };
    }

    // Deserializa do salvamento
    deserialize(data) {
        this.hexMap.clear();
        
        if (data.hexMap) {
            data.hexMap.forEach(hex => {
                this.hexMap.set(hex.key, hex);
            });
        }
        
        this.currentHex = data.currentHex || { q: 0, r: 0 };
        this.zoom = data.zoom || 1;
        this.offset = data.offset || { x: 0, y: 0 };
    }
}

