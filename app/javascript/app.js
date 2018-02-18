console.log('app.js loaded...')
// require("file-loader?name=../index.html!../index.html");
const Promise = require("bluebird");	
const Web3 = require("web3");
const truffle = require("truffle-contract");
const $ = require("jquery");
const NotShapeShiftContractJSON = require("../../build/contracts/Splitter.json");


if(typeof Web3 !== 'undefined'){//typeof Web3 == 'undefined'){ //for mist/metamask. Set to false to prevent default metmask injection
	console.log("Using testrpc on Metamask")
	window.web3 = new Web3(web3.currentProvider);
}
else{
	console.log('Using testrpc on http://localhost:8545...');
	window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}
console.log("web3 ", web3);
console.log("1 ether in wei: ", web3.utils.toWei('1', "ether"))
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const provider = window.web3;
console.log('0x5409ed021d9299bf6814279a6a1411a7e866a631')

web3.eth.getAccountsPromise()
.then(accounts => {
	console.log("Accounts", accounts);
}
