/**
 * 🎥 SISTEMA AUTOMÁTICO DE PROCESSAMENTO DE VÍDEOS
 * Processa vídeos educacionais a cada hora
 */

const { getInstance: getKnowledgeApplicator } = require('../ai/KnowledgeApplicator');

class VideoProcessor {
    constructor() {
        this.knowledgeApplicator = getKnowledgeApplicator();
        this.processedVideos = new Set();
        this.videoQueue = [];
    }

    /**
     * Adiciona vídeo à fila de processamento
     */
    addVideo(videoUrl, title, concepts = [], strategies = []) {
        this.videoQueue.push({
            url: videoUrl,
            title: title,
            concepts: concepts,
            strategies: strategies,
            addedAt: Date.now()
        });
    }

    /**
     * Processa próximo vídeo da fila
     */
    async processNextVideo() {
        if (this.videoQueue.length === 0) {
            console.log('📹 Fila de vídeos vazia');
            return null;
        }

        const video = this.videoQueue.shift();

        if (this.processedVideos.has(video.url)) {
            console.log(`⏭️ Vídeo já processado: ${video.title}`);
            return this.processNextVideo();
        }

        console.log(`\n🎓 Processando vídeo: ${video.title}`);
        console.log(`   URL: ${video.url}`);
        console.log(`   Conceitos: ${video.concepts.length}`);
        console.log(`   Estratégias: ${video.strategies.length}`);

        try {
            await this.knowledgeApplicator.learnFromVideo({
                url: video.url,
                title: video.title,
                concepts: video.concepts,
                strategies: video.strategies,
                points: video.concepts.length * 100 + video.strategies.length * 200
            });

            this.processedVideos.add(video.url);

            console.log(`✅ Vídeo processado com sucesso!`);
            console.log(`   Total processados: ${this.processedVideos.size}\n`);

            return video;

        } catch (error) {
            console.error(`❌ Erro ao processar vídeo:`, error);
            return null;
        }
    }

    /**
     * Adiciona vídeos de exemplo (biblioteca de conhecimento)
     */
    loadDefaultVideos() {
        // Vídeo já processado
        this.addVideo(
            'https://youtu.be/lkfEz0KuQYs',
            'CRT Trading Strategy - Candle Range Theory',
            [
                { name: 'Manipulação no PCC', category: 'CRT', confidence: 0.85 },
                { name: 'Rejeição em Premium', category: 'CRT', confidence: 0.80 },
                { name: 'Suporte em Discount', category: 'CRT', confidence: 0.82 },
                { name: 'Turtle Soup Pattern', category: 'CRT', confidence: 0.88 }
            ],
            [
                { name: 'Compra em Discount', rules: ['BUY_ON_DISCOUNT_SUPPORT'], riskReward: 5 },
                { name: 'Venda em Premium', rules: ['SELL_ON_PREMIUM_REJECTION'], riskReward: 5 }
            ]
        );

        console.log(`📚 ${this.videoQueue.length} vídeos na biblioteca de conhecimento`);
    }

    /**
     * Processa vídeos pendentes
     */
    async processPendingVideos() {
        if (this.videoQueue.length === 0) {
            return { processed: 0, total: 0 };
        }

        const total = this.videoQueue.length;
        let processed = 0;

        console.log(`\n📹 Processando ${total} vídeos pendentes...`);

        while (this.videoQueue.length > 0) {
            const result = await this.processNextVideo();
            if (result) processed++;
        }

        console.log(`\n✅ Processamento concluído: ${processed}/${total} vídeos\n`);

        return { processed, total };
    }

    getStats() {
        return {
            totalProcessed: this.processedVideos.size,
            queueLength: this.videoQueue.length,
            processedList: Array.from(this.processedVideos)
        };
    }
}

// Singleton
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new VideoProcessor();
        }
        return instance;
    }
};
