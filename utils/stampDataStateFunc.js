function stampDataStateFunc(stampDataStateStr) {

	let stampDataState = stampDataStateStr.split('\n');

	const statTuple = [];

	const otaDict = [];
	for (let i =0; i<stampDataState.length; i++) {
		if(stampDataState[i].trim().length >0) {
			const otaState = stampDataState[i].split('{')[1].split(':')[0].split('"')[1];
			statTuple.push(otaState);
			otaDict.push(stampDataState[i].split('{')[1].split('}')[0]);
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

	return [otaDictStr, statTuple]
}

module.exports = stampDataStateFunc;