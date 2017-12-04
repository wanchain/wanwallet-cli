
function otaDataStateFunc(otaDataStateStr) {

	let otaDataState = otaDataStateStr.split('\n');

	const statTuple = [];

	const otaDict = [];
	for (let i =0; i<otaDataState.length; i++) {
		if(otaDataState[i].trim().length >0) {
			const otaState = otaDataState[i].split('{')[1].split(':')[0].split('"')[1];
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

	return [JSON.parse(otaDictStr), statTuple];
}

module.exports = otaDataStateFunc;
