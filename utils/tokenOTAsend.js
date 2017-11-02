const fs = require('fs');
const Web3 = require("web3");
const secp256k1 = require('secp256k1');
const wanUtil = require('wanchain-util');
const ethUtil = wanUtil.ethereumUtil;
const Tx = wanUtil.ethereumTx;

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
const wanchainLog = require('./wanchainLog');
const generatePubkeyIWQforRing = require('./generatePubkeyIWQforRing');

web3.wan = new wanUtil.web3Wan(web3);


async function  tokenOTAsend(TokenAddress, TokenInstance, token_to_ota_addr, token_to_ota, stamp, stampHoderKeystore, tokenHoderKeystore, value, myAddr, receiver_addr) {
	let cxtInterfaceCallData = TokenInstance.otatransfer.getData(token_to_ota_addr, token_to_ota, value);

	let otaSet = web3.wan.getOTAMixSet(stamp, 3);
	let otaSetBuf = [];
	for(let i=0; i<otaSet.length; i++){
		let rpkc = new Buffer(otaSet[i].slice(0,66),'hex');
		let rpcu = secp256k1.publicKeyConvert(rpkc, false);
		otaSetBuf.push(rpcu);
	}

	// console.log("fetch  ota stamp set: ",otaSet);
	let otaSk = ethUtil.computeWaddrPrivateKey(stamp, stampHoderKeystore.privKeyA,stampHoderKeystore.privKeyB);
	let otaPub = ethUtil.recoverPubkeyFromWaddress(stamp);

	let ringArgs = ethUtil.getRingSign(new Buffer(tokenHoderKeystore.address.slice(2),'hex'), otaSk,otaPub.A,otaSetBuf);
	if(!ethUtil.verifyRinSign(ringArgs)){
		console.log("ring sign is wrong@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
		return;
	}
	let KIWQ = generatePubkeyIWQforRing(ringArgs.PubKeys,ringArgs.I, ringArgs.w, ringArgs.q);
	let glueContractDef = web3.eth.contract([{"constant":false,"type":"function","inputs":[{"name":"RingSignedData","type":"string"},{"name":"CxtCallParams","type":"bytes"}],"name":"combine","outputs":[{"name":"RingSignedData","type":"string"},{"name":"CxtCallParams","type":"bytes"}]}]);
	let glueContract = glueContractDef.at("0x0000000000000000000000000000000000000000");
	let combinedData = glueContract.combine.getData(KIWQ, cxtInterfaceCallData);
	//let all = TokenInstance.
	var serial = '0x' + web3.eth.getTransactionCount(tokenHoderKeystore.address).toString(16);
	var rawTx = {
		Txtype: '0x06',
		nonce: serial,
		gasPrice: '0x6fc23ac00',
		gasLimit: '0xf4240',
		to: TokenAddress,
		value: '0x00',
		data: combinedData
	};
	// console.log("payload: " + rawTx.data.toString('hex'));

	var tx = new Tx(rawTx);
	tx.sign(tokenHoderKeystore.privKeyA);
	var serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
	// console.log("serializeTx:" + serializedTx.toString('hex'));
	console.log('tx hash:'+hash);
	wanchainLog("Waiting for a moment...", config.consoleColor.COLOR_FgRed);
	let receipt = await getTransactionReceipt(hash, stamp, token_to_ota_addr, tokenHoderKeystore.address, myAddr, receiver_addr, TokenInstance);
	console.log(receipt);
	console.log("Token balance of ",token_to_ota_addr, " is ", TokenInstance.otabalanceOf(token_to_ota_addr).toString(), "key is ", TokenInstance.otaKey(token_to_ota_addr));

}


function getTransactionReceipt(txHash, address, token_to_ota_addr, token_to_addr, myAddr, receiver_addr, TokenInstance)
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
					let data = {};
					data[address] = 'Done';
					let log = fs.createWriteStream('../src/otaData/stampDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');

					let tokenLog = fs.createWriteStream('../src/otaData/tokenOTAdata.txt', {'flags': 'a'});
					tokenLog.end(JSON.stringify(token_to_addr) + '\n');

					let tokenData = {sender: myAddr, receiver: receiver_addr, otaAddr: token_to_ota_addr, balance: TokenInstance.otabalanceOf(token_to_ota_addr).toString()};
					let tokenOtaLog = fs.createWriteStream('../src/otaData/tokenData.txt', {'flags': 'a'});
					tokenOtaLog.end(JSON.stringify(tokenData) + '\n');

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

module.exports = tokenOTAsend;