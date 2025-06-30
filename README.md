# Hexcrawl - Jogo de Exploração

Um jogo de exploração hexagonal baseado em turnos que funciona inteiramente no navegador, implementando as regras e mecânicas especificadas.

## 🎮 Como Jogar

### Objetivo
Explore um mundo procedural usando um sistema de hexágonos, gerenciando seus Pontos de Jornada (PJ) e tempo para sobreviver e descobrir novos territórios.

### Controles Básicos
- **Clique nos hexágonos adjacentes** para revelar ou viajar
- **Use os botões de ação** no painel lateral
- **Zoom**: Botões + e - no canto superior direito
- **Centralizar**: Botão ⌂ para voltar à posição atual

### Sistema de Tempo
- **4 períodos por dia**: Manhã (06:00), Tarde (12:00), Noite (18:00), Madrugada (00:00)
- **Cada ação consome tempo** conforme especificado
- **Novo dia**: Reseta automaticamente os Pontos de Jornada

### Pontos de Jornada (PJ)
- **Valor inicial**: 6 PJ por dia
- **Gasto**: Cada ação tem um custo específico
- **Reset**: Acampar ou início de novo dia

## 🗺️ Terrenos e Custos

### Hierarquia de Terrenos
1. **Geleira** (3 PJ) - Azul claro
2. **Pântano** (3 PJ) - Marrom escuro  
3. **Floresta** (2 PJ) - Verde floresta
4. **Planície** (1 PJ) - Verde claro
5. **Deserto** (2 PJ) - Areia
6. **Colina** (2 PJ) - Bege
7. **Montanha** (4 PJ) - Cinza
8. **Oceano** (1 PJ) - Azul aço

### Zonas Climáticas
- **Polar**: Mais geleiras e terrenos frios
- **Temperado**: Variedade equilibrada
- **Tropical**: Mais florestas e pântanos

## 🎯 Ações Disponíveis

### No Hex Atual
- **Explorar** (2x custo do terreno / 6h): Descobre segredos da área
- **Descansar** (1 PJ / 1h): Remove exaustão
- **Forragear** (1 PJ / 6h): Procura comida
- **Caçar** (2 PJ / 18h): Caça animais para comida
- **Pescar** (1 PJ / 6h): Pesca em corpos d'água
- **Procurar Água** (1 PJ / 6h): Busca fontes de água
- **Acampar** (todos PJ / 8h): Descansa e reseta PJ

### Hexágonos Adjacentes
- **Revelar** (0 PJ / 0h): Descobre novo hexágono
- **Viajar** (custo do terreno / 6h): Move-se normalmente
- **Marchar** (metade do custo / 6h): Move-se rapidamente (causa exaustão)

## 🎲 Sistema de Geração

### Hex Inicial
- Gerado aleatoriamente (1d8)
- Zona climática aleatória (1d3)
- Periculosidade: Normal

### Novos Hexágonos
- Baseados na **Tabela 15** implementada
- Dependem do terreno atual e zona climática
- Periculosidade pode aumentar (↑), diminuir (↓) ou manter (=)

## 💾 Salvamento

- **Salvamento automático**: Use o botão "Salvar"
- **Carregamento**: Use o botão "Carregar"
- **Novo jogo**: Use o botão "Novo Jogo"
- **Armazenamento**: LocalStorage do navegador

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas**: Renderização do mapa hexagonal
- **JavaScript ES6+**: Lógica do jogo
- **CSS3**: Interface e animações
- **LocalStorage**: Persistência de dados

## 📁 Estrutura do Projeto

```
hexcrawl/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos e animações
├── js/
│   ├── game.js         # Classe principal do jogo
│   ├── hex.js          # Lógica dos hexágonos
│   ├── player.js       # Dados do jogador
│   ├── time.js         # Sistema de tempo
│   ├── terrain.js      # Tipos de terreno e Tabela 15
│   └── ui.js           # Interface do usuário
└── README.md           # Esta documentação
```

## 🎨 Características Visuais

- **Interface responsiva**: Funciona em desktop e mobile
- **Cores distintas**: Cada terreno tem sua cor característica
- **Animações suaves**: Transições e efeitos visuais
- **Feedback visual**: Hover states e indicadores claros
- **Design moderno**: Interface limpa e profissional

## 🚀 Como Executar

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. O jogo carrega automaticamente
3. Comece explorando e descobrindo novos hexágonos!

## 📋 Funcionalidades Implementadas

✅ Sistema completo de hexágonos  
✅ Geração procedural baseada na Tabela 15  
✅ Sistema de tempo com 4 períodos  
✅ Pontos de Jornada e custos de ação  
✅ 8 tipos de terreno com hierarquia  
✅ 3 zonas climáticas  
✅ Sistema de periculosidade  
✅ Todas as ações da Tabela 1  
✅ Interface responsiva e intuitiva  
✅ Sistema de salvamento/carregamento  
✅ Controles de zoom e navegação  
✅ Log de eventos detalhado  

## 🎯 Próximas Melhorias Sugeridas

- Sistema de encontros aleatórios
- Inventário mais detalhado
- Eventos especiais por terreno
- Multiplayer local
- Exportação de mapas
- Sistema de conquistas

---

**Desenvolvido seguindo fielmente as especificações fornecidas para um jogo Hexcrawl completo e funcional.**

