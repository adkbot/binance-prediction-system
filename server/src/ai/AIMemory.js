/**
 * 🧠 MEMÓRIA PERMANENTE DA IA
 * 
 * Este módulo gerencia todo o conhecimento que a IA aprende
 * e garante que NUNCA seja esquecido!
 */

const fs = require('fs').promises;
const path = require('path');

class AIMemory {
    constructor() {
        this.memoryPath = path.join(__dirname, '../../data/ai-memory.json');
        this.memory = {
            concepts: {},           // Conceitos aprendidos dos vídeos
            strategies: {},         // Estratégias extraídas
            patterns: {},           // Padrões identificados
            performance: {},        // Performance de cada conceito
            videos: {},            // Vídeos processados
            lastUpdate: null,
            totalLearnings: 0
        };
        this.loaded = false;
    }

    /**
     * Carrega memória do disco
     */
    async load() {
        try {
            // Criar diretório se não existir
            const dir = path.dirname(this.memoryPath);
            await fs.mkdir(dir, { recursive: true });

            // Tentar carregar arquivo existente
            const data = await fs.readFile(this.memoryPath, 'utf8');
            this.memory = JSON.parse(data);
            this.loaded = true;
            console.log(`🧠 Memória carregada: ${this.memory.totalLearnings} aprendizados`);
            return true;
        } catch (error) {
            // Se não existir, criar novo
            console.log('🧠 Criando nova memória da IA...');
            await this.save();
            this.loaded = true;
            return true;
        }
    }

    /**
     * Salva memória no disco
     */
    async save() {
        try {
            this.memory.lastUpdate = new Date().toISOString();
            await fs.writeFile(
                this.memoryPath,
                JSON.stringify(this.memory, null, 2),
                'utf8'
            );
            console.log(`💾 Memória salva: ${this.memory.totalLearnings} aprendizados`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar memória:', error);
            return false;
        }
    }

    /**
     * Adiciona conceito aprendido de vídeo
     */
    async addConcept(videoId, concept) {
        const conceptId = this.generateId(concept.name);

        if (!this.memory.concepts[conceptId]) {
            this.memory.concepts[conceptId] = {
                id: conceptId,
                name: concept.name,
                description: concept.description,
                category: concept.category,
                confidence: concept.confidence || 0.5,
                sources: [],
                timesApplied: 0,
                successRate: 0,
                createdAt: new Date().toISOString()
            };
        }

        // Adicionar fonte (vídeo)
        if (!this.memory.concepts[conceptId].sources.includes(videoId)) {
            this.memory.concepts[conceptId].sources.push(videoId);
        }

        this.memory.totalLearnings++;
        await this.save();

        return conceptId;
    }

    /**
     * Adiciona estratégia aprendida
     */
    async addStrategy(videoId, strategy) {
        const strategyId = this.generateId(strategy.name);

        if (!this.memory.strategies[strategyId]) {
            this.memory.strategies[strategyId] = {
                id: strategyId,
                name: strategy.name,
                description: strategy.description,
                rules: strategy.rules || [],
                conditions: strategy.conditions || {},
                riskReward: strategy.riskReward || null,
                sources: [],
                timesUsed: 0,
                winRate: 0,
                totalTrades: 0,
                profitable: 0,
                createdAt: new Date().toISOString()
            };
        }

        if (!this.memory.strategies[strategyId].sources.includes(videoId)) {
            this.memory.strategies[strategyId].sources.push(videoId);
        }

        this.memory.totalLearnings++;
        await this.save();

        return strategyId;
    }

    /**
     * Adiciona padrão identificado
     */
    async addPattern(pattern) {
        const patternId = this.generateId(pattern.type);

        if (!this.memory.patterns[patternId]) {
            this.memory.patterns[patternId] = {
                id: patternId,
                type: pattern.type,
                description: pattern.description,
                conditions: pattern.conditions || [],
                reliability: pattern.reliability || 0.5,
                occurrences: 0,
                successful: 0,
                createdAt: new Date().toISOString()
            };
        }

        this.memory.patterns[patternId].occurrences++;
        await this.save();

        return patternId;
    }

    /**
     * Registra uso de conceito/estratégia
     */
    async recordUsage(type, id, wasSuccessful) {
        const collection = type === 'concept' ? this.memory.concepts : this.memory.strategies;

        if (!collection[id]) return false;

        if (type === 'concept') {
            collection[id].timesApplied++;
            if (wasSuccessful) {
                collection[id].successRate = (
                    (collection[id].successRate * (collection[id].timesApplied - 1) + 1) /
                    collection[id].timesApplied
                );
            } else {
                collection[id].successRate = (
                    (collection[id].successRate * (collection[id].timesApplied - 1)) /
                    collection[id].timesApplied
                );
            }
        } else {
            collection[id].timesUsed++;
            collection[id].totalTrades++;
            if (wasSuccessful) {
                collection[id].profitable++;
            }
            collection[id].winRate = collection[id].profitable / collection[id].totalTrades;
        }

        await this.save();
        return true;
    }

    /**
     * Busca conceitos relevantes para situação atual
     */
    getRelevantConcepts(category, minConfidence = 0.3) {
        return Object.values(this.memory.concepts)
            .filter(c =>
                (!category || c.category === category) &&
                c.confidence >= minConfidence
            )
            .sort((a, b) => b.successRate - a.successRate);
    }

    /**
     * Busca estratégias relevantes
     */
    getRelevantStrategies(minWinRate = 0.0) {
        return Object.values(this.memory.strategies)
            .filter(s => s.winRate >= minWinRate || s.totalTrades === 0)
            .sort((a, b) => b.winRate - a.winRate);
    }

    /**
     * Busca padrões conhecidos
     */
    getKnownPatterns(minReliability = 0.3) {
        return Object.values(this.memory.patterns)
            .filter(p => p.reliability >= minReliability)
            .sort((a, b) => b.reliability - a.reliability);
    }

    /**
     * Adiciona vídeo processado
     */
    async addVideo(videoData) {
        const videoId = this.generateId(videoData.url || videoData.title);

        this.memory.videos[videoId] = {
            id: videoId,
            url: videoData.url,
            title: videoData.title,
            processedAt: new Date().toISOString(),
            conceptsExtracted: videoData.concepts?.length || 0,
            strategiesExtracted: videoData.strategies?.length || 0,
            points: videoData.points || 0
        };

        await this.save();
        return videoId;
    }

    /**
     * Gera ID único para conceito/estratégia
     */
    generateId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .substring(0, 50);
    }

