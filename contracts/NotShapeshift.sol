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
		exchange = Exchange(0xe41d2489571d322189246dafa5ebde1f4699f498);
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
}

//function deposit() public payable {
    //     balanceOf[msg.sender] += msg.value;
    //     Deposit(msg.sender, msg.value);
    // }