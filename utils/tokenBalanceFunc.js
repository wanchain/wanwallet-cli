
function tokenTransfer(data) {
	let token = data.token;
	let address = data.address;

	let otaList =[];
	let result = [];
	if(data.hasOwnProperty('ota')) {
		let ota = data.ota;


		for(var i=0; i<ota.length -1; i++) {
			otaList.push(ota[i].split('"')[1])
		}

		for (var j=0; j<token.length;j++) {

			if (token[j].length >0) {
				let tokenJson = JSON.parse(token[j]);
				if(address === tokenJson.receiver) {
					if (otaList.indexOf(tokenJson.otaAddr) <0) {
						result.push(tokenJson)
					}
				}
			}
		}
	} else {
		for (var k=0; k<token.length;k++) {

			if (token[k].length >0) {
				if(address === token[k].receiver) {
					result.push(JSON.parse(token[k]))
				}
			}
		}
	}

	return result;
}

module.exports = tokenTransfer;
