const getTransactionReceipt = require('../utils/getTransactionReceipt');

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
	// console.log("rawTx:", rawTx);
	var tx = new Tx(rawTx);

	tx.sign(privKeyA);
	var serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
	// console.log("serializeTx: " + serializedTx.toString('hex'));

	wanchainLog("tx hash: " +hash, '\x1b[32m');
	wanchainLog("Waiting for ....", '\x1b[31m');

	let receipt = await getTransactionReceipt(hash);
	console.log('receipt: ', receipt);
	wanchainLog('You have finished a transaction with ordinary protection.', '\x1b[32m');
}

module.exports = sendTransaction;