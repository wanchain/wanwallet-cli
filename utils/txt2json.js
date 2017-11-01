var fs = require('fs');

function txt2json(otaData, otaDataState) {
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
					if (statTuple.indexOf(otaDataJson.ota) === -1) {
						data.ota = otaDataJson.ota;
						data.value = otaDataJson.value;
						data.state = otaDataJson.state;
						resultTotal.push(data);
						resultUndo.push(data);

						// console.log('Your otaData ' + index + ' >> '  + ' ota: ' + otaDataJson.ota + ' value: ' + otaDataJson.value + ' state: ' + otaDataJson.state);
					} else {
						data.ota = otaDataJson.ota;
						data.value = otaDataJson.value;
						data.state = otaDictStr[otaDataJson.ota];
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

					data.ota = otaDataJson.ota;
					data.value = otaDataJson.value;
					data.state = otaDataJson.state;
					resultTotal.push(data);
					resultUndo.push(data);
				}
			}
		}

	} catch (e) {
		console.log('Not have otaData.');
	}

	console.log('resultUndo: ', resultUndo);
	console.log('resultTotal: ', resultTotal);

	return [resultUndo, resultTotal];
}


// let otaDataStr = fs.readFileSync("./otaData.txt","utf8");
// let otaData = otaDataStr.split('\n');
//
// let otaDataStateStr = fs.readFileSync("./otaDataState.txt","utf8");
// let otaDataState = otaDataStateStr.split('\n');
//
// var undo = txt2json(otaData, otaDataState)[0];
// var total = txt2json(otaData, otaDataState)[1];
//
// console.log(undo);
// console.log('ddddddddddd');
// console.log(total);

module.exports = txt2json;