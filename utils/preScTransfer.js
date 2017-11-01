var fs = require('fs');
var config = require('../config');
let wanUtil = require('wanchain-util');

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

async function preScTransfer(web3, Tx, ethUtil, fromsk,fromaddress, toWaddr, contractInstanceAddress, value, inputValue, wanchainLog){
	var otaDestAddress = ethUtil.generateOTAWaddress(toWaddr);

	//let payload = ethUtil.getDataForSendWanCoin(otaDestAddress);
	let coinSCDefinition = wanUtil.coinSCAbi;
	var contractInstanceAddress = config.contractInstanceAddress;
	let contractCoinSC = web3.eth.contract(coinSCDefinition);
	let contractCoinInstance = contractCoinSC.at(contractInstanceAddress);
	let payload = contractCoinInstance.buyCoinNote.getData(otaDestAddress, value);
	console.log("otaDestAddress: ",otaDestAddress);
	var privateKey = new Buffer(fromsk, 'hex');//from.so_privatekey
	var serial = '0x' + web3.eth.getTransactionCount(fromaddress).toString(16);
	var rawTx = {
		Txtype: '0x0',
		nonce: serial,
        gasPrice: '0x6fc23ac00',
        gasLimit: '0xf4240',
		to: contractInstanceAddress,//contract address
		value: value,
		data: payload
	};
	console.log("payload: " + rawTx.data);

	var tx = new Tx(rawTx);
	tx.sign(privateKey);
	var serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));

	wanchainLog('serializeTx: ' + serializedTx.toString('hex'), config.consoleColor.COLOR_FgGreen);
	wanchainLog('tx hash: ' + hash, config.consoleColor.COLOR_FgRed);

	wanchainLog('waiting for... ', config.consoleColor.COLOR_FgGreen);

	let receipt = await getTransactionReceipt(web3, hash);

	value = inputValue * 10 ** 18;
	var data = {ota: otaDestAddress.split('x')[1], value: value.toString(), state: 'Undo'};
	console.log('value: ', inputValue * 10**18);
	console.log('otaDestAddress: ', otaDestAddress);

	var log = fs.createWriteStream('./utils/otaData/otaData.txt', {'flags': 'a'});
	log.end(JSON.stringify(data) + '\n');

	wanchainLog('receipt: ' + JSON.stringify(receipt), config.consoleColor.COLOR_FgGreen);

	wanchainLog('You had finish a privacy transaction, go to listenOTA get "ota" and "value" then run wanWalletTest.js and choice 3(OTA Transaction) ', config.consoleColor.COLOR_FgGreen);
}

module.exports = preScTransfer;
