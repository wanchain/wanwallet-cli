const Web3 = require('web3');
const fs = require("fs");
const Tx = require('wanchain-util').ethereumTx;
const path = require('path');
const solc = require('solc');

const wanchainLog = require('../utils/wanchainLog');
const getTransactionReceipt = require('../utils/getTransactionReceipt');

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

async function tokenInit(address, waddress, privKeyA) {
	let TokenAddress = fs.readFileSync("ERC20.addr","utf8");
	let content = fs.readFileSync(path.join("../sol", "ERC20.sol"), 'utf8');
	let compiled = solc.compile(content, 1);
	let privacyContract = web3.eth.contract(JSON.parse(compiled.contracts[':ERC20'].interface));
	let TokenInstance = privacyContract.at(TokenAddress);

	let mintdata = TokenInstance.initPrivacyAsset.getData(address, waddress.slice(2), "0xf4240");

	let serial = '0x' + web3.eth.getTransactionCount(address).toString(16);
	let rawTx = {
		Txtype: '0x00',
		nonce: serial,
		gasPrice: '0x6fc23ac00',
		gasLimit: '0xf4240',
		to: TokenAddress,
		value: '0x00',
		data: mintdata
	};
	// console.log("payload: " + rawTx.data.toString('hex'));

	let tx = new Tx(rawTx);
	tx.sign(privKeyA);
	let serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
	// console.log("serializeTx:" + serializedTx.toString('hex'));
	console.log('Tx hash:'+hash);
	wanchainLog('Waiting for a moment...', config.consoleColor.COLOR_FgRed);

	let receipt = await getTransactionReceipt(hash);
	console.log(receipt);
	console.log("Token balance of ",address, " is ", TokenInstance.otabalanceOf(address).toString(), "key is ", TokenInstance.otaKey(address));
}


module.exports = tokenInit;