    /**
     * Obtém estatísticas da memória
     */
    getStats() {
        return {
            totalConcepts: Object.keys(this.memory.concepts).length,
            totalStrategies: Object.keys(this.memory.strategies).length,
            totalPatterns: Object.keys(this.memory.patterns).length,
            totalVideos: Object.keys(this.memory.videos).length,
            totalLearnings: this.memory.totalLearnings,
            lastUpdate: this.memory.lastUpdate,
            avgConceptSuccess: this.calculateAvgSuccessRate(this.memory.concepts),
            avgStrategyWinRate: this.calculateAvgWinRate(this.memory.strategies)
        };
    }

    /**
     * Calcula taxa média de sucesso
     */
    calculateAvgSuccessRate(collection) {
        const concepts = Object.values(collection);
        if (concepts.length === 0) return 0;

        const sum = concepts.reduce((acc, c) => acc + (c.successRate || 0), 0);
        return sum / concepts.length;
    }

    /**
     * Calcula win rate médio
     */
    calculateAvgWinRate(collection) {
        const strategies = Object.values(collection);
        if (strategies.length === 0) return 0;

        const sum = strategies.reduce((acc, s) => acc + (s.winRate || 0), 0);
        return sum / strategies.length;
    }

    /**
     * Limpa memória (usar com cuidado!)
     */
    async clear() {
        this.memory = {
            concepts: {},
            strategies: {},
            patterns: {},
            performance: {},
            videos: {},
            lastUpdate: null,
            totalLearnings: 0
        };
        await this.save();
        console.log('🧠 Memória limpa');
    }
}

// Singleton
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new AIMemory();
        }
        return instance;
    }
};
