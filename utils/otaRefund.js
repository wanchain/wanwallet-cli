#!/usr/bin/env node
var fs = require('fs');
const secp256k1 = require('secp256k1');
const Web3 = require("web3");
const ethUtil = require('wanchain-util').ethereumUtil;
const Tx = require('wanchain-util').ethereumTx;

var config = require('../config');
var wanchainLog = require('./wanchainLog');
let wanUtil = require('wanchain-util');
var generatePubkeyIWQforRing = require('./generatePubkeyIWQforRing');

var web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

web3.wan = new wanUtil.web3Wan(web3);

let coinSCDefinition = wanUtil.coinSCAbi;


function getTransactionReceipt(txHash, ota)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				let data = {};
				data[ota] = 'Failed';
				let log = fs.createWriteStream('./otaData/otaDataState.txt', {'flags': 'a'});
				log.end(JSON.stringify(data) + '\n');
				console.log("err: "+err);
			}else{
				let receipt = web3.eth.getTransactionReceipt(txHash);
				blockAfter += 1;
				if(receipt){
					let data = {};
					data[ota] = 'Done';
					let log = fs.createWriteStream('./otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					filter.stopWatching();
					success(receipt);
					return receipt;
				}else if(blockAfter > 6){
					let data = {};
					data[ota] = 'Failed';
					let log = fs.createWriteStream('./otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					fail("Get receipt timeout");
				}
			}
		});
	});
}

async function otaRefund(contractInstanceAddress, contractCoinInstance, address, privKeyA, otaSk, otaPubK, ringPubKs, value, ota) {
    let M = new Buffer(address,'hex');
    let ringArgs = ethUtil.getRingSign(M, otaSk,otaPubK,ringPubKs);
    if(!ethUtil.verifyRinSign(ringArgs)){
	      wanchainLog('ring sign is wrong@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', config.consoleColor.COLOR_FgRed);
        return;
    }

    let KIWQ = generatePubkeyIWQforRing(ringArgs.PubKeys,ringArgs.I, ringArgs.w, ringArgs.q);
    let all = contractCoinInstance.refundCoin.getData(KIWQ,parseInt(value));

		let serial = '0x' + web3.eth.getTransactionCount('0x' + address).toString(16);
		let rawTx = {
        Txtype: '0x00',
        nonce: serial,
        gasPrice: '0x6fc23ac00',
        gasLimit: '0xf4240',
        to: contractInstanceAddress,//contract address
        value: '0x00',
        data: all
    };
    // console.log("payload: " + rawTx.data.toString('hex'));

		let tx = new Tx(rawTx);
    tx.sign(privKeyA);
		let serializedTx = tx.serialize();
    let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
    // console.log("serializeTx:" + serializedTx.toString('hex'));
    console.log('tx hash: '+hash);
		wanchainLog('waiting for a moment... ', config.consoleColor.COLOR_FgRed);
    let receipt = await getTransactionReceipt(hash, ota);
    wanchainLog(receipt, config.consoleColor.COLOR_FgGreen);
}

async function main(ota, value, privKeyA, privKeyB, address) {
	// let ota = "0299010889b1013a1b02243a7b348a6c917c03cb75fbbb691762d074d479d508c60224e0cdec20d1cb0e00ca5bac42eb4f9f54f05c6aba4af191526b4eaba776628b";
	// let value = config.refundValue;
	let otaSet = web3.wan.getOTAMixSet(ota, 3);
	let otaSetBuf = [];
	for(let i=0; i<otaSet.length; i++){
		let rpkc = new Buffer(otaSet[i].slice(0,66),'hex');
		let rpcu = secp256k1.publicKeyConvert(rpkc, false);
		otaSetBuf.push(rpcu);
	}

	console.log("fetch  ota set: ",otaSet);

	var contractInstanceAddress = config.contractInstanceAddress;
	let contractCoinSC = web3.eth.contract(coinSCDefinition);
	let contractCoinInstance = contractCoinSC.at(contractInstanceAddress);

	let otaSk = ethUtil.computeWaddrPrivateKey(ota, privKeyA,privKeyB);
	let otaPub = ethUtil.recoverPubkeyFromWaddress(ota);

	await otaRefund(contractInstanceAddress, contractCoinInstance,address,privKeyA, otaSk,otaPub.A,otaSetBuf,value, ota);
	console.log("New balance of",address," is: ",web3.eth.getBalance(address).toString());

}

module.exports = main;
