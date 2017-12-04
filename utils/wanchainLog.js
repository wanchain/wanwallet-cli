
var wanchainLog = function (info, color) {
	if(color){
		console.log(color, info, '\x1b[0m');
	} else {
		console.log(info);
	}
};

module.exports = wanchainLog;
