import { BigNumber } from 'bignumber.js';
import { Aqueduct } from './generated/aqueduct';
import { tokenCache } from './token-cache';
import { Web3EnabledService } from './web3-enabled-service';

export interface IMarketOrderParams {
  type: 'buy' | 'sell';

  /**
   * 'ZRX' in ZRX/WETH
   */
  baseTokenSymbol: string;

  /**
   * 'WETH' in ZRX/WETH
   */
  quoteTokenSymbol: string;

  /**
   * Ethereum node URL
   */
  nodeUrl: string;

  /**
   * Ethereum account address
   */
  account: string;

  quantityInWei: BigNumber;
}

export class MarketOrder extends Web3EnabledService<string> {
  constructor(private readonly params: IMarketOrderParams) {
    super(params.nodeUrl);
  }

  protected async run() {
    const tokenPair = await tokenCache.getTokenPair(this.params.baseTokenSymbol, this.params.quoteTokenSymbol, this.networkId);

    const makerTokenAddress = this.params.type === 'buy' ? tokenPair.tokenA.address : tokenPair.tokenB.address;
    const takerTokenAddress = this.params.type === 'buy' ? tokenPair.tokenB.address : tokenPair.tokenA.address;

    let marketOrderQuote: Aqueduct.Api.IMarketOrderQuote;
    try {
      marketOrderQuote = await new Aqueduct.Api.OrdersService().getBest({
        baseTokenAddress: tokenPair.tokenA.address,
        networkId: this.networkId,
        quantity: this.params.quantityInWei.toString(),
        makerTokenAddress,
        takerTokenAddress,
        takerAddress: this.params.account
      });
    } catch (err) {
      console.error('failed to find any matching market orders');
      throw err;
    }

    if (!marketOrderQuote.orders.length) {
      throw new Error('failed to find any matching market orders');
    }

    if (new BigNumber(marketOrderQuote.totalQuantity).lessThan(this.params.quantityInWei)) {
      console.info(`can't fill entire requested quantity (${this.params.quantityInWei.toString()}). filling available quantity of ${marketOrderQuote.totalQuantity}`);
    }

    const orders = marketOrderQuote.orders.map(o => ({
      signedOrder: Aqueduct.Utils.convertOrderToSignedOrder(o),
      order: o
    }));

    const totalBaseAmount = this.params.quantityInWei;
    let totalTakerAmount = new BigNumber(0);
    let requestedBasedAmount = totalBaseAmount;

    const fillOrders = new Array<{ takerAmount: string; id: number }>();
    orders.forEach(o => {
      let fillableBaseAmount = this.params.type === 'buy'
        ? new BigNumber(o.order.remainingTakerTokenAmount)
          .times(o.order.makerTokenAmount).dividedBy(o.order.takerTokenAmount)
        : new BigNumber(o.order.remainingTakerTokenAmount);

      if (fillableBaseAmount.greaterThan(requestedBasedAmount)) {
        // this order has enough
        fillableBaseAmount = new BigNumber(requestedBasedAmount);
      }

      requestedBasedAmount = requestedBasedAmount.minus(fillableBaseAmount);

      const takerAmount = this.params.type === 'buy'
        ? new BigNumber(fillableBaseAmount)
          .times(o.order.takerTokenAmount).dividedBy(o.order.makerTokenAmount)
        : fillableBaseAmount;

      fillOrders.push({
        id: o.order.id,
        takerAmount: takerAmount.toString()
      });

      totalTakerAmount = totalTakerAmount.add(takerAmount);
    });

    try {
      return await this.zeroEx.exchange.fillOrdersUpToAsync(orders.map(o => o.signedOrder), totalTakerAmount, true, this.params.account);
    } catch (err) {
      console.error('failed to fill orders');
      throw err;
    }
  }
}
