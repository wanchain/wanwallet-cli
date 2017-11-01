
const fs = require('fs');
const path = require('path');
const Web3 = require("web3");
const solc = require('solc');
const keythereum = require("keythereum");

const wanUtil = require('wanchain-util');
const ethUtil = wanUtil.ethereumUtil;
const Tx = wanUtil.ethereumTx;
const prompt = require('prompt');
const colors = require("colors/safe");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
const wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);

let preStampAddress = config.contractStampAddress;
let contractStampSC = web3.eth.contract(wanUtil.stampSCAbi);
let contractStampInstance = contractStampSC.at(preStampAddress);

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green("$");

wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/mykeystore'), function (err, result) {
	try {
		let filename = "./keystore/" + result.OrdinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");

		let keystore = JSON.parse(keystoreStr)[1];
		keystore.address = keystore.address.slice(2);
		keystore.waddress = keystore.waddress.slice(2);
		console.log('you keystore: ', keystore);

		wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
		prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
			wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

			let keyAObj = {version:keystore.version, crypto:keystore.crypto};

			try {
				const privKeyA = keythereum.recover(result.keyPassword, keyAObj);
				const address = '0x' + keystore.address;
				const waddress = keystore.waddress;
				const value = 10000000000000000;

				buyStamp(privKeyA, address, waddress, value);

			} catch (e) {
				wanchainLog('password invalid', config.consoleColor.COLOR_FgRed);
			}
		});
	} catch (e) {
		wanchainLog('file name invalid (without file format)', config.consoleColor.COLOR_FgRed);
	}
});


async function buyStamp(privateKey,fromaddress, toWaddr, value){
	var stamp = ethUtil.generateOTAWaddress(toWaddr).toLowerCase();
	let payload = contractStampInstance.buyStamp.getData(stamp, value);
	var serial = '0x' + web3.eth.getTransactionCount(fromaddress).toString(16);
	console.log('serial: ', serial);
	var rawTx = {
		Txtype: '0x0',
		nonce: serial,
		gasPrice: '0x6fc23ac00',
		gasLimit: '0xf4240',
		to: preStampAddress,//contract address
		value: value,
		data: payload
	};
	console.log("payload: " + rawTx.data);
	console.log("tx: ",rawTx);
	var tx = new Tx(rawTx);
	tx.sign(privateKey);
	var serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));

	wanchainLog('serializeTx: ' + serializedTx.toString('hex'), config.consoleColor.COLOR_FgGreen);
	wanchainLog('tx hash: ' + hash, config.consoleColor.COLOR_FgRed);
	wanchainLog('Waiting for a moment...', config.consoleColor.COLOR_FgRed);

	let receipt = await getTransactionReceipt(hash);

	let data = {address: fromaddress.slice(2), stamp: stamp, value: value, state: 'Undo'};
	let log = fs.createWriteStream('./otaData/stampData.txt', {'flags': 'a'});
	log.end(JSON.stringify(data) + '\n');

	wanchainLog('receipt: ' + JSON.stringify(receipt), config.consoleColor.COLOR_FgGreen);
	console.log("you have got a stamp, address and value are: ",stamp, web3.wan.getOTABalance(stamp));

}

function getTransactionReceipt(txHash)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				console.log("err:"+err);
				fail("err:"+err);
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
