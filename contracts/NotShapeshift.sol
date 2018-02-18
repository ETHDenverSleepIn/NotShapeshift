pragma solidity ^0.4.18;

import './WETH9.sol';
import './Exchange.sol';

contract NotShapeshift{
    WETH9 etherToken;
    Exchange exchange;
    // address public etherToken;
    // address public exchange;
    // Exchange exchange;
    
    event Deposit(address sender, uint amount);

	function NotShapeshift(){
	    etherToken = new WETH9();
		exchange = Exchange(0x90fe2af704b34e0224bf2299c838e04d4dcf1364); //ZRX , address(0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570)
	}
    function wrapEth() payable{
        require(msg.value > 0);
        etherToken.deposit.value(msg.value);
        Deposit(msg.sender, msg.value);
        // Deposit(msg.sender ，msg.value);
    }
    function getBalance() constant returns(address){
        etherToken.balanceOf(this);
    }
    function fillOrder(address[5] orderAddresses, uint[6] orderValues, uint fillTakerTokenAmount, bool shouldThrowOnInsufficientBalanceOrAllowance, uint8 v, bytes32 r, bytes32 s) public returns(uint){
    	// exchange.setUnlimitedProxyAllowance(ZRX_TOKEN_CONTRACT, TOKEN_TRANSFER_PROXY_CONTRACT);
    	return exchange.fillOrder(orderAddresses, orderValues, fillTakerTokenAmount, shouldThrowOnInsufficientBalanceOrAllowance, v, r, s); // returns (uint filledTakerTokenAmount)
    	/// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    }
    function getWethBalance(address thisContractAddress) returns(uint){
    	return etherToken.balanceOf(thisContractAddress);
    }
    //bool should always be true
    //fillTakerTokenAmount is simply the amount of tokens (in our case WETH) the Taker wants to fill.
}

//function deposit() public payable {
    //     balanceOf[msg.sender] += msg.value;
    //     Deposit(msg.sender, msg.value);
    // }