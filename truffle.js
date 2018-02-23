module.exports = {
	networks: {
		kovan: {
		  host: "127.0.0.1",
		  port: 8545,
		  network_id: 42, // Match any network id
		  gasPrice: 50;
		}
	}
};

// gas: Gas limit used for deploys. Default is 4712388.
// gasPrice: Gas price used for deploys. Default is 100000000000 (100 Shannon).

