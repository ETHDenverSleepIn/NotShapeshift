import * as WebSocket from 'ws';

const ws = new WebSocket('wss://api.ercdex.com', { perMessageDeflate: false });
const myAccountAddress = 'my-account-address';

ws.on('open', () => {
  console.info('connection opened');
  // subscribe to account notifications
  ws.send(`sub:account-notification/${myAccountAddress}`);

  // later on, for instance if you change accounts
  ws.send(`unsub:account-notification/${myAccountAddress}`);
});

ws.on('message', (data: { channel: string; }) => {
  if (data.channel === `sub:account-notification/${myAccountAddress}`) {
    /**
     * {
     *   "channel": "account-notification/0x5409ed021d9299bf6814279a6a1411a7e866a631",
     *   "data":{
     *     "notification":{
     *       "account":"0x5409ed021d9299bf6814279a6a1411a7e866a631",
     *       "label":"An order was canceled.",
     *       "expirationDate":"2018-02-09T15:49:45.197Z",
     *       "dateUpdated":"2018-02-08T15:49:45.199Z",
     *       "dateCreated":"2018-02-08T15:49:45.199Z",
     *       "id":1657
     *     }
     *   }
     * }
     */
    console.log(data);
    return;
  }

  console.log(data);
});

ws.on('error', err => console.error(err));
