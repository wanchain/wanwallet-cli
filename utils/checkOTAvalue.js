
function checkOTAvalue(otaAddress, undo) {
	for (let i = 0; i<undo.length; i++) {
		if (otaAddress === undo[i].ota)  {
			return [true, undo[i].value];
		}
	}

	return [false, 0];
}


// let testData = [
// 	{ ota: '03826Ec4332ED0AC01c796f9F92796424fAB137e55CB1EC32bB996A45B5fb0B852033dC46533B51c676a71578Eb067F8436C39Ff035c1513e81421242C45B9604d69',
// 		value: '2000000000000000000',
// 		state: 'Undo' },
// 	{ ota: '036174f0a193a9CaA5A90cFd08800357B7EA742bC379990d4c98184de8F89FD230027bE1A6dc3f97e1FA11Cd5B09Aa0ac48A5E085ED41912007C3193e6DE876FEfAA',
// 	value: '1000000000000000000',
// 	state: 'Done' }];
//
//
// let result = checkOTAvalue('03826Ec4332ED0AC01c796f9F92796424fAB137e55CB1EC32bB996A45B5fb0B852033dC46533B51c676a71578Eb067F8436C39Ff035c1513e81421242C45B9604d69', testData);
// console.log(result);


module.exports = checkOTAvalue;