const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const keythereum = require("keythereum");
const Tx = require('wanchain-util').ethereumTx;
const Web3 = require("web3");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');
const sendTransaction = require('../utils/sendTransaction');
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
		A2B(prompt, web3, keythereum, Tx, keystoreStr, wanchainLog);
	} catch (e) {
		wanchainLog('file name invalid (without file format)', config.consoleColor.COLOR_FgRed);
	}
});


function A2B(prompt, web3, keythereum, Tx, keystoreStr, wanchainLog) {
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
							wanchainLog('Input receiver\'s address', config.consoleColor.COLOR_FgGreen);

							prompt.get(require('../utils/schema/ordinaryAddr'), function (err, result) {
								const receiver = result.address;

								wanchainLog('Input value(eth): ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../utils/schema/theValue'), function (err, result) {
									const strSendValueInWei = web3.toWei(result.value);
									const bnSendValueInWei = new web3.BigNumber(strSendValueInWei);
									const value = '0x' + bnSendValueInWei.toString(16);

									sendTransaction(web3, Tx, receiver, address, privKeyA, value, wanchainLog);
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
