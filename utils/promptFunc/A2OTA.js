const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const keythereum = require("keythereum");
const Web3 = require("web3");
let coinSCDefinition = wanUtil.coinSCAbi;
const config = require('../../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../wanchainLog');
const checkBalance = require('../promptFunc/checkBanlance');
const preScTransfer = require('../preScTransfer');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

function A2OTA(keystoreStr) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('Your keystore: ', keystore);

	wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../schema/keyPassword'), function (err, result) {
		wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let keyAObj = {version:keystore.version, crypto:keystore.crypto};

		let privKeyA;
		let address;
		let weiToEth;
		try {
			privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			address = keystore.address;
			weiToEth = checkBalance(web3, address);
		} catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
		}

		if (weiToEth === '0') {
			wanchainLog('This address balance is 0 eth, pls recharge first.', config.consoleColor.COLOR_FgRed);
		} else {
			wanchainLog('Your wallet has been unlocked. Would you want to send a transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);

			prompt.get(require('../schema/ordinaryState'), function (err, result) {
				const theState = result.state.toLowerCase();
				switch (theState) {
					case 'y':
						wanchainLog('Input receiver\'s waddress', config.consoleColor.COLOR_FgGreen);

						prompt.get(require('../schema/privacyAddr'), function (err, result) {
							const to_waddress = result.waddress.slice(2);

							wanchainLog('Input value(eth): ', config.consoleColor.COLOR_FgGreen);
							prompt.get(require('../schema/privacyValue'), function (err, result) {

								let contractInstanceAddress = config.contractInstanceAddress;
								let contractCoinSC = web3.eth.contract(coinSCDefinition);
								let contractCoinInstance = contractCoinSC.at(contractInstanceAddress);
								let value = parseInt(result.value) * 10**18;

								preScTransfer(contractInstanceAddress, contractCoinInstance, privKeyA, address, to_waddress, parseInt(value));
							});
						});
						break;

					case 'n':
						wanchainLog('Bye!', config.consoleColor.COLOR_FgGreen);
						break;
				}
			});
		}
	});
}

module.exports = A2OTA;
