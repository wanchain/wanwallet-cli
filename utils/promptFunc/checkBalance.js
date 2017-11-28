function checkBalance(web3, address) {
	let balance = web3.eth.getBalance(address);
	let weiToEth = web3.fromWei(balance);

	return weiToEth.toString();
}

module.exports = checkBalance;