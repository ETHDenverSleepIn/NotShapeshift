import { Aqueduct } from '../generated/aqueduct';

// Initialize the Aqueduct client with the target API URL
Aqueduct.Initialize();

(async () => {
  const orders = await new Aqueduct.Api.OrdersService().get({
    maker: '0x00be81aeb2c6b82c68123f49b4bf983224124ada',
    networkId: 42
  });

  console.log(orders);
})();
