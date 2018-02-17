import { BigNumber } from 'bignumber.js';
import { Aqueduct } from './generated/aqueduct';
import { Web3EnabledService } from './web3-enabled-service';

export interface ICancelOrderParams {
  /**
   * Ethereum node url
   */
  nodeUrl: string;

  /**
   * Order Hash
   */
  orderHash: string;
}

/**
 * Cancel an order by orderHash; returns txHash if successful
 */
export class CancelOrder extends Web3EnabledService<string> {
  constructor(private readonly params: ICancelOrderParams) {
    super(params.nodeUrl);

    if (!params.nodeUrl) {
      throw new Error('no nodeUrl provided');
    }

    if (!params.orderHash) {
      throw new Error('no orderHash provided');
    }
  }

  protected async run() {
    let order: Aqueduct.Api.IStandardOrder;
    try {
      order = await new Aqueduct.Api.StandardService().getOrderByHash({
        orderHash: this.params.orderHash,
        networkId: this.networkId
      });
    } catch (err) {
      console.error(`failed get order with hash ${this.params.orderHash}`);
      throw err;
    }

    const signedOrder = Aqueduct.Utils.convertStandardOrderToSignedOrder(order);

    try {
      return await this.zeroEx.exchange.cancelOrderAsync(signedOrder, new BigNumber(signedOrder.takerTokenAmount));
    } catch (err) {
      console.error('failed to cancel order');
      throw err;
    }
  }
}
