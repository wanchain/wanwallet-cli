
function getTransactionReceipt(web3, txHash)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				console.log("err: "+err);
			}else{
				let receipt = web3.eth.getTransactionReceipt(txHash);
				blockAfter += 1;
				if(receipt){
					filter.stopWatching();
					success(receipt);
					return receipt;
				}else if(blockAfter > 6){
					fail("Get receipt timeout");
				}
			}
		});
	});
}

async function sendTransaction(web3, Tx, receiver_address,sender_address, privKeyA, value, wanchainLog) {

	var serial = '0x' + web3.eth.getTransactionCount(sender_address).toString(16);
	var rawTx = {
		Txtype: '0x00',
		nonce: serial,
        gasPrice: '0x6fc23ac00',
        gasLimit: '0xf4240',
    	to: receiver_address,//contract address
		value: value,
	};
	console.log("rawTx:", rawTx);
	var tx = new Tx(rawTx);
	console.log(privKeyA);
	tx.sign(privKeyA);
	var serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
	console.log("serializeTx: " + serializedTx.toString('hex'));
	console.log('tx hash: '+hash);

	wanchainLog("waiting for ....", '\x1b[31m');

	let receipt = await getTransactionReceipt(web3, hash);
	console.log('receipt: ', receipt);
	wanchainLog('You have finished a transaction with ordinary protection.', '\x1b[32m');
}

module.exports = sendTransaction;