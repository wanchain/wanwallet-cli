var fs = require('fs');

function stamp2json(otaData, otaDataState) {
	var resultUndo = [];
	var resultTotal = [];

	try {

		if (otaDataState) {
			var statTuple = [];

			var otaDict = [];
			for (var i =0; i<otaDataState.length; i++) {
				if(otaDataState[i].trim().length >0) {
					var otaState = otaDataState[i].split('{')[1].split(':')[0].split('"')[1];
					statTuple.push(otaState);
					otaDict.push(otaDataState[i].split('{')[1].split('}')[0]);
				}
			}

			var otaDictStr = '{';
			for (var i =0; i< otaDict.length; i++) {
				otaDictStr += otaDict[i];
				if (i !== otaDict.length -1) {
					otaDictStr += ',';
				}
			}

			otaDictStr += '}';

			otaDictStr = JSON.parse(otaDictStr);

			for (var i = 0; i<otaData.length; i++) {
				var index = i +1;
				if (otaData[i].trim().length >0) {
					var otaDataJson = JSON.parse(otaData[i]);

					var data = {};
					if (statTuple.indexOf(otaDataJson.stamp) === -1) {
						data.address = otaDataJson.address;
						data.value = otaDataJson.value;
						data.state = otaDataJson.state;
						data.stamp = otaDataJson.stamp;
						resultTotal.push(data);
						resultUndo.push(data);

						// console.log('Your otaData ' + index + ' >> '  + ' ota: ' + otaDataJson.ota + ' value: ' + otaDataJson.value + ' state: ' + otaDataJson.state);
					} else {
						data.address = otaDataJson.address;
						data.value = otaDataJson.value;
						data.state = otaDictStr[otaDataJson.stamp];
						data.stamp = otaDataJson.stamp;
						resultTotal.push(data);

						// console.log('Your otaData ' + index + ' >> '  + ' ota: ' + otaDataJson.ota + ' value: ' + otaDataJson.value + ' state: ' + otaDictStr[otaDataJson.ota]);
					}
				}
			}
		} else {
			for (var i = 0; i<otaData.length; i++) {
				var index = i +1;
				if (otaData[i].trim().length >0) {
					var otaDataJson = JSON.parse(otaData[i]);

					var data = {};

					data.address = otaDataJson.address;
					data.value = otaDataJson.value;
					data.state = otaDataJson.state;
					data.stamp = otaDataJson.stamp;
					resultTotal.push(data);
					resultUndo.push(data);
				}
			}
		}

	} catch (e) {
		console.log('Not have stampData.');
	}

	return [resultUndo, resultTotal];
}


// let otaDataStr = fs.readFileSync("../functions/otaData/stampData.txt","utf8");
// let otaData = otaDataStr.split('\n');
//
// let otaDataStateStr = fs.readFileSync("../functions/otaData/stampDataState.txt","utf8");
// let otaDataState = otaDataStateStr.split('\n');
//
// var undo = txt2json(otaData, otaDataState)[0];
// var total = txt2json(otaData, otaDataState)[1];
//
// console.log(undo);
// console.log('ddddddddddd');
// console.log(total);

module.exports = stamp2json;