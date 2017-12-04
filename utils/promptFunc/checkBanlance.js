function checkBalance(web3, address) {
	var balance = web3.eth.getBalance(address);
	var weiToEth = web3.fromWei(balance);

	return weiToEth.toString();
}

module.exports = checkBalance;