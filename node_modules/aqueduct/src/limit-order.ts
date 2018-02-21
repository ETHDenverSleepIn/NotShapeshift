import { ZeroEx } from '0x.js/lib/src/0x';
import { BigNumber } from 'bignumber.js';
import { Aqueduct } from './generated/aqueduct';
import { tokenCache } from './token-cache';
import { Web3EnabledService } from './web3-enabled-service';

export interface ILimitOrderParams {
  /**
   * Ethereum node url
   */
  nodeUrl: string;

  /**
   * Limit orders can be a buy or a sell order
   */
  type: 'buy' | 'sell';

  /**
   * "ZRX" in ZRX/WETH
   */
  baseTokenSymbol: string;

  /**
   * "WETH" in ZRX/WETH
   */
  quoteTokenSymbol: string;

  /**
   * Quantity of order - MUST BE IN BASE UNITS!!!
   */
  quantityInWei: BigNumber;

  /**
   * Price
   */
  price: BigNumber;

  /**
   * Ethereum wallet address
   */
  account: string;

  /**
   * Expiration of order - defaults to Good til Canceled
   */
  expirationDate?: Date;
}

interface IValidateParams {
  networkId: number;
  makerTokenAmount: BigNumber;
  takerTokenAmount: BigNumber;
  makerToken: Aqueduct.Api.IToken;
  takerToken: Aqueduct.Api.IToken;
  fees: Aqueduct.Api.IFees;
  tokenPair: Aqueduct.Api.ITokenPair;
}

export class LimitOrder extends Web3EnabledService<Aqueduct.Api.Order> {
  constructor(private readonly params: ILimitOrderParams) {
    super(params.nodeUrl);
   }

  protected async run() {
    const networkId = this.networkId;
    const tokenPair = await tokenCache.getTokenPair(this.params.baseTokenSymbol, this.params.quoteTokenSymbol, networkId);
    const baseToken = tokenPair.tokenA;
    const quoteToken = tokenPair.tokenB;

    if (new BigNumber(tokenPair.minimumQuantity).greaterThan(this.params.quantityInWei)) {
      throw new Error(`order quantity must be greater than minimum allowed amount: ${this.params.quantityInWei}/${tokenPair.minimumQuantity}`);
    }

    let makerTokenAmount: BigNumber;
    let makerToken: Aqueduct.Api.IToken;
    let takerTokenAmount: BigNumber;
    let takerToken: Aqueduct.Api.IToken;

    if (this.params.type === 'buy') {
      makerToken = quoteToken;
      takerToken = baseToken;
      takerTokenAmount = this.params.quantityInWei;
      makerTokenAmount = takerTokenAmount.times(this.params.price);
    } else {
      makerToken = baseToken;
      takerToken = quoteToken;
      makerTokenAmount = this.params.quantityInWei;
      takerTokenAmount = makerTokenAmount.times(this.params.price);
    }

    let fees: Aqueduct.Api.IFees;
    try {
      fees = await new Aqueduct.Api.FeesService().get({
        makerTokenAmount: makerTokenAmount.toString(),
        takerTokenAddress: takerToken.address,
        makerTokenAddress: makerToken.address,
        networkId,
        takerTokenAmount: takerTokenAmount.toString()
      });
    } catch (err) {
      console.error('failed to get fees...');
      console.log(err);
      throw err;
    }

    await this.validateRequest({
      fees,
      networkId,
      takerTokenAmount,
      makerTokenAmount,
      makerToken,
      takerToken,
      tokenPair
    });

    const zeroEx = this.zeroEx;
    const exchangeContractAddress = await zeroEx.exchange.getContractAddress();
    const salt = ZeroEx.generatePseudoRandomSalt();

    const expirationUnixTimestampSec = !this.params.expirationDate
      ? 4102444800
      : this.params.expirationDate.getTime();

    const signOrderParams: Aqueduct.Utils.ISignOrderParams = {
      exchangeContractAddress,
      expirationUnixTimestampSec,
      maker: this.params.account,
      feeRecipient: fees.feeRecipient,
      makerFee: new BigNumber(fees.makerFee),
      makerTokenAddress: makerToken.address,
      makerTokenAmount: new BigNumber(makerTokenAmount),
      salt: new BigNumber(salt),
      taker: '0x0000000000000000000000000000000000000000',
      takerFee: new BigNumber(fees.takerFee),
      takerTokenAddress: takerToken.address,
      takerTokenAmount: new BigNumber(takerTokenAmount)
    };

    let signedOrder: Aqueduct.Api.IStandardOrderCreationRequest;
    try {
      console.log('signing order...');
      signedOrder = await Aqueduct.Utils.signOrder({
        client: zeroEx,
        getOrderHashHex: ZeroEx.getOrderHashHex
      }, signOrderParams);
    } catch (err) {
      console.error('failed to sign order');
      throw err;
    }

    try {
      /**
       * Create the order in ERC dEX
       */
      const createdOrder = await new Aqueduct.Api.StandardService().create({
        networkId,
        request: signedOrder
      });
      return createdOrder;
    } catch (err) {
      console.error('problem posting order to API');
      throw err;
    }
  }

  private async validateRequest(params: IValidateParams) {
    const { networkId, fees, makerToken, makerTokenAmount, takerTokenAmount } = params;

    const zeroEx = this.zeroEx;
    const zrxToken = await tokenCache.getTokenBySymbol('ZRX', networkId);
    const zrxBalance = await zeroEx.token.getBalanceAsync(zrxToken.address, this.params.account);

    const buyingZrx = this.params.type === 'buy' && this.params.baseTokenSymbol.toLowerCase() === 'zrx';
    if (!buyingZrx && zrxBalance.lessThan(fees.makerFee)) {
      throw new Error(`insufficient ZRX balance to pay fees ${zrxBalance.toString()}/${fees.makerFee.toString()}`);
    } else if (buyingZrx && zrxBalance.plus(takerTokenAmount).lessThan(fees.makerFee)) {
      throw new Error('insufficient ZRX balance and not buying enough ZRX to cover the cost');
    }

    const zrxAllowance = await zeroEx.token.getProxyAllowanceAsync(zrxToken.address, this.params.account);
    if (zrxAllowance.lessThan(fees.makerFee)) {
      throw new Error('insufficient ZRX allowance to pay fees');
    }

    // maker token validation
    const makerBalance = await zeroEx.token.getBalanceAsync(makerToken.address, this.params.account);
    if (makerBalance.lessThan(makerTokenAmount)) {
      throw new Error('insufficient token balance');
    }

    const makerAllowance = await zeroEx.token.getProxyAllowanceAsync(makerToken.address, this.params.account);
    if (makerAllowance.lessThan(makerTokenAmount)) {
      throw new Error('insufficient allowance');
    }
  }
}
