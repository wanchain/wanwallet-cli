const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const keythereum = require("keythereum");
const Tx = require('wanchain-util').ethereumTx;
const Web3 = require("web3");
const ethUtil = require('wanchain-util').ethereumUtil;
let coinSCDefinition = wanUtil.coinSCAbi;
const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');
const checkBalance = require('../utils/promptFunc/checkBanlance');

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
		A2OTA(keystoreStr);
	} catch (e) {
		wanchainLog('file name invalid (without file format)', config.consoleColor.COLOR_FgRed);
	}
});

function A2OTA(keystoreStr) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let keyAObj = {version:keystore.version, crypto:keystore.crypto};

		try {
			const privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			const address = keystore.address;

			const weiToEth = checkBalance(web3, address);

			if (weiToEth === '0') {
				wanchainLog('the address balance is 0 eth, pls recharge first.', config.consoleColor.COLOR_FgRed);
			} else {
				wanchainLog('Your wallet has been unlocked. Would you want to send a transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);

				prompt.get(require('../utils/schema/isTransaction'), function (err, result) {
					const theState = result.state.toLowerCase();
					switch (theState) {
						case 'y':
							wanchainLog('Input receiver\'s waddress', config.consoleColor.COLOR_FgGreen);

							prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
								const to_waddress = result.waddress.slice(2);

								wanchainLog('Input value(eth): ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../utils/schema/theValue'), function (err, result) {

									let contractInstanceAddress = config.contractInstanceAddress;
									let contractCoinSC = web3.eth.contract(coinSCDefinition);
									let contractCoinInstance = contractCoinSC.at(contractInstanceAddress);
									let value = parseInt(result.value) * 10**18;

									preScTransfer(contractInstanceAddress, contractCoinInstance, privKeyA, address, to_waddress,  parseInt(value));
								});
							});
							break;

						case 'n':
							wanchainLog('Bye!', config.consoleColor.COLOR_FgGreen);
							break;
					}
				});
			}
		} catch (e) {
			wanchainLog('password invalid', config.consoleColor.COLOR_FgRed);
		}
	});
}


function getTransactionReceipt(txHash)
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

async function preScTransfer(contractInstanceAddress, contractCoinInstance, privateKey, myAddr, to_waddress,  value){

	var otaDestAddress = ethUtil.generateOTAWaddress(to_waddress).toLowerCase();
	console.log('otaDestAddress: ', otaDestAddress);
	let payload = contractCoinInstance.buyCoinNote.getData(otaDestAddress, value);
	var serial = '0x' + web3.eth.getTransactionCount(myAddr).toString(16);
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

	let receipt = await getTransactionReceipt(hash);
	wanchainLog('receipt: ' + JSON.stringify(receipt), config.consoleColor.COLOR_FgGreen);

	let data = {waddress: '0x' + to_waddress, ota: otaDestAddress.split('x')[1], value: value, state: 'Undo'};
	console.log('value: ', value);
	console.log('otaDestAddress: ', otaDestAddress);

	let log = fs.createWriteStream('./otaData/otaData.txt', {'flags': 'a'});
	log.end(JSON.stringify(data) + '\n');

	wanchainLog('receipt: ' + JSON.stringify(receipt), config.consoleColor.COLOR_FgGreen);

	wanchainLog('You have finished a transaction with privacy protection.You could check receiver\'s OTA balance by node otabalance.', config.consoleColor.COLOR_FgYellow);
}

