let colors = require("colors/safe");

let rechargeORtransSchema = {
	properties: {
		rechargeORtrans: {
			pattern: /^1$|^2$/,
			message: 'consist of numbers and letters.',
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = rechargeORtransSchema;