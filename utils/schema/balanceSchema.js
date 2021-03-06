var colors = require("colors/safe");

var balanceSchema = {
	properties: {
		balance: {
			pattern: /^(0x)?[0-9a-fA-F]{40}$/,
			message: 'Address invalid!',
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = balanceSchema;