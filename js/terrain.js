// Módulo de Terrenos
class TerrainManager {
    constructor() {
        this.terrainTypes = {
            GELEIRA: { 
                id: 1, 
                name: 'Geleira', 
                cost: 3, 
                color: '#E6F3FF',
                darkColor: '#B8D4F0'
            },
            PANTANO: { 
                id: 2, 
                name: 'Pântano', 
                cost: 3, 
                color: '#8B4513',
                darkColor: '#654321'
            },
            FLORESTA: { 
                id: 3, 
                name: 'Floresta', 
                cost: 2, 
                color: '#228B22',
                darkColor: '#1A6B1A'
            },
            PLANICIE: { 
                id: 4, 
                name: 'Planície', 
                cost: 1, 
                color: '#90EE90',
                darkColor: '#7BC97B'
            },
            DESERTO: { 
                id: 5, 
                name: 'Deserto', 
                cost: 2, 
                color: '#F4A460',
                darkColor: '#D4944A'
            },
            COLINA: { 
                id: 6, 
                name: 'Colina', 
                cost: 2, 
                color: '#DEB887',
                darkColor: '#C4A877'
            },
            MONTANHA: { 
                id: 7, 
                name: 'Montanha', 
                cost: 4, 
                color: '#696969',
                darkColor: '#555555'
            },
            OCEANO: { 
                id: 8, 
                name: 'Oceano', 
                cost: 1, 
                color: '#4682B4',
                darkColor: '#3A6B94'
            }
        };

        this.climateZones = {
            POLAR: { id: 1, name: 'Polar' },
            TEMPERADO: { id: 2, name: 'Temperado' },
            TROPICAL: { id: 3, name: 'Tropical' }
        };

        this.dangerLevels = {
            NORMAL: { id: 1, name: 'Normal' },
            PERIGOSO: { id: 2, name: 'Perigoso' },
            EXTREMO: { id: 3, name: 'Extremo' }
        };

        // Tabela 15 - Geração de terrenos
        this.generationTable = {
            POLAR: {
                OCEANO: [
                    { range: [1, 3], terrain: 'OCEANO', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'PLANICIE', danger: '↓' },
                    { range: [6, 6], terrain: 'COLINA', danger: '↑' }
                ],
                GELEIRA: [
                    { range: [1, 3], terrain: 'GELEIRA', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'OCEANO', danger: '↑' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                PANTANO: [
                    { range: [1, 3], terrain: 'PANTANO', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'PLANICIE', danger: '↑' }
                ],
                FLORESTA: [
                    { range: [1, 3], terrain: 'FLORESTA', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'COLINA', danger: '↓' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                PLANICIE: [
                    { range: [1, 3], terrain: 'PLANICIE', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'COLINA', danger: '↑' }
                ],
                DESERTO: [
                    { range: [1, 3], terrain: 'DESERTO', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'COLINA', danger: '↓' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                COLINA: [
                    { range: [1, 3], terrain: 'COLINA', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'PLANICIE', danger: '↓' },
                    { range: [6, 6], terrain: 'FLORESTA', danger: '↑' }
                ],
                MONTANHA: [
                    { range: [1, 3], terrain: 'MONTANHA', danger: '=' },
                    { range: [4, 4], terrain: 'GELEIRA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'PLANICIE', danger: '↑' }
                ]
            },
            TEMPERADO: {
                OCEANO: [
                    { range: [1, 3], terrain: 'OCEANO', danger: '=' },
                    { range: [4, 4], terrain: 'PANTANO', danger: '=' },
                    { range: [5, 5], terrain: 'PLANICIE', danger: '↓' },
                    { range: [6, 6], terrain: 'DESERTO', danger: '↑' }
                ],
                GELEIRA: [
                    { range: [1, 3], terrain: 'GELEIRA', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'OCEANO', danger: '↓' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                PANTANO: [
                    { range: [1, 3], terrain: 'PANTANO', danger: '=' },
                    { range: [4, 4], terrain: 'COLINA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'PLANICIE', danger: '↑' }
                ],
                FLORESTA: [
                    { range: [1, 3], terrain: 'FLORESTA', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'COLINA', danger: '↓' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                PLANICIE: [
                    { range: [1, 3], terrain: 'PLANICIE', danger: '=' },
                    { range: [4, 4], terrain: 'FLORESTA', danger: '=' },
                    { range: [5, 5], terrain: 'PANTANO', danger: '↓' },
                    { range: [6, 6], terrain: 'COLINA', danger: '↑' }
                ],
                DESERTO: [
                    { range: [1, 3], terrain: 'DESERTO', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'COLINA', danger: '↓' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                COLINA: [
                    { range: [1, 3], terrain: 'COLINA', danger: '=' },
                    { range: [4, 4], terrain: 'MONTANHA', danger: '=' },
                    { range: [5, 5], terrain: 'PLANICIE', danger: '↓' },
                    { range: [6, 6], terrain: 'FLORESTA', danger: '↑' }
                ],
                MONTANHA: [
                    { range: [1, 3], terrain: 'MONTANHA', danger: '=' },
                    { range: [4, 4], terrain: 'COLINA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'GELEIRA', danger: '↑' }
                ]
            },
            TROPICAL: {
                OCEANO: [
                    { range: [1, 3], terrain: 'OCEANO', danger: '=' },
                    { range: [4, 4], terrain: 'PANTANO', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'DESERTO', danger: '↑' }
                ],
                GELEIRA: [
                    { range: [1, 3], terrain: 'GELEIRA', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'OCEANO', danger: '↓' },
                    { range: [6, 6], terrain: 'FLORESTA', danger: '↑' }
                ],
                PANTANO: [
                    { range: [1, 3], terrain: 'PANTANO', danger: '=' },
                    { range: [4, 4], terrain: 'COLINA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'PLANICIE', danger: '↑' }
                ],
                FLORESTA: [
                    { range: [1, 3], terrain: 'FLORESTA', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'COLINA', danger: '↓' },
                    { range: [6, 6], terrain: 'MONTANHA', danger: '↑' }
                ],
                PLANICIE: [
                    { range: [1, 3], terrain: 'PLANICIE', danger: '=' },
                    { range: [4, 4], terrain: 'FLORESTA', danger: '=' },
                    { range: [5, 5], terrain: 'PANTANO', danger: '↓' },
                    { range: [6, 6], terrain: 'COLINA', danger: '↑' }
                ],
                DESERTO: [
                    { range: [1, 3], terrain: 'DESERTO', danger: '=' },
                    { range: [4, 4], terrain: 'PLANICIE', danger: '=' },
                    { range: [5, 5], terrain: 'COLINA', danger: '↓' },
                    { range: [6, 6], terrain: 'FLORESTA', danger: '↑' }
                ],
                COLINA: [
                    { range: [1, 3], terrain: 'COLINA', danger: '=' },
                    { range: [4, 4], terrain: 'MONTANHA', danger: '=' },
                    { range: [5, 5], terrain: 'PLANICIE', danger: '↓' },
                    { range: [6, 6], terrain: 'FLORESTA', danger: '↑' }
                ],
                MONTANHA: [
                    { range: [1, 3], terrain: 'MONTANHA', danger: '=' },
                    { range: [4, 4], terrain: 'COLINA', danger: '=' },
                    { range: [5, 5], terrain: 'FLORESTA', danger: '↓' },
                    { range: [6, 6], terrain: 'PLANICIE', danger: '↑' }
                ]
            }
        };
    }

    // Gera terreno inicial (1d8)
    generateInitialTerrain() {
        const roll = Math.floor(Math.random() * 8) + 1;
        const terrainKeys = Object.keys(this.terrainTypes);
        
        // Mapeamento especial para o hex inicial
        const initialMapping = [
            'PANTANO',    // 1
            'FLORESTA',   // 2
            'PLANICIE',   // 3
            'PLANICIE',   // 4 (duplicado conforme especificação)
            'DESERTO',    // 5
            'COLINA',     // 6
            'MONTANHA',   // 7
            'GELEIRA'     // 8
        ];
        
        return initialMapping[roll - 1];
    }

    // Gera zona climática (1d3)
    generateClimateZone() {
        const roll = Math.floor(Math.random() * 3) + 1;
        const climateKeys = Object.keys(this.climateZones);
        return climateKeys[roll - 1];
    }

    // Gera novo terreno baseado na Tabela 15
    generateNewTerrain(currentTerrain, climateZone, currentDanger) {
        const table = this.generationTable[climateZone][currentTerrain];
        const roll = Math.floor(Math.random() * 6) + 1;
        
        let result = null;
        for (const entry of table) {
            if (roll >= entry.range[0] && roll <= entry.range[1]) {
                result = entry;
                break;
            }
        }
        
        if (!result) {
            console.error('Erro na geração de terreno:', { currentTerrain, climateZone, roll });
            return { terrain: currentTerrain, danger: currentDanger };
        }
        
        // Calcula nova periculosidade
        let newDanger = currentDanger;
        if (result.danger === '↑') {
            if (currentDanger === 'NORMAL') newDanger = 'PERIGOSO';
            else if (currentDanger === 'PERIGOSO') newDanger = 'EXTREMO';
        } else if (result.danger === '↓') {
            if (currentDanger === 'EXTREMO') newDanger = 'PERIGOSO';
            else if (currentDanger === 'PERIGOSO') newDanger = 'NORMAL';
        }
        
        return {
            terrain: result.terrain,
            danger: newDanger
        };
    }

    // Obtém informações do terreno
    getTerrainInfo(terrainKey) {
        return this.terrainTypes[terrainKey] || this.terrainTypes.PLANICIE;
    }

    // Obtém informações da zona climática
    getClimateInfo(climateKey) {
        return this.climateZones[climateKey] || this.climateZones.TEMPERADO;
    }

    // Obtém informações do nível de perigo
    getDangerInfo(dangerKey) {
        return this.dangerLevels[dangerKey] || this.dangerLevels.NORMAL;
    }

    // Obtém custo de entrada do hex
    getEntranceCost(terrainKey) {
        return this.getTerrainInfo(terrainKey).cost;
    }
}

