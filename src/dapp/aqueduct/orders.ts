import { Aqueduct } from '..aqueduct';
import { MarketOrder } from '../market-order';
import { BigNumber } from 'bignumber.js';

Aqueduct.Initialize();

(async () => {
  await new MarketOrder({
    account: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    baseTokenSymbol: 'MLN',
    quoteTokenSymbol: 'WETH',
    // buying .1 MLN
    quantityInWei: new BigNumber(100000000000000000),
    nodeUrl: 'http://localhost:8545',
    type: 'buy'
  }).execute();
})();

(async () => {
  const orders = await new Aqueduct.Api.OrdersService().get({
    maker: '0x00be81aeb2c6b82c68123f49b4bf983224124ada',
    networkId: 1
  });

  console.log(orders);
})();
