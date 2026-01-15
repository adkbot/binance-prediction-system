/**
 * 🚀 EXECUÇÃO REAL DE TRADES NA BINANCE
 * Módulo para executar operações REAIS usando saldo REAL
 */

class BinanceTradeExecutor {
    constructor(client) {
        this.client = client;
        this.activeOrders = new Map(); // Rastrear ordens ativas
    }

    /**
     * Executa trade REAL na Binance
     */
    async executeRealTrade(signal, quantity) {
        try {
            console.log('\n🚀 EXECUTANDO TRADE REAL NA BINANCE:');
            console.log(`   Tipo: ${signal.type}`);
            console.log(`   Par: ${signal.pair || 'BTCUSDT'}`);
            console.log(`   Entrada: ${signal.entry}`);
            console.log(`   Quantidade: ${quantity}`);
            console.log(`   Stop Loss: ${signal.stopLoss}`);
            console.log(`   Take Profit: ${signal.takeProfit}`);

            const pair = signal.pair || 'BTCUSDT';
            const side = signal.type === 'LONG' ? 'BUY' : 'SELL';

            // 1. CRIAR ORDEM DE ENTRADA (MARKET ORDER)
            const entryOrder = await this.client.futuresOrder({
                symbol: pair,
                side: side,
                type: 'MARKET',
                quantity: quantity
            });

            console.log(`✅ Ordem de entrada executada: ${entryOrder.orderId}`);
            console.log(`   Preço médio: ${entryOrder.avgPrice || signal.entry}`);

            // 2. DEFINIR STOP LOSS (STOP_MARKET)
            const stopLossOrder = await this.client.futuresOrder({
                symbol: pair,
                side: signal.type === 'LONG' ? 'SELL' : 'BUY', // Oposto
                type: 'STOP_MARKET',
                stopPrice: signal.stopLoss,
                closePosition: true // Fechar posição inteira
            });

            console.log(`✅ Stop Loss definido: ${stopLossOrder.orderId}`);
            console.log(`   Preço SL: ${signal.stopLoss}`);

            // 3. DEFINIR TAKE PROFIT (TAKE_PROFIT_MARKET)
            const takeProfitOrder = await this.client.futuresOrder({
                symbol: pair,
                side: signal.type === 'LONG' ? 'SELL' : 'BUY', // Oposto
                type: 'TAKE_PROFIT_MARKET',
                stopPrice: signal.takeProfit,
                closePosition: true // Fechar posição inteira
            });

            console.log(`✅ Take Profit definido: ${takeProfitOrder.orderId}`);
            console.log(`   Preço TP: ${signal.takeProfit}`);

            // Armazenar IDs das ordens
            const tradeInfo = {
                entryOrderId: entryOrder.orderId,
                stopLossOrderId: stopLossOrder.orderId,
                takeProfitOrderId: takeProfitOrder.orderId,
                pair: pair,
                type: signal.type,
                entry: parseFloat(entryOrder.avgPrice || signal.entry),
                quantity: quantity,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit,
                timestamp: Date.now()
            };

            this.activeOrders.set(pair, tradeInfo);

            console.log('\n💰 TRADE REAL EXECUTADO COM SUCESSO!');

            return {
                success: true,
                tradeInfo: tradeInfo
            };

        } catch (error) {
            console.error('\n❌ ERRO AO EXECUTAR TRADE REAL:');
            console.error(`   ${error.message}`);

            // Verificar se é erro de saldo insuficiente
            if (error.message.includes('insufficient')) {
                console.error('   💸 SALDO INSUFICIENTE!');
            }

            // Verificar se é erro de alavancagem
            if (error.message.includes('leverage')) {
                console.error('   ⚠️ Verifique a alavancagem configurada!');
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fecha trade manualmente
     */
    async closeTradeManually(pair) {
        try {
            console.log(`\n🔴 FECHANDO TRADE MANUALMENTE: ${pair}`);

            const tradeInfo = this.activeOrders.get(pair);
            if (!tradeInfo) {
                console.log('   ⚠️ Nenhum trade ativo encontrado');
                return { success: false, error: 'No active trade' };
            }

            // Cancelar Stop Loss e Take Profit
            await this.client.futuresCancelOrder({
                symbol: pair,
                orderId: tradeInfo.stopLossOrderId
            });

            await this.client.futuresCancelOrder({
                symbol: pair,
                orderId: tradeInfo.takeProfitOrderId
            });

            // Fechar posição no mercado
            const closeOrder = await this.client.futuresOrder({
                symbol: pair,
                side: tradeInfo.type === 'LONG' ? 'SELL' : 'BUY',
                type: 'MARKET',
                quantity: tradeInfo.quantity
            });

            console.log(`✅ Posição fechada manualmente: ${closeOrder.orderId}`);
            console.log(`   Preço de saída: ${closeOrder.avgPrice}`);

            // Calcular lucro
            const exitPrice = parseFloat(closeOrder.avgPrice);
            const profit = tradeInfo.type === 'LONG'
                ? (exitPrice - tradeInfo.entry) * tradeInfo.quantity
                : (tradeInfo.entry - exitPrice) * tradeInfo.quantity;

            const profitPercent = (profit / (tradeInfo.entry * tradeInfo.quantity)) * 100;

            console.log(`   Lucro: ${profit.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

            this.activeOrders.delete(pair);

            return {
                success: true,
                exitPrice: exitPrice,
                profit: profit,
                profitPercent: profitPercent
            };

        } catch (error) {
            console.error(`\n❌ ERRO AO FECHAR TRADE: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica status de trades ativos
     */
    async checkActiveTrades() {
        try {
            // Buscar posições abertas
            const positions = await this.client.futuresPositionRisk();

            const openPositions = positions.filter(pos =>
                parseFloat(pos.positionAmt) !== 0
            );

            if (openPositions.length > 0) {
                console.log(`\n📊 POSIÇÕES ABERTAS: ${openPositions.length}`);
                openPositions.forEach(pos => {
                    console.log(`   ${pos.symbol}: ${pos.positionAmt} (PnL: ${pos.unRealizedProfit} USDT)`);
                });
            }

            return openPositions;

        } catch (error) {
            console.error(`❌ Erro ao verificar trades: ${error.message}`);
            return [];
        }
    }

    /**
     * Cancela todas as ordens abertas
     */
    async cancelAllOrders(pair) {
        try {
            await this.client.futuresCancelAllOpenOrders({ symbol: pair });
            console.log(`✅ Todas as ordens canceladas: ${pair}`);
            this.activeOrders.delete(pair);
            return { success: true };
        } catch (error) {
            console.error(`❌ Erro ao cancelar ordens: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Configura alavancagem
     */
    async setLeverage(pair, leverage) {
        try {
            await this.client.futuresLeverage({
                symbol: pair,
                leverage: leverage
            });
            console.log(`✅ Alavancagem definida: ${pair} = ${leverage}x`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Erro ao definir alavancagem: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Configura margem isolada
     */
    async setMarginType(pair, marginType = 'ISOLATED') {
        try {
            await this.client.futuresMarginType({
                symbol: pair,
                marginType: marginType // ISOLATED ou CROSSED
            });
            console.log(`✅ Tipo de margem definido: ${pair} = ${marginType}`);
            return { success: true };
        } catch (error) {
            // Erro normal se já estiver configurado
            if (error.message.includes('No need to change')) {
                console.log(`ℹ️ Margem já está em ${marginType}`);
                return { success: true };
            }
            console.error(`❌ Erro ao definir margem: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

module.exports = BinanceTradeExecutor;
