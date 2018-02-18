import * as WebRequest from 'web-request';
import * as Web3 from 'web3';

module.exports =
{
    getOrders: function () {

      console.log("YES");
      const makerToken = "ZRX";
      const takerToken = "WETH";
      const networkId = 1;
      const orders_url = "https://api.ercdex.com/api/standard/"+networkId+"/v0/orders?sortOrder=price&isOpen=True&isAscending=false";
      const tokenpairs_url = "https://api.ercdex.com/api/token-pairs/"+networkId;
      var orders_result = await WebRequest.get(orders_url);
      var tokenpairs_result = await WebRequest.get(tokenpairs_url);
      let orders_obj = JSON.parse(orders_result.content);
      let tokenpairs_obj = JSON.parse(tokenpairs_result.content);
      //Let's get the mastertoken address and takertoken address
      var taker_Address = "";
      var maker_Address = "";
      for (var key in tokenpairs_obj) {
        if(tokenpairs_obj[key].tokenB.symbol == takerToken){
          taker_Address = tokenpairs_obj[key].tokenB.address
        }
        if(tokenpairs_obj[key].tokenA.symbol == makerToken){
          maker_Address = tokenpairs_obj[key].tokenA.address
        }
      }
      console.log("Taker Address, ",taker_Address);
      console.log("Maker Address, ",maker_Address);
      var final_orders = [];
      for (var key in orders_obj) {
        //console.log("Maker :", orders_obj[key].makerTokenAddress, "Taker: ", orders_obj[key].takerTokenAddress);
        if(orders_obj[key].makerTokenAddress == maker_Address
                && orders_obj[key].takerTokenAddress == taker_Address){
          var matched_order = orders_obj[key];
          var price = matched_order.takerTokenAmount/matched_order.makerTokenAmount;
          final_orders.unshift(matched_order);
        }
      }
      for(var key in final_orders){
        var current_order = final_orders[key];
        var order_addresses = [current_order.maker, current_order.taker, current_order.makerTokenAddress, current_order.takerTokenAddress, current_order.feeRecipient];
        var order_values = [current_order.makerTokenAmount, current_order.takerTokenAmount, current_order.makerFee, current_order.takerFee, current_order.salt];
        var v = current_order.ecSignature.v;
        var r = current_order.ecSignature.r;
        var s = current_order.ecSignature.s;
        var price = current_order.takerTokenAmount/current_order.makerTokenAmount;
        var final_order = {
          orderAddresses: order_addresses,
          orderValues: order_values,
          v: v,
          r: r,
          s: s,
          price: price
        }
        final_orders[key] = final_order
      }
      console.log(final_orders);
      return final_orders;
    }
};
