// Módulo de Tempo
class TimeManager {
    constructor() {
        this.currentHour = 6; // Inicia às 06:00
        this.currentDay = 1;
        
        this.periods = {
            MANHA: { start: 6, end: 12, name: 'Manhã' },
            TARDE: { start: 12, end: 18, name: 'Tarde' },
            NOITE: { start: 18, end: 24, name: 'Noite' },
            MADRUGADA: { start: 0, end: 6, name: 'Madrugada' }
        };
    }

    // Obtém o período atual
    getCurrentPeriod() {
        const hour = this.currentHour;
        
        if (hour >= 6 && hour < 12) return this.periods.MANHA;
        if (hour >= 12 && hour < 18) return this.periods.TARDE;
        if (hour >= 18 && hour < 24) return this.periods.NOITE;
        return this.periods.MADRUGADA;
    }

    // Avança o tempo em horas
    advanceTime(hours) {
        this.currentHour += hours;
        
        // Verifica se passou para o próximo dia
        while (this.currentHour >= 24) {
            this.currentHour -= 24;
            this.currentDay++;
        }
        
        return {
            newDay: this.currentHour < hours, // Se a hora atual é menor que as horas adicionadas, passou de dia
            currentHour: this.currentHour,
            currentDay: this.currentDay,
            period: this.getCurrentPeriod()
        };
    }

    // Formata a hora para exibição
    formatTime() {
        const hour = this.currentHour.toString().padStart(2, '0');
        return `${hour}:00`;
    }

    // Obtém informações completas do tempo
    getTimeInfo() {
        return {
            hour: this.currentHour,
            day: this.currentDay,
            formattedTime: this.formatTime(),
            period: this.getCurrentPeriod(),
            isNewDay: this.currentHour === 6 // Considera novo dia quando volta às 06:00
        };
    }

    // Verifica se é um novo dia (para reset de PJ)
    isNewDay(previousHour) {
        return previousHour > this.currentHour || (previousHour < 6 && this.currentHour >= 6);
    }

    // Força acampamento (vai para próximo período de 6h)
    forceCamp() {
        const currentPeriod = this.getCurrentPeriod();
        
        // Avança para o próximo período
        if (currentPeriod === this.periods.MANHA) {
            this.currentHour = 12; // Tarde
        } else if (currentPeriod === this.periods.TARDE) {
            this.currentHour = 18; // Noite
        } else if (currentPeriod === this.periods.NOITE) {
            this.currentHour = 0; // Madrugada
            this.currentDay++;
        } else { // Madrugada
            this.currentHour = 6; // Manhã
        }
        
        return this.getTimeInfo();
    }

    // Serializa para salvamento
    serialize() {
        return {
            currentHour: this.currentHour,
            currentDay: this.currentDay
        };
    }

    // Deserializa do salvamento
    deserialize(data) {
        this.currentHour = data.currentHour || 6;
        this.currentDay = data.currentDay || 1;
    }
}

