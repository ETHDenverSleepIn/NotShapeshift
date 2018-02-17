import { ZeroEx } from '0x.js';
import { BigNumber } from 'bignumber.js';
import { FillOrder } from '../fill-order';
import { Aqueduct } from '../generated/aqueduct';

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
