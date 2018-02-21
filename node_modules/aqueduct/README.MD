[![npm version](https://badge.fury.io/js/aqueduct.svg)](https://badge.fury.io/js/aqueduct)

# Aqueduct JavaScript SDK

## Overview

The JavaScript client library offers a simple way to begin interacting with the Aqueduct protocol, including convenience wrappers for a variety of trading related tasks. While we do offer a standalone [REST API](https://aqueduct.ercdex.com/rest.html) and [WebSocket API](https://aqueduct.ercdex.com/#/events), the client library helps to bundle together common workflows and enhances API discoverability for TypeScript users.

## Quick Start

### Setup environment

- Must have [node.js](https://nodejs.org/en/) installed
- Recommended: A local Ethereum client such as [Parity](https://www.parity.io/). While not required to interact with the APIs, some wallet will be necessary to sign transactions using Web3.
    - If you plan to have trades execute autonomously, you'll need to unlock your account so that transactions can be automatically approved during script execution.
    - Read about [Configuring Parity](https://paritytech.github.io/wiki/Configuring-Parity), specifically the "account" section

### Install NPM Package

`yarn add aqueduct` or `npm install aqueduct`

## Usage

The SDK can be thought of as containing four 'types' of actions:
- Initialization
- High level trading workflows
- REST API interaction
- WebSocket API interaction

### Initialization

Aqueduct.Initialize *must* be called before interacting with the SDK in any way:

```
import { Aqueduct } from 'aqueduct';

Aqueduct.Initialize();
```

#### A note about WebSockets

Modern browsers containing native implementations of the [WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). If you intend to use the Events API outside of a browser, you'll need to bring your own WebSockets implementation. We recommend a great library like [ws](https://github.com/websockets/ws). In a node.js environment, make sure to put the WebSocket constructor the global namespace:

```
import * as ws from 'ws';

global.WebSocket = ws;
```

### Trading Workflows

Trading workflows refers to common trading actions that are actually composed of several layers, including interacting with the Aqueduct server API, validating order parameters, and interacting with the Ethereum network in some way (off chain signing, or sending transactions). It is completely possible to post, fill, and cancel orders without using these workflow wrappers, but these wrappers create an intuitive interface for traders.

#### Placing a Limit Order

Limit orders represent a brand new order with a quantity and price specified by the user. Limit orders can be filled by other traders.

```
import { BigNumber } from 'bignumber.js';
import { Aqueduct } from 'aqueduct';
import { LimitOrder } from '../limit-order';

Aqueduct.Initialize();

(async () => {
  const order = await new LimitOrder({
    // an unlocked account configured in local node (Parity)
    account: '0x00be81aeb2c6b82c68123f49b4bf983224124ada',
    // 'ZRX' in ZRX/WETH
    baseTokenSymbol: 'ZRX',
    // 'WETH' in ZRX/WETH
    quoteTokenSymbol: 'WETH',
    price: new BigNumber(.0013),
    // base amount in wei - buying 40 ZRX
    quantityInWei: new BigNumber(40000000000000000000),
    // buying ZRX
    type: 'buy',
    // points to a local node (Parity)
    nodeUrl: 'http://localhost:8545'
  }).execute();

  console.log(order);

  process.exit(0);
})();

```

#### Placing a Market Order

Market orders attempt to fill existing orders at the best price. Traders placing market orders don't specify a price, only a quantity.

```
import { BigNumber } from 'bignumber.js';
import { Aqueduct } from 'aqueduct';
import { MarketOrder } from '../market-order';

// Initialize the Aqueduct client
Aqueduct.Initialize();

(async () => {
  await new MarketOrder({
    account: '0x00be81aeb2c6b82c68123f49b4bf983224124ada',
    baseTokenSymbol: 'MLN',
    quoteTokenSymbol: 'WETH',
    // buying .1 MLN
    quantityInWei: new BigNumber(100000000000000000),
    nodeUrl: 'http://localhost:8545',
    type: 'buy'
  }).execute();
})();

```

#### Filling a standalone order

You may want to fill a single order rather than using the more advanced Market Order option. 

```
import { ZeroEx } from '0x.js';
import { BigNumber } from 'bignumber.js';
import { FillOrder } from '../fill-order';
import { Aqueduct } from 'aqueduct';

Aqueduct.Initialize();

(async () => {
  await new FillOrder({
    orderHash: '0x96be98070f1e3b0ff06014f34d5916e7a26b37b60f5583b44c7dca27e0051eaa',
    takerAmountInWei: ZeroEx.toBaseUnitAmount(new BigNumber(0.000012), 18),
    account: '0x00be81aeb2c6b82c68123f49b4bf983224124ada',
    nodeUrl: 'http://localhost:8545'
  }).execute();

  process.exit(0);
})();

```

#### Canceling an order

Traders can cancel limit orders that they've opened.

```
import { CancelOrder } from '../cancel-order';
import { Aqueduct } from 'aqueduct';

(async () => {
  Aqueduct.Initialize();

  const cancelTxHash = await new CancelOrder({
    orderHash: '0x1ec30426e15451eb75d324c2b674f65b5a0acdcfab6bba772e3347c30296c5c6',
    nodeUrl: 'http://localhost:8545'
  }).execute();

  console.log(`order cancelled. tx: ${cancelTxHash}`);
})();

```

### Rest API Services

The REST API SDK (conveniently located in the Aqueduct.Api namespace) is a simple service for interacting with REST endpoints. Domain objects are grouped logically into services. [See the full REST API documentation here.](https://aqueduct.ercdex.com/rest.html)

#### Getting a list of your open orders

```
import { Aqueduct } from '..aqueduct';

Aqueduct.Initialize();

(async () => {
  const orders = await new Aqueduct.Api.OrdersService().get({
    maker: '0x00be81aeb2c6b82c68123f49b4bf983224124ada',
    networkId: 1
  });

  console.log(orders);
})();

```

### WebSocket API Services

Event related functions are contained within the "Events" namespace. All events follow a simple subscription model, taking in parameters and a callback to handle the event feed. Subscriptions must be managed by the client and unused subscriptions should be `unsubscribed`.

```
import { Aqueduct } from 'aqueduct';

// Initialize client
Aqueduct.Initialize();

const subscription = new Aqueduct.Events.AccountNotification().subscribe({
  account: 'XXXX'
}, data => {
  console.log(data);
});

// some time later
subscription.unsubscribe();
```

## SDK Technical Documentation

Documentation on available imports and client APIs can be found [here.](https://aqueduct.ercdex.com/client/modules/_aqueduct_.html)

## Developer Environment

- Run 'yarn' at the root
- Run 'yarn' at /docs
- Run 'yarn start:docs' from root to start developer site
