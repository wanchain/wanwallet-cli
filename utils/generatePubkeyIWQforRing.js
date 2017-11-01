function generatePubkeyIWQforRing(Pubs, I, w, q){
	let length = Pubs.length;
	let sPubs  = [];
	for(let i=0; i<length; i++){
		sPubs.push(Pubs[i].toString('hex'));
	}
	let ssPubs = sPubs.join('&');
	let ssI = I.toString('hex');
	let sw  = [];
	for(let i=0; i<length; i++){
		sw.push('0x'+w[i].toString('hex').replace(/(^0*)/g,""));
	}
	let ssw = sw.join('&');
	let sq  = [];
	for(let i=0; i<length; i++){
		sq.push('0x'+q[i].toString('hex').replace(/(^0*)/g,""));
	}
	let ssq = sq.join('&');

	let KWQ = [ssPubs,ssI,ssw,ssq].join('+');
	return KWQ;
}

module.exports = generatePubkeyIWQforRing;
