const Web3 = require("web3");
const config = require('../config');
const prompt = require('prompt');
const optimist = require('optimist')
    .string('ordinaryTx');
const colors = require("colors/safe");
const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
const wanchainLog = require('../utils/wanchainLog');


prompt.start();
prompt.override = optimist.argv;
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");


wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryTx'), function (err, result) {
    let txHash = result.ordinaryTx;
    let filter = web3.eth.filter('latest');
    let blockAfter = 0;
    filter.watch(function (err, blockhash) {
        if (err) {
            filter.stopWatching();
            console.log("err:" + err);
        } else {
            let receipt = web3.eth.getTransactionReceipt(txHash);
            blockAfter += 1;
            if (receipt) {
                filter.stopWatching();
                console.log("Confirmed");
            } else if (blockAfter > 6) {
                filter.stopWatching();
                console.log("Failed");
            }
        }
    });
});