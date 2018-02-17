import { BigNumber } from 'bignumber.js';
import { Aqueduct } from './generated/aqueduct';
import { Web3EnabledService } from './web3-enabled-service';

export interface IFillOrderParams {
  nodeUrl: string;
  orderHash: string;

  /**
   * The fill amount denominated in the base token
   */
  takerAmountInWei: BigNumber;
  account: string;
}

export class FillOrder extends Web3EnabledService<string> {
  constructor(private readonly params: IFillOrderParams) {
    super(params.nodeUrl);
  }

  protected async run() {
    let order: Aqueduct.Api.IStandardOrder;
    try {
      order = await new Aqueduct.Api.StandardService().getOrderByHash({
        orderHash: this.params.orderHash,
        networkId: this.networkId
      });
    } catch (err) {
      console.error(`couldn't find an order with hash ${this.params.orderHash}`);
      throw err;
    }

    if (!order) {
      throw new Error(`couldn't find an order with hash ${this.params.orderHash}`);
    }

    const signedOrder = Aqueduct.Utils.convertStandardOrderToSignedOrder(order);

    try {
      return await this.zeroEx.exchange.fillOrderAsync(signedOrder, this.params.takerAmountInWei, true, this.params.account);
    } catch (err) {
      console.error('error filling the order');
      throw err;
    }
  }
}
