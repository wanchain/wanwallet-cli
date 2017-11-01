var colors = require("colors/safe");

var OrdinaryKeystoreSchema = {
	properties: {
		OrdinaryKeystore: {
			pattern: '^[A-Za-z0-9]+$',
			message: 'consist of numbers and letters.',
			description: colors.magenta("Input(without file format): "),
			required: true
		}
	}
};

module.exports = OrdinaryKeystoreSchema;