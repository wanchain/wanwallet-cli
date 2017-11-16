
function tokenTransfer(data) {
	let token = data.token;

	let otaList =[];
	let result = [];
	if(data.hasOwnProperty('ota')) {
		let ota = data.ota;


		for(let i=0; i<ota.length; i++) {
			otaList.push(ota[i].split('"')[1])
		}

		for (let j=0; j<token.length;j++) {

			if (token[j].length >0) {
				if (otaList.indexOf(JSON.parse(token[j]).otaAddr) <0) {
					result.push(JSON.parse(token[j]))
				}
			}
		}
	} else {
		for (let k=0; k<token.length;k++) {

			if (token[k].length >0) {
				result.push(JSON.parse(token[k]))
			}
		}
	}


	return result;
}


// let tokens = [
// 	'{"address":"0x3ee02ac99ad1e1f346d0ff0acb6d8c1d3e8a3624","otaAddr":"0x35ef402ba9ccb89f7e3871dd79260be6701bb8c","balance":"989"}',
// 	'{"address":"0xf945b58ca5378f374457877993f6c02b7ee48aa5","otaAddr":"0x5855d898bbc022ce38b7c3d57d084b3e6206b418","balance":"989"}',
// 	'{"address":"0x3ee02ac99ad1e1f346d0ff0acb6d8c1d3e8a3624","otaAddr":"0x4504890c700feef62f5e70374223981bcac56057","balance":"789"}',
// 	'{"address":"0xf945b58ca5378f374457877993f6c02b7ee48aa5","otaAddr":"0x650342b4873a370f8d968a1d102ba04e507e19ba","balance":"789"}'
// ];
// let data = {token: tokens};
//
// console.log(tokenTransfer(data));
//
//
// let token = [
// 	'{"address":"0x3ee02ac99ad1e1f346d0ff0acb6d8c1d3e8a3624","otaAddr":"0x35ef402ba9ccb89f7e3871dd79260be6701bb8c","balance":"989"}',
// 	'{"address":"0xf945b58ca5378f374457877993f6c02b7ee48aa5","otaAddr":"0x5855d898bbc022ce38b7c3d57d084b3e6206b418","balance":"989"}',
// 	'{"address":"0x3ee02ac99ad1e1f346d0ff0acb6d8c1d3e8a3624","otaAddr":"0x4504890c700feef62f5e70374223981bcac56057","balance":"789"}',
// 	'{"address":"0xf945b58ca5378f374457877993f6c02b7ee48aa5","otaAddr":"0x650342b4873a370f8d968a1d102ba04e507e19ba","balance":"789"}'
// ];
//
// let ota = [ '{"address":"0x35ef402bab9ccb89f7e3871dd79260be6701bb8c","state":"Done"}',
// 	'{"address":"0x5855d898bbc022ce38b7c3d57d084b3e6206b418","state":"Done"}',
// 	'{"address":"0x4504890c700feef62f5e70374223981bcac56057","state":"Done"}',
// 	'{"address":"0x650342b4873a370f8d968a1d102ba04e507e19ba","state":"Done"}',
// 	'' ]
//
// let data2 = {ota: ota, token: token};
//
// console.log(tokenTransfer(data2));

module.exports = tokenTransfer;
