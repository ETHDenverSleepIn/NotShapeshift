import { BigNumber } from 'bignumber.js';
import { Aqueduct } from '../generated/aqueduct';
import { LimitOrder } from '../limit-order';

// Initialize the Aqueduct client
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
