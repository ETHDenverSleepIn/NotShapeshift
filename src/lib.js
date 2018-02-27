import { Aqueduct } from 'aqueduct';

Aqueduct.Initialize();

export async function getOrders(tokenInput, tokenOutput, networkId) {
      return getOrdersByTokenPair(tokenInput, tokenOutput, networkId);
}

async function getOrdersByTokenPair(tokenInput, tokenOutput, networkId) {
  var tokenPairs = await new Aqueduct.Api.TokenPairSummariesService().get({
    networkId: networkId
  });
  for(var i = 0; i < tokenPairs.length; i++) {
    var current = tokenPairs[i];
    if(current.tokenPair.baseVolume > 0){
      var tokenA = current.tokenPair.tokenA;
      var tokenB = current.tokenPair.tokenB;
      if(tokenA.symbol === tokenInput && tokenB.symbol === tokenOutput){
        return getOrdersByTokenAddress(tokenA.address, tokenB.address, networkId);
      }else if(tokenA.symbol === tokenOutput && tokenB.symbol === tokenInput){
        return getOrdersByTokenAddress(tokenB.address, tokenA.address, networkId);
      }
    }
  }
}

async function getOrdersByTokenAddress(takerAddress, makerAddress, networkId){
  var decoratedOrders = [];
  const orders = await new Aqueduct.Api.StandardService().getOrders({
    networkId: networkId,
    makerTokenAddress: makerAddress,
    takerTokenAddress: takerAddress
  });
  for(var key in orders){
    decoratedOrders.push(decorateOrder(orders[key]));
  }
  return decoratedOrders;
}

async function decorateOrder(order){
    var orderAddresses = [order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient];
    var orderValues = [order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.salt];
    var v = order.ecSignature.v;
    var r = order.ecSignature.r;
    var s = order.ecSignature.s;
    var decoratedOrder = {
      orderAddresses: orderAddresses,
      orderValues: orderValues,
      v: v,
      r: r,
      s: s
    }
    return decoratedOrder;
}
