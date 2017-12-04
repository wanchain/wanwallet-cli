#!/usr/bin/env node
var fs = require('fs');
const Method = require("web3/lib/web3/method");
const secp256k1 = require('secp256k1');
const Web3 = require("web3");
var config = require('../config');
let wanUtil = require('wanchain-util');
const Tx = wanUtil.wanchainTx;

var web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));


web3.wan = new wanUtil.web3Wan(web3);

const generatePubkeyIWQforRing = require('./generatePubkeyIWQforRing');

let coinSCDefinition = wanUtil.coinSCAbi;
var contractInstanceAddress = config.contractInstanceAddress;
let contractCoinSC = web3.eth.contract(coinSCDefinition);
let contractCoinInstance = contractCoinSC.at(contractInstanceAddress);

function getTransactionReceipt(txHash, ota)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				var data = {};
				data[ota] = 'Failed';
				var log = fs.createWriteStream('../src/otaData/otaDataState.txt', {'flags': 'a'});
				log.end(JSON.stringify(data) + '\n');
				console.log("err: "+err);
				filter.stopWatching();
				fail("Get receipt timeout");
			}else{
				let receipt = web3.eth.getTransactionReceipt(txHash);
				blockAfter += 1;
				if(receipt){
					var data = {};
					data[ota] = 'Done';
					var log = fs.createWriteStream('../src/otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					filter.stopWatching();
					success(receipt);
					return receipt;
				}else if(blockAfter > 6){
					var data = {};
					data[ota] = 'Failed';
					var log = fs.createWriteStream('../src/otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					filter.stopWatching();
					fail("Get receipt timeout");
				}
			}
		});
	});
}



async function otaRefund(address, privKeyA, otaSk, otaPubK, ringPubKs, value, ota) {
    let M = new Buffer(address,'hex');
    let ringArgs = wanUtil.getRingSign(M, otaSk,otaPubK,ringPubKs);
    if(!wanUtil.verifyRinSign(ringArgs)){
        console.log("ring sign is wrong@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        return;
    }
    for(let i=0; i<ringPubKs.length; i++){
        console.log("pubkey ", i, " : ", ringPubKs[i].toString('hex'));
    }
    console.log("I: ", ringArgs.I.toString('hex'));
    for(let i=0; i<ringPubKs.length; i++){
        console.log("w ", i, " : ", ringArgs.w[i].toString('hex'));
    }
    for(let i=0; i<ringPubKs.length; i++){
        console.log("q ", i, " : ", ringArgs.q[i].toString('hex'));
    }
    let KIWQ = generatePubkeyIWQforRing(ringArgs.PubKeys,ringArgs.I, ringArgs.w, ringArgs.q);
    let all = contractCoinInstance.refundCoin.getData(KIWQ,value);

    var serial = '0x' + web3.eth.getTransactionCount('0x' + address).toString(16);
    var rawTx = {
        Txtype: '0x00',
        nonce: serial,
        gasPrice: '0x6fc23ac00',
        gasLimit: '0xf4240',
        to: contractInstanceAddress,//contract address
        value: '0x00',
        data: all
    };
    console.log("payload: " + rawTx.data.toString('hex'));

    var tx = new Tx(rawTx);
    tx.sign(privKeyA);
    var serializedTx = tx.serialize();
    let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
    console.log("serializeTx:" + serializedTx.toString('hex'));
    console.log('tx hash:'+hash);
    let receipt = await getTransactionReceipt(hash, ota);
    console.log(receipt);
}


async function otaTransaction(ota, value, privKeyA, privKeyB, address) {

		var getOTAMixSet = new Method({
			name: 'getOTAMixSet',
			call: 'eth_getOTAMixSet',
			params: 2
		});

		getOTAMixSet.attachToObject(web3.eth);
		getOTAMixSet.setRequestManager(web3.eth._requestManager);

        console.log(ota);
    let otaSet = web3.eth.getOTAMixSet(ota, 3);

    let otaSetBuf = [];

    for(let i=0; i<otaSet.length; i++){
        let rpkc = new Buffer(otaSet[i].slice(2,68),'hex');
        let rpcu = secp256k1.publicKeyConvert(rpkc, false);
        otaSetBuf.push(rpcu);
    }

    console.log("fetch  ota set: ",otaSet);

    let otaSk = wanUtil.computeWaddrPrivateKey(ota, privKeyA,privKeyB);
    let otaPub = wanUtil.recoverPubkeyFromWaddress(ota);

    await otaRefund(address, privKeyA, otaSk,otaPub.A,otaSetBuf,value, ota);
}

module.exports = otaTransaction;
