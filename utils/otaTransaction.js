#!/usr/bin/env node
const fs = require('fs');
const Method = require("web3/lib/web3/method");
const secp256k1 = require('secp256k1');
const Web3 = require("web3");
const config = require('../config');
const wanUtil = require('wanchain-util');
const ethUtil = wanUtil.ethereumUtil;
const Tx = wanUtil.ethereumTx;

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));


web3.wan = new wanUtil.web3Wan(web3);

const generatePubkeyIWQforRing = require('./generatePubkeyIWQforRing');

const coinSCDefinition = wanUtil.coinSCAbi;
const contractInstanceAddress = config.contractInstanceAddress;
const contractCoinSC = web3.eth.contract(coinSCDefinition);
const contractCoinInstance = contractCoinSC.at(contractInstanceAddress);

function getTransactionReceipt(txHash, ota)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				let data = {};
				data[ota] = 'Failed';
				let log = fs.createWriteStream('../src/otaData/otaDataState.txt', {'flags': 'a'});
				log.end(JSON.stringify(data) + '\n');
				console.log("err: "+err);
				filter.stopWatching();
				fail("Get receipt timeout");
			}else{
				let receipt = web3.eth.getTransactionReceipt(txHash);
				blockAfter += 1;
				if(receipt){
					let data = {};
					data[ota] = 'Done';
					let log = fs.createWriteStream('../src/otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					filter.stopWatching();
					success(receipt);
					return receipt;
				}else if(blockAfter > 6){
					let data = {};
					data[ota] = 'Failed';
					let log = fs.createWriteStream('../src/otaData/otaDataState.txt', {'flags': 'a'});
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
    let ringArgs = ethUtil.getRingSign(M, otaSk,otaPubK,ringPubKs);
    if(!ethUtil.verifyRinSign(ringArgs)){
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
    console.log("payload: " + rawTx.data.toString('hex'));

    let tx = new Tx(rawTx);
    tx.sign(privKeyA);
    let serializedTx = tx.serialize();
    let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
    console.log("serializeTx:" + serializedTx.toString('hex'));
    console.log('tx hash:'+hash);
    let receipt = await getTransactionReceipt(hash, ota);
    console.log(receipt);
}


async function otaTransaction(ota, value, privKeyA, privKeyB, address) {

		let getOTAMixSet = new Method({
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
        let rpkc = new Buffer(otaSet[i].slice(0,66),'hex');
        let rpcu = secp256k1.publicKeyConvert(rpkc, false);
        otaSetBuf.push(rpcu);
    }

    console.log("fetch  ota set: ",otaSet);

    let otaSk = ethUtil.computeWaddrPrivateKey(ota, privKeyA,privKeyB);
    let otaPub = ethUtil.recoverPubkeyFromWaddress(ota);

    await otaRefund(address, privKeyA, otaSk,otaPub.A,otaSetBuf,value, ota);
}

module.exports = otaTransaction;
