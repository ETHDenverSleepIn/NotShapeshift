import { CancelOrder } from '../cancel-order';
import { Aqueduct } from '../generated/aqueduct';

(async () => {
  Aqueduct.Initialize();

  const cancelTxHash = await new CancelOrder({
    orderHash: '0x1ec30426e15451eb75d324c2b674f65b5a0acdcfab6bba772e3347c30296c5c6',
    nodeUrl: 'http://localhost:8545'
  }).execute();

  console.log(`order cancelled. tx: ${cancelTxHash}`);
})();
