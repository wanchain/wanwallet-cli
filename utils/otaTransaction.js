#!/usr/bin/env node
var fs = require('fs');
const Method = require("web3/lib/web3/method");
const BN = require('bn.js');
const secp256k1 = require('secp256k1');
const Web3 = require("web3");

var config = require('../config');
var wanchainLog = require('./wanchainLog');
let wanUtil = require('wanchain-util');
var ethUtil = wanUtil.ethereumUtil;
var web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

let coinSCDefinition = wanUtil.coinSCAbi;
var contractInstanceAddress = config.contractInstanceAddress;
let fhs_buyCoinNote = ethUtil.sha3('buyCoinNote(string,uint256)', 256).slice(0,4).toString('hex');
let contractCoinSC = web3.eth.contract(coinSCDefinition);
let contractCoinInstance = contractCoinSC.at(contractInstanceAddress);

function getTransactionReceipt(web3, txHash, ota)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				var data = {};
				data[ota] = 'Failed';
				var log = fs.createWriteStream('./utils/otaData/otaDataState.txt', {'flags': 'a'});
				log.end(JSON.stringify(data) + '\n');
				console.log("err: "+err);
			}else{
				let receipt = web3.eth.getTransactionReceipt(txHash);
				blockAfter += 1;
				if(receipt){
					var data = {};
					data[ota] = 'Done';
					var log = fs.createWriteStream('./utils/otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					filter.stopWatching();
					success(receipt);
					return receipt;
				}else if(blockAfter > 6){
					var data = {};
					data[ota] = 'Failed';
					var log = fs.createWriteStream('./utils/otaData/otaDataState.txt', {'flags': 'a'});
					log.end(JSON.stringify(data) + '\n');
					fail("Get receipt timeout");
				}
			}
		});
	});
}



/* set pubkey, w, q */
function generatePubkeyIWQforRing(Pubs, I, w, q){
    let length = Pubs.length;
    let sPubs  = [];
    for(let i=0; i<length; i++){
        sPubs.push(Pubs[i].toString('hex'));
    }
    let ssPubs = sPubs.join('&');
    let ssI = I.toString('hex');
    let sw  = [];
    for(let i=0; i<length; i++){
        sw.push('0x'+w[i].toString('hex').replace(/(^0*)/g,""));
    }
    let ssw = sw.join('&');
    let sq  = [];
    for(let i=0; i<length; i++){
        sq.push('0x'+q[i].toString('hex').replace(/(^0*)/g,""));
    }
    let ssq = sq.join('&');

    let KWQ = [ssPubs,ssI,ssw,ssq].join('+');
    return KWQ;
}
async function otaRefund(web3,ethUtil, Tx,address, privKeyA, otaSk, otaPubK, ringPubKs, value, ota) {
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

    var serial = '0x' + web3.eth.getTransactionCount(address).toString(16);
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
    let receipt = await getTransactionReceipt(web3, hash, ota);
    console.log(receipt);
}

async function testRefund(web3,ethUtil, Tx, ota, value, privKeyA, privKeyB, address) {

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
        let rpkc = new Buffer(otaSet[i].slice(0,66),'hex');
        let rpcu = secp256k1.publicKeyConvert(rpkc, false);
        otaSetBuf.push(rpcu);
    }

    console.log("fetch  ota set: ",otaSet);

    let otaSk = ethUtil.computeWaddrPrivateKey(ota, privKeyA,privKeyB);
    let otaPub = ethUtil.recoverPubkeyFromWaddress(ota);

    await otaRefund(web3, ethUtil, Tx, address, privKeyA, otaSk,otaPub.A,otaSetBuf,value, ota);
}

module.exports = testRefund;
