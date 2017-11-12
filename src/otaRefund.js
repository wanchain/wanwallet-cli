const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const keythereum = require("keythereum");

const config = require('../config');

const wanchainLog = require('../utils/wanchainLog');
const OTA2B = require('../utils/promptFunc/OTA2B');


// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryKeystore'), function (err, result) {
	try {
		let filename = "./keystore/" + result.ordinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");
		OTA2B(prompt, keythereum, keystoreStr);
	} catch (e) {
		wanchainLog('File name invalid (ignore file extension)', config.consoleColor.COLOR_FgRed);
	}
});
