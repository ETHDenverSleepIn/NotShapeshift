// var Weth9 = artifacts.require("../contracts/WETH9.sol");
// var SafeMath = artifacts.require("../contracts/SafeMath.sol")
// var Exchange = artifacts.require("../contracts/Exchange.sol")
var NotShapeshift = artifacts.require("../contracts/NotShapeshift.sol")
// var Token = artifacts.require('../contracts/Token.sol')

module.exports = function(deployer) {
	deployer.deploy(NotShapeshift);
};
