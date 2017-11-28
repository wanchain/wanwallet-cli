const fs = require('fs');
const wanUtil = require('wanchain-util');
const Tx = require('wanchain-util').ethereumTx;
const Web3 = require("web3");
const ethUtil = require('wanchain-util').ethereumUtil;
const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('./wanchainLog');
const getTransactionReceipt = require('../utils/getTransactionReceipt');

web3.wan = new wanUtil.web3Wan(web3);

async function preScTransfer(contractInstanceAddress, contractCoinInstance, privateKey, myAddr, to_waddress, value){

	let otaDestAddress = ethUtil.generateOTAWaddress(to_waddress).toLowerCase();
	console.log('otaDestAddress: ', otaDestAddress);
	let payload = contractCoinInstance.buyCoinNote.getData(otaDestAddress, value);
	let serial = '0x' + web3.eth.getTransactionCount(myAddr).toString(16);
	let rawTx = {
		Txtype: '0x0',
		nonce: serial,
		gasPrice: '0x6fc23ac00',
		gasLimit: '0xf4240',
		to: contractInstanceAddress,//contract address
		value: value,
		data: payload
	};
	console.log("payload: " + rawTx.data);

	let tx = new Tx(rawTx);
	tx.sign(privateKey);
	let serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));

	// wanchainLog('serializeTx: ' + serializedTx.toString('hex'), config.consoleColor.COLOR_FgGreen);
	wanchainLog('tx hash: ' + hash, config.consoleColor.COLOR_FgRed);
	wanchainLog('Waiting for a moment...', config.consoleColor.COLOR_FgRed);

	let receipt = await getTransactionReceipt(hash);
	wanchainLog('receipt: ' + JSON.stringify(receipt), config.consoleColor.COLOR_FgGreen);

	let data = {waddress: '0x' + to_waddress, ota: otaDestAddress.split('x')[1], value: value, state: 'Undo'};
	console.log('value: ', value);
	console.log('otaDestAddress: ', otaDestAddress);

	let log = fs.createWriteStream('../src/otaData/otaData.txt', {'flags': 'a'});
	log.end(JSON.stringify(data) + '\n');

	wanchainLog('You have finished a transaction with privacy protection.You could check receiver\'s OTA balance by node otabalance.', config.consoleColor.COLOR_FgYellow);
}


module.exports = preScTransfer;
