function stamp2json(otaData, otaDataState) {
	let resultUndo = [];
	let resultTotal = [];

	let data = {};

	if (otaDataState) {
		let statTuple = [];

		let otaDict = [];
		for (let i =0; i<otaDataState.length; i++) {
			if(otaDataState[i].trim().length >0) {
				let otaState = otaDataState[i].split('{')[1].split(':')[0].split('"')[1];
				statTuple.push(otaState);
				otaDict.push(otaDataState[i].split('{')[1].split('}')[0]);
			}
		}


		let otaDictStr = '{';
		for (let i =0; i< otaDict.length; i++) {
			otaDictStr += otaDict[i];
			if (i !== otaDict.length -1) {
				otaDictStr += ',';
			}
		}

		otaDictStr += '}';

		otaDictStr = JSON.parse(otaDictStr);

		for (let i = 0; i<otaData.length; i++) {
			let otaDataJson = JSON.parse(otaData[i]);

			if (statTuple.indexOf(otaDataJson.stamp) === -1) {
				data.address = otaDataJson.address;
				data.value = otaDataJson.value;
				data.state = otaDataJson.state;
				data.stamp = otaDataJson.stamp;
				resultTotal.push(data);
				resultUndo.push(data);

			} else {
				data.address = otaDataJson.address;
				data.value = otaDataJson.value;
				data.state = otaDictStr[otaDataJson.stamp];
				data.stamp = otaDataJson.stamp;
				resultTotal.push(data);
			}
		}
	} else {
		resultUndo = otaData;
		resultTotal = otaData;
	}

	return [resultUndo, resultTotal];
}


// let otaDataStr = fs.readFileSync("../src/otaData/stampData.txt","utf8");
// let otaData = otaDataStr.split('\n');
// let address = 'f945b58ca5378f374457877993f6c02b7ee48aa5';
//
// let stampData = [];
// for (let i=0; i<otaData.length; i++) {
// 	if (otaData[i].length >0) {
// 		if(JSON.parse(otaData[i]).address === address) {
// 			stampData.push(JSON.parse(otaData[i]))
// 		}
// 	}
// }
//
// let otaDataStateStr = fs.readFileSync("../src/otaData/stampDataState.txt","utf8");
// let otaDataState = otaDataStateStr.split('\n');
//
// let undo = stamp2json(stampData, otaDataState)[0];
//
// console.log(undo);


module.exports = stamp2json;