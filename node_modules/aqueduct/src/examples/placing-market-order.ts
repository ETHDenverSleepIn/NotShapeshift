import { BigNumber } from 'bignumber.js';
import { Aqueduct } from '../generated/aqueduct';
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
