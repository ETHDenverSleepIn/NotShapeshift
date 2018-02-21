/* tslint:disable */
import { ApiService, IRequestParams } from '../api-service';
import { BigNumber } from 'bignumber.js';
import { tokenCache, TokenCache } from '../token-cache';
const ReconnectingWebsocket = require('reconnecting-websocket');

export namespace Aqueduct {
  export let socket: WebSocket;
  let baseApiUrl: string;
  let hasWebSocket: boolean;
  let socketOpen = false;

  let subscriptions: {
    [channel: string]: {
      callbacks: Array<(data: any) => void>,
      resub: () => void,
      subActive: boolean
    } | undefined
  } = {};

  const send = (message: string, tries = 0) => {
    if (socketOpen) {
      socket.send(message);
      return;
    }

    // retry for 20 seconds
    if (tries < 20) {
      setTimeout(() => {
        send(message, tries + 1);
      }, 250);
    } else {
      console.log('failed to send');
    }
  };

  /**
   * Initialize the Aqueduct client. Required to use the client.
   */
  export const Initialize = (params?: { host?: string; }) => {
    const hasProcess = typeof process !== 'undefined' && process.env;
    const host = (params && params.host) || (hasProcess && process.env.AQUEDUCT_HOST) || 'api.ercdex.com';
    baseApiUrl = `https://${host}`;

    if (hasProcess && baseApiUrl.indexOf('localhost') !== -1) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 as any;
    }

    hasWebSocket = typeof WebSocket !== 'undefined';
    if (!hasWebSocket) {
      console.warn('No WebSocket found in global namespace; subscriptions will not be configured.');
      return;
    }

    socket = new ReconnectingWebsocket(`wss:${host}`, undefined);

    socket.onopen = () => {
      Object.keys(subscriptions).map(k => subscriptions[k]).forEach(s => {
        if (s && !s.subActive) {
          s.resub();
          s.subActive = true;
        }
      });
      socketOpen = true;
    };

    socket.onclose = () => {
      Object.keys(subscriptions).map(k => subscriptions[k]).forEach(s => {
        if (s) {
          s.subActive = false;
        }
      });
      socketOpen = false;
    };

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data) as { channel?: string; data: any };
        if (data.channel) {
          const sub = subscriptions[data.channel];
          if (sub) {
            sub.callbacks.forEach(cb => cb(data.data));
          }
        }
      } catch(err) {
        return;
      }
    };
  };

  /**
   * Namespace representing REST API for ERC dEX
   */
  export namespace Api {

    export interface IPriceLevel {
      price: string;
      volume: string;
      volumeRatio: number;
      position?: string;
    }

    export interface IOrderBookListing {
      volume: string;
      priceLevels: IPriceLevel[];
    }

    export interface IAggregatedOrderData {
      sells: IOrderBookListing;
      buys: IOrderBookListing;
    }

    /**
     * Fee structure
     */
    export interface IFees {
      /**
       * Fee recipient - generally the address of the relayer
       */
      feeRecipient: string;
      /**
       * Fee owed by maker
       */
      makerFee: string;
      /**
       * Fee owed by taker
       */
      takerFee: string;
    }

    /**
     * Ethereum network description
     */
    export interface INetwork {
      /**
       * Unique identifier of network
       */
      id: number;
      /**
       * Long description of network
       */
      label: string;
      /**
       * Network endpoint
       */
      url: string;
    }

    /**
     * To set maintenance status from redis-cli:
set maintenance_status &quot;{ \&quot;isMaintenance\&quot;: true, \&quot;reason\&quot;: \&quot;We are currently performing maintenance on our Ethereum nodes. Service will return as soon as possible.\&quot; }&quot;

or to turn off

set maintenance_status &quot;{ \&quot;isMaintenance\&quot;: false }&quot;
Current status of app
     */
    export interface IMaintenanceStatus {
      isMaintenance: boolean;
      reason?: string;
    }

    /**
     * A notification meant for consumption by clients
     */
    export interface Notification {
      /**
       * Hex address of account associated with notification
       */
      account: string;
      /**
       * Text label of notification
       */
      label: string;
      /**
       * Date the notification expires
       */
      expirationDate: Date;
      /**
       * Unique Identifier
       */
      id: number;
      /**
       * Date of creation
       */
      dateCreated: Date;
      /**
       * Date of updated
       */
      dateUpdated: Date;
    }

    /**
     * An order that has been recorded on the ERC dEX Order Book
     */
    export interface Order {
      /**
       * Date on which the order was closed through fill, cancel, etc
       */
      dateClosed: Date;
      /**
       * ID of the Ethereum network the order is associated with
       */
      networkId: number;
      /**
       * 0x Exchange Contract Address
       */
      exchangeContractAddress: string;
      /**
       * Unix timestamp of order expiration (in seconds)
       */
      expirationUnixTimestampSec: number;
      /**
       * Address of the fee recipient
       */
      feeRecipient: string;
      /**
       * Address of the order maker
       */
      maker: string;
      /**
       * Fee due from maker on order fill
       */
      makerFee: string;
      /**
       * Token address of the maker token
       */
      makerTokenAddress: string;
      /**
       * Total amount of maker token in order
       */
      makerTokenAmount: string;
      /**
       * Secure salt
       */
      salt: string;
      /**
       * Serialized version of the EC signature for signed orders
       */
      serializedEcSignature: string;
      /**
       * Taker address; generally a null taker
       */
      taker: string;
      /**
       * Fee due from taker on order fill
       */
      takerFee: string;
      /**
       * Token address of the taker token
       */
      takerTokenAddress: string;
      /**
       * Total amount of taker token in order
       */
      takerTokenAmount: string;
      /**
       * Remaining amount in the order in terms of taker token units
       */
      remainingTakerTokenAmount: string;
      /**
       * The hash of the signed order
       */
      orderHash: string;
      /**
       * State of the order: Open (0), Canceled (1),
Filled (2), Expired(3), Removed(4),
PendingCancel (5)
       */
      state: number;
      source: string;
      takerEvents: TakerEvent[];
      /**
       * Unique Identifier
       */
      id: number;
      /**
       * Date of creation
       */
      dateCreated: Date;
      /**
       * Date of updated
       */
      dateUpdated: Date;
    }

    export interface TakerEvent {
      /**
       * ID of the associated order
       */
      orderId: number;
      /**
       * Amount filled on the order
       */
      takerAmount: string;
      /**
       * Address of the order taker
       */
      taker: string;
      /**
       * Associated transaction hash of fill event
       */
      txHash: string;
      /**
       * State of the event: Pending(0), Complete (1), Failed (2)
       */
      state: number;
      order: Order;
      /**
       * Unique Identifier
       */
      id: number;
      /**
       * Date of creation
       */
      dateCreated: Date;
      /**
       * Date of updated
       */
      dateUpdated: Date;
    }

    export interface IMarketOrderQuote {
      totalQuantity: string;
      orders: Order[];
    }

    export interface IDateSummary {
      date: Date;
      low?: number;
      high?: number;
      open?: number;
      close?: number;
      volume?: number;
    }

    export interface ITokenTicker {
      id: string;
      name: string;
      symbol: string;
      usdPrice: string;
      btcPrice: string;
      hourlyPercentageChange: string;
      dailyPercentageChange: string;
      weeklyPercentageChange: string;
      dailyVolume: string;
      priceEth: string;
    }

    export interface IStandardToken {
      address: string;
      minAmount: string;
      maxAmount: string;
      precision: number;
    }

    export interface IStandardTokenPair {
      tokenA: IStandardToken;
      tokenB: IStandardToken;
    }

    /**
     * Elliptic Curve Digital Signature
     */
    export interface IEcSignature {
      v: number;
      r: string;
      s: string;
    }

    export interface IStandardOrder {
      exchangeContractAddress: string;
      maker: string;
      taker: string;
      makerTokenAddress: string;
      takerTokenAddress: string;
      feeRecipient: string;
      makerTokenAmount: string;
      takerTokenAmount: string;
      makerFee: string;
      takerFee: string;
      expirationUnixTimestampSec: string;
      salt: string;
      ecSignature: IEcSignature;
      remainingTakerTokenAmount: string;
    }

    export interface IStandardFeeRequest {
      maker: string;
      taker: string;
      exchangeContractAddress: string;
      makerTokenAddress: string;
      takerTokenAddress: string;
      makerTokenAmount: string;
      takerTokenAmount: string;
      expirationUnixTimestampSec: string;
      salt: string;
    }

    export interface IStandardOrderCreationRequest {
      /**
       * Order maker
       */
      maker: string;
      /**
       * Order taker; should generally be the null address (0x000...) in the case of ERC dEX
       */
      taker: string;
      /**
       * Amount of maker token in trade
       */
      makerTokenAmount: string;
      /**
       * Amount of taker token in trade
       */
      takerTokenAmount: string;
      /**
       * Fee owed by maker
       */
      makerFee: string;
      /**
       * Fee owed by taker
       */
      takerFee: string;
      /**
       * Address of maker token
       */
      makerTokenAddress: string;
      /**
       * Address of taker token
       */
      takerTokenAddress: string;
      /**
       * Secure salt
       */
      salt: string;
      /**
       * Recipient of owed fees
       */
      feeRecipient: string;
      /**
       * Address of 0x exchange contract
       */
      exchangeContractAddress: string;
      /**
       * Unix timestamp when order expires
       */
      expirationUnixTimestampSec: string;
      /**
       * Secure EC Signature
       */
      ecSignature: IEcSignature;
    }

    export interface IStandardOrderbook {
      bids: IStandardOrder[];
      asks: IStandardOrder[];
    }

    export interface IToken {
      name: string;
      address: string;
      symbol: string;
      decimals: number;
    }

    export interface ITokenPair {
      tokenA: IToken;
      tokenB: IToken;
      minimumQuantity: string;
      baseVolume: string;
      quoteVolume: string;
    }

    export interface ITokenPairSummary {
      tokenPair: ITokenPair;
      lastPrice?: string;
      netChange?: string;
      bid?: string;
      ask?: string;
    }


    export interface IAggregatedOrdersGetParams {
      networkId: number;
      baseTokenAddress?: string;
      quoteTokenAddress?: string;
      maker?: string;
    }

    export interface IFeesGetParams {
      makerTokenAddress: string;
      takerTokenAddress: string;
      makerTokenAmount: string;
      takerTokenAmount: string;
      networkId: number;
    }

    export interface INotificationsGetParams {
      account: string;
    }

    export interface IOrdersGetParams {
      /**
       * ID of Ethereum Network
       */
      networkId: number;
      /**
       * Address of maker token
       */
      makerTokenAddress?: string;
      /**
       * Address of taker token
       */
      takerTokenAddress?: string;
      /**
       * Use ascending sort order
       */
      isAscending?: boolean;
      /**
       * Sort order: price or dateCreated
       */
      sortOrder?: string;
      /**
       * Address of maker
       */
      maker?: string;
      /**
       * Include orders from other relayers
       */
      includeExternal?: boolean;
      isOpen?: boolean;
    }

    export interface IOrdersGetBestParams {
      /**
       * Address of maker token
       */
      makerTokenAddress: string;
      /**
       * Address of taker token
       */
      takerTokenAddress: string;
      /**
       * Address of base token
       */
      baseTokenAddress: string;
      /**
       * Quantity of pair requested
       */
      quantity: string;
      /**
       * ID of Ethereum network
       */
      networkId: number;
      /**
       * Address of order taker
       */
      takerAddress: string;
    }

    export interface IReportsGetHistoricalParams {
      /**
       * ID of Ethereum network
       */
      networkId: number;
      /**
       * Address of maker token
       */
      makerTokenAddress: string;
      /**
       * Address of taker token
       */
      takerTokenAddress: string;
      /**
       * Start Date
       */
      startDate: Date;
      /**
       * End Date
       */
      endDate: Date;
    }

    export interface IStandardGetTokenPairsParams {
      networkId: number;
      per_page?: number;
      page?: number;
    }

    export interface IStandardGetOrdersParams {
      networkId: number;
      per_page?: number;
      page?: number;
      exchangeContractAddress?: string;
      tokenAddress?: string;
      makerTokenAddress?: string;
      takerTokenAddress?: string;
      maker?: string;
      taker?: string;
      trader?: string;
      feeRecipient?: string;
    }

    export interface IStandardGetOrderByHashParams {
      networkId: number;
      orderHash: string;
    }

    export interface IStandardGetFeesParams {
      networkId: number;
      request: IStandardFeeRequest;
    }

    export interface IStandardCreateParams {
      networkId: number;
      request: IStandardOrderCreationRequest;
    }

    export interface IStandardGetOrderbookParams {
      networkId: number;
      baseTokenAddress: string;
      quoteTokenAddress: string;
      per_page?: number;
      page?: number;
    }

    export interface ITakerEventsGetByTakerParams {
      /**
       * ID of Ethereum network
       */
      networkId: number;
      /**
       * Address of taker
       */
      taker: string;
    }

    export interface ITakerEventsGetByPairParams {
      /**
       * ID of Ethereum network
       */
      networkId: number;
      /**
       * Address of maker token
       */
      makerTokenAddress: string;
      /**
       * Address of taker token
       */
      takerTokenAddress: string;
      taker?: string;
    }

    export interface ITokenPairSummariesGetParams {
      /**
       * ID of Ethereum network
       */
      networkId: number;
    }

    export interface ITokenPairsGetParams {
      /**
       * ID of Ethereum network
       */
      networkId: number;
    }
    export class AggregatedOrdersService extends ApiService {

      public async get(params: IAggregatedOrdersGetParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/aggregated_orders`
        };

        requestParams.queryParameters = {
          networkId: params.networkId,
          baseTokenAddress: params.baseTokenAddress,
          quoteTokenAddress: params.quoteTokenAddress,
          maker: params.maker,
        };
        return this.executeRequest<IAggregatedOrderData>(requestParams);
      }
    }
    export class FeesService extends ApiService {

      /**
       * Get fees for an order of described parameters
       */
      public async get(params: IFeesGetParams) {
        const requestParams: IRequestParams = {
          method: 'POST',
          url: `${baseApiUrl}/api/fees`
        };

        requestParams.queryParameters = {
          makerTokenAddress: params.makerTokenAddress,
          takerTokenAddress: params.takerTokenAddress,
          makerTokenAmount: params.makerTokenAmount,
          takerTokenAmount: params.takerTokenAmount,
          networkId: params.networkId,
        };
        return this.executeRequest<IFees>(requestParams);
      }
    }
    export class NetworksService extends ApiService {

      /**
       * Get a list of supported networks
       */
      public async getSupported() {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/networks`
        };
        return this.executeRequest<INetwork[]>(requestParams);
      }

      /**
       * Determine if app is in maintenance mode
       */
      public async isMaintenance() {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/networks/maintenance`
        };
        return this.executeRequest<IMaintenanceStatus>(requestParams);
      }
    }
    export class NotificationsService extends ApiService {

      /**
       * Get active notifications for an account
       */
      public async get(params: INotificationsGetParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/notifications`
        };

        requestParams.queryParameters = {
          account: params.account,
        };
        return this.executeRequest<Notification[]>(requestParams);
      }
    }
    export class OrdersService extends ApiService {

      /**
       * Get list of orders
       */
      public async get(params: IOrdersGetParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/orders`
        };

        requestParams.queryParameters = {
          networkId: params.networkId,
          makerTokenAddress: params.makerTokenAddress,
          takerTokenAddress: params.takerTokenAddress,
          isAscending: params.isAscending,
          sortOrder: params.sortOrder,
          maker: params.maker,
          includeExternal: params.includeExternal,
          isOpen: params.isOpen,
        };
        return this.executeRequest<Order[]>(requestParams);
      }

      /**
       * Get the order(s) representing the best market price
       */
      public async getBest(params: IOrdersGetBestParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/orders/best`
        };

        requestParams.queryParameters = {
          makerTokenAddress: params.makerTokenAddress,
          takerTokenAddress: params.takerTokenAddress,
          baseTokenAddress: params.baseTokenAddress,
          quantity: params.quantity,
          networkId: params.networkId,
          takerAddress: params.takerAddress,
        };
        return this.executeRequest<IMarketOrderQuote>(requestParams);
      }
    }
    export class ReportsService extends ApiService {

      /**
       * Get historical data for order book
       */
      public async getHistorical(params: IReportsGetHistoricalParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/reports/historical`
        };

        requestParams.queryParameters = {
          networkId: params.networkId,
          makerTokenAddress: params.makerTokenAddress,
          takerTokenAddress: params.takerTokenAddress,
          startDate: params.startDate,
          endDate: params.endDate,
        };
        return this.executeRequest<IDateSummary[]>(requestParams);
      }

      public async getTickerData() {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/reports/ticker`
        };
        return this.executeRequest<ITokenTicker[]>(requestParams);
      }
    }
    export class StandardService extends ApiService {

      public async getTokenPairs(params: IStandardGetTokenPairsParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/standard/${params.networkId}/v0/token_pairs`
        };

        requestParams.queryParameters = {
          per_page: params.per_page,
          page: params.page,
        };
        return this.executeRequest<IStandardTokenPair[]>(requestParams);
      }

      public async getOrders(params: IStandardGetOrdersParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/standard/${params.networkId}/v0/orders`
        };

        requestParams.queryParameters = {
          per_page: params.per_page,
          page: params.page,
          exchangeContractAddress: params.exchangeContractAddress,
          tokenAddress: params.tokenAddress,
          makerTokenAddress: params.makerTokenAddress,
          takerTokenAddress: params.takerTokenAddress,
          maker: params.maker,
          taker: params.taker,
          trader: params.trader,
          feeRecipient: params.feeRecipient,
        };
        return this.executeRequest<IStandardOrder[]>(requestParams);
      }

      public async getOrderByHash(params: IStandardGetOrderByHashParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/standard/${params.networkId}/v0/order/${params.orderHash}`
        };
        return this.executeRequest<IStandardOrder>(requestParams);
      }

      public async getFees(params: IStandardGetFeesParams) {
        const requestParams: IRequestParams = {
          method: 'POST',
          url: `${baseApiUrl}/api/standard/${params.networkId}/v0/fees`
        };

        requestParams.body = params.request;
        return this.executeRequest<IFees>(requestParams);
      }

      /**
       * Create an order
       */
      public async create(params: IStandardCreateParams) {
        const requestParams: IRequestParams = {
          method: 'POST',
          url: `${baseApiUrl}/api/standard/${params.networkId}/v0/order`
        };

        requestParams.body = params.request;
        return this.executeRequest<Order>(requestParams);
      }

      public async getOrderbook(params: IStandardGetOrderbookParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/standard/${params.networkId}/v0/orderbook`
        };

        requestParams.queryParameters = {
          baseTokenAddress: params.baseTokenAddress,
          quoteTokenAddress: params.quoteTokenAddress,
          per_page: params.per_page,
          page: params.page,
        };
        return this.executeRequest<IStandardOrderbook>(requestParams);
      }
    }
    export class TakerEventsService extends ApiService {

      /**
       * Get Taker Events
       */
      public async getByTaker(params: ITakerEventsGetByTakerParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/taker-events/taker`
        };

        requestParams.queryParameters = {
          networkId: params.networkId,
          taker: params.taker,
        };
        return this.executeRequest<TakerEvent[]>(requestParams);
      }

      /**
       * Get Taker Events by token pair
       */
      public async getByPair(params: ITakerEventsGetByPairParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/taker-events/pair`
        };

        requestParams.queryParameters = {
          networkId: params.networkId,
          makerTokenAddress: params.makerTokenAddress,
          takerTokenAddress: params.takerTokenAddress,
          taker: params.taker,
        };
        return this.executeRequest<TakerEvent[]>(requestParams);
      }
    }
    export class TokenPairSummariesService extends ApiService {

      /**
       * Get a list of token pair summaries
       */
      public async get(params: ITokenPairSummariesGetParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/token-pair-summaries/${params.networkId}`
        };
        return this.executeRequest<ITokenPairSummary[]>(requestParams);
      }
    }
    export class TokenPairsService extends ApiService {

      /**
       * Get a list of supported token pairs
       */
      public async get(params: ITokenPairsGetParams) {
        const requestParams: IRequestParams = {
          method: 'GET',
          url: `${baseApiUrl}/api/token-pairs/${params.networkId}`
        };
        return this.executeRequest<any>(requestParams);
      }
    }
  }

  /**
   * Namespace containing socket related events
   */
  export namespace Events {
    /* tslint:disable *//**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IPairOrderChangeEventParams {
  makerTokenAddress: string;
  takerTokenAddress: string;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IOrderChangeEventData {
  order: Order;
  eventType: ("canceled" | "created" | "expired" | "filled" | "partially-filled" | "pending-cancellation" | "pending-filled" | "pending-partially-filled" | "removed");
  reason?: string;
  
}
/**
 * An order that has been recorded on the ERC dEX Order Book
 */
export interface Order {
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateClosed: Date;
  /**
   * ID of the Ethereum network the order is associated with
   */
  networkId: number;
  /**
   * 0x Exchange Contract Address
   */
  exchangeContractAddress: string;
  /**
   * Unix timestamp of order expiration (in seconds)
   */
  expirationUnixTimestampSec: number;
  /**
   * Address of the fee recipient
   */
  feeRecipient: string;
  /**
   * Address of the order maker
   */
  maker: string;
  /**
   * Fee due from maker on order fill
   */
  makerFee: string;
  /**
   * Token address of the maker token
   */
  makerTokenAddress: string;
  /**
   * Total amount of maker token in order
   */
  makerTokenAmount: string;
  /**
   * Secure salt
   */
  salt: string;
  /**
   * Serialized version of the EC signature for signed orders
   */
  serializedEcSignature: string;
  /**
   * Taker address; generally a null taker
   */
  taker: string;
  /**
   * Fee due from taker on order fill
   */
  takerFee: string;
  /**
   * Token address of the taker token
   */
  takerTokenAddress: string;
  /**
   * Total amount of taker token in order
   */
  takerTokenAmount: string;
  /**
   * Remaining amount in the order in terms of taker token units
   */
  remainingTakerTokenAmount: string;
  /**
   * The hash of the signed order
   */
  orderHash: string;
  /**
   * State of the order: Open (0), Canceled (1),
   * Filled (2), Expired(3), Removed(4),
   * PendingCancel (5)
   */
  state: number;
  source: string;
  takerEvents: TakerEvent[];
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
export interface TakerEvent {
  /**
   * ID of the associated order
   */
  orderId: number;
  /**
   * Amount filled on the order
   */
  takerAmount: string;
  /**
   * Address of the order taker
   */
  taker: string;
  /**
   * Associated transaction hash of fill event
   */
  txHash: string;
  /**
   * State of the event: Pending(0), Complete (1), Failed (2)
   */
  state: number;
  order: Order;
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IAccountOrderChangeEventParams {
  account: string;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IAccountNotificationEventParams {
  account: string;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IAccountNotificationEventData {
  notification: Notification;
  
}
/**
 * A notification meant for consumption by clients
 */
export interface Notification {
  /**
   * Hex address of account associated with notification
   */
  account: string;
  /**
   * Text label of notification
   */
  label: string;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  expirationDate: Date;
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IPairTakerEventEventParams {
  makerTokenAddress: string;
  takerTokenAddress: string;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IPairTakerEventEventData {
  takerEvent: TakerEvent;
  eventType: ("created" | "removed" | "updated");
  
}
export interface TakerEvent {
  /**
   * ID of the associated order
   */
  orderId: number;
  /**
   * Amount filled on the order
   */
  takerAmount: string;
  /**
   * Address of the order taker
   */
  taker: string;
  /**
   * Associated transaction hash of fill event
   */
  txHash: string;
  /**
   * State of the event: Pending(0), Complete (1), Failed (2)
   */
  state: number;
  order: Order;
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
/**
 * An order that has been recorded on the ERC dEX Order Book
 */
export interface Order {
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateClosed: Date;
  /**
   * ID of the Ethereum network the order is associated with
   */
  networkId: number;
  /**
   * 0x Exchange Contract Address
   */
  exchangeContractAddress: string;
  /**
   * Unix timestamp of order expiration (in seconds)
   */
  expirationUnixTimestampSec: number;
  /**
   * Address of the fee recipient
   */
  feeRecipient: string;
  /**
   * Address of the order maker
   */
  maker: string;
  /**
   * Fee due from maker on order fill
   */
  makerFee: string;
  /**
   * Token address of the maker token
   */
  makerTokenAddress: string;
  /**
   * Total amount of maker token in order
   */
  makerTokenAmount: string;
  /**
   * Secure salt
   */
  salt: string;
  /**
   * Serialized version of the EC signature for signed orders
   */
  serializedEcSignature: string;
  /**
   * Taker address; generally a null taker
   */
  taker: string;
  /**
   * Fee due from taker on order fill
   */
  takerFee: string;
  /**
   * Token address of the taker token
   */
  takerTokenAddress: string;
  /**
   * Total amount of taker token in order
   */
  takerTokenAmount: string;
  /**
   * Remaining amount in the order in terms of taker token units
   */
  remainingTakerTokenAmount: string;
  /**
   * The hash of the signed order
   */
  orderHash: string;
  /**
   * State of the order: Open (0), Canceled (1),
   * Filled (2), Expired(3), Removed(4),
   * PendingCancel (5)
   */
  state: number;
  source: string;
  takerEvents: TakerEvent[];
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IAccountTakerEventEventParams {
  account: string;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface IAccountTakerEventEventData {
  takerEvent: TakerEvent;
  eventType: ("created" | "removed" | "updated");
  
}
export interface TakerEvent {
  /**
   * ID of the associated order
   */
  orderId: number;
  /**
   * Amount filled on the order
   */
  takerAmount: string;
  /**
   * Address of the order taker
   */
  taker: string;
  /**
   * Associated transaction hash of fill event
   */
  txHash: string;
  /**
   * State of the event: Pending(0), Complete (1), Failed (2)
   */
  state: number;
  order: Order;
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
/**
 * An order that has been recorded on the ERC dEX Order Book
 */
export interface Order {
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateClosed: Date;
  /**
   * ID of the Ethereum network the order is associated with
   */
  networkId: number;
  /**
   * 0x Exchange Contract Address
   */
  exchangeContractAddress: string;
  /**
   * Unix timestamp of order expiration (in seconds)
   */
  expirationUnixTimestampSec: number;
  /**
   * Address of the fee recipient
   */
  feeRecipient: string;
  /**
   * Address of the order maker
   */
  maker: string;
  /**
   * Fee due from maker on order fill
   */
  makerFee: string;
  /**
   * Token address of the maker token
   */
  makerTokenAddress: string;
  /**
   * Total amount of maker token in order
   */
  makerTokenAmount: string;
  /**
   * Secure salt
   */
  salt: string;
  /**
   * Serialized version of the EC signature for signed orders
   */
  serializedEcSignature: string;
  /**
   * Taker address; generally a null taker
   */
  taker: string;
  /**
   * Fee due from taker on order fill
   */
  takerFee: string;
  /**
   * Token address of the taker token
   */
  takerTokenAddress: string;
  /**
   * Total amount of taker token in order
   */
  takerTokenAmount: string;
  /**
   * Remaining amount in the order in terms of taker token units
   */
  remainingTakerTokenAmount: string;
  /**
   * The hash of the signed order
   */
  orderHash: string;
  /**
   * State of the order: Open (0), Canceled (1),
   * Filled (2), Expired(3), Removed(4),
   * PendingCancel (5)
   */
  state: number;
  source: string;
  takerEvents: TakerEvent[];
  /**
   * Unique Identifier
   */
  id: number;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateCreated: Date;
  /**
   * Enables basic storage and retrieval of dates and times.
   */
  dateUpdated: Date;
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface ITickerSubscriptionParams {
  
}
/**
* This file was automatically generated by json-schema-to-typescript.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run json-schema-to-typescript to regenerate this file.
*/

export interface ITickerSubscriptionData {
  tickers: ITokenTicker[];
  
}
export interface ITokenTicker {
  id: string;
  name: string;
  symbol: string;
  usdPrice: string;
  btcPrice: string;
  hourlyPercentageChange: string;
  dailyPercentageChange: string;
  weeklyPercentageChange: string;
  dailyVolume: string;
  priceEth: string;
  
}


    export abstract class SocketEvent<P extends { [key: string]: any }, R> {
      protected abstract path: string;
      private params: P;
      private callback: (data: R) => void;

      /**
       * Subscribe to this event
       * @param params Payload to submit to the server
       * @param cb Handler for event broadcasts
       */
      public subscribe(params: P, cb: (data: R) => void) {
        if (!hasWebSocket) {
          throw new Error('WebSockets not configured.');
        }

        this.params = params;
        this.callback = cb;

        const channel = this.getChannel(params);
        send(`sub:${channel}`);

        const sub = subscriptions[channel];
        if (sub) {
          sub.callbacks.push(this.callback);
        } else {
          subscriptions[channel] = {
            callbacks: [this.callback],
            resub: () => {
              send(`sub:${channel}`)
            },
            subActive: true
          };
        }

        return this;
      }

      /**
       * Dispose of an active subscription
       */
      public unsubscribe() {
        send(`unsub:${this.getChannel(this.params)}`);
      }

      private getChannel(params: P) {
        let channel = this.path;

        Object.keys(params).forEach(k => {
          channel = channel.replace(`:${k}`, params[k]);
        });

        return channel;
      }
    }

    /**
     * Order changes relating to a token pair
     */
    export class PairOrderChange extends SocketEvent<IPairOrderChangeEventParams, IOrderChangeEventData> {
      protected path = 'pair-order-change/:makerTokenAddress/:takerTokenAddress';
    }

    /**
     * Order changes related to an account address
     */
    export class AccountOrderChange extends SocketEvent<IAccountOrderChangeEventParams, IOrderChangeEventData> {
      protected path = 'account-order-change/:account';
    }

    /**
     * Notifications related to an account address
     */
    export class AccountNotification extends SocketEvent<IAccountNotificationEventParams, IAccountNotificationEventData> {
      protected path = 'account-notification/:account';
    }

    /**
     * Taker events related to a token pair
     */
    export class PairTakerEvent extends SocketEvent<IPairTakerEventEventParams, IPairTakerEventEventData> {
      protected path = 'pair-taker-event/:makerTokenAddress/:takerTokenAddress';
    }

    /**
     * Taker events related to an address
     */
    export class AccountTakerEvent extends SocketEvent<IAccountTakerEventEventParams, IAccountTakerEventEventData> {
      protected path = 'account-taker-event/:account';
    }

    /**
     * Price Ticker Updates
     */
    export class TickerSubscription extends SocketEvent<ITickerSubscriptionParams, ITickerSubscriptionData> {
      protected path = 'ticker';
    }
  }

  export namespace Utils {
    export interface ISignOrderParams {
      maker: string;
      taker: string;
      makerFee: BigNumber;
      takerFee: BigNumber;
      makerTokenAmount: BigNumber;
      makerTokenAddress: string;
      takerTokenAmount: BigNumber;
      takerTokenAddress: string;
      exchangeContractAddress: string;
      feeRecipient: string;
      expirationUnixTimestampSec: number;
      salt: BigNumber;
    }

    export interface IZeroExOrder {
      maker: string;
      taker: string;
      makerFee: BigNumber;
      takerFee: BigNumber;
      makerTokenAmount: BigNumber;
      takerTokenAmount: BigNumber;
      makerTokenAddress: string;
      takerTokenAddress: string;
      salt: BigNumber;
      exchangeContractAddress: string;
      feeRecipient: string;
      expirationUnixTimestampSec: BigNumber;
    }

    export interface IZeroExSignedOrder extends IZeroExOrder {
      ecSignature: Api.IEcSignature;
    }

    export interface IZeroExImplementation {
      client: {
        signOrderHashAsync(orderHash: string, maker: string): Promise<Api.IEcSignature>;
      };
      getOrderHashHex: (order: IZeroExOrder) => string;
    }

    export const signOrder = async (zeroEx: IZeroExImplementation, params: ISignOrderParams): Promise<Aqueduct.Api.IStandardOrderCreationRequest> => {
      const order: IZeroExOrder = {
        maker: params.maker,
        taker: params.taker,
        makerFee: params.makerFee,
        takerFee: params.takerFee,
        makerTokenAmount: params.makerTokenAmount,
        takerTokenAmount: params.takerTokenAmount,
        makerTokenAddress: params.makerTokenAddress,
        takerTokenAddress: params.takerTokenAddress as string,
        salt: params.salt,
        exchangeContractAddress: params.exchangeContractAddress,
        feeRecipient: params.feeRecipient,
        expirationUnixTimestampSec: new BigNumber(params.expirationUnixTimestampSec)
      };

      const orderHash = zeroEx.getOrderHashHex(order);
      const ecSignature = await zeroEx.client.signOrderHashAsync(orderHash, params.maker);

      return {
        maker: params.maker,
        taker: order.taker,
        makerFee: params.makerFee.toString(),
        takerFee: params.takerFee.toString(),
        makerTokenAmount: params.makerTokenAmount.toString(),
        takerTokenAmount: params.takerTokenAmount.toString(),
        makerTokenAddress: params.makerTokenAddress,
        takerTokenAddress: params.takerTokenAddress,
        salt: order.salt.toString(),
        exchangeContractAddress: params.exchangeContractAddress,
        feeRecipient: params.feeRecipient,
        expirationUnixTimestampSec: order.expirationUnixTimestampSec.toString(),
        ecSignature
      };
    };

    export const convertStandardOrderToSignedOrder = (order: Aqueduct.Api.IStandardOrder): IZeroExSignedOrder => {
      return {
        ecSignature: order.ecSignature,
        exchangeContractAddress: order.exchangeContractAddress,
        expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
        feeRecipient: order.feeRecipient,
        maker: order.maker,
        makerFee: new BigNumber(order.makerFee),
        makerTokenAddress: order.makerTokenAddress,
        makerTokenAmount: new BigNumber(order.makerTokenAmount),
        salt: new BigNumber(order.salt),
        taker: order.taker,
        takerFee: new BigNumber(order.takerFee),
        takerTokenAddress: order.takerTokenAddress,
        takerTokenAmount: new BigNumber(order.takerTokenAmount)
      };
    };

    export const convertOrderToSignedOrder = (order: Aqueduct.Api.Order): IZeroExSignedOrder => {
      return {
        ecSignature: JSON.parse(order.serializedEcSignature),
        exchangeContractAddress: order.exchangeContractAddress,
        expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
        feeRecipient: order.feeRecipient,
        maker: order.maker,
        makerFee: new BigNumber(order.makerFee),
        makerTokenAddress: order.makerTokenAddress,
        makerTokenAmount: new BigNumber(order.makerTokenAmount),
        salt: new BigNumber(order.salt),
        taker: order.taker,
        takerFee: new BigNumber(order.takerFee),
        takerTokenAddress: order.takerTokenAddress,
        takerTokenAmount: new BigNumber(order.takerTokenAmount)
      };
    };

    export const Tokens: TokenCache = tokenCache;
  }
}
