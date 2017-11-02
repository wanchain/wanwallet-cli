var colors = require("colors/safe");

var OrdinaryKeystoreSchema = {
	properties: {
		OrdinaryKeystore: {
			pattern: '^[A-Za-z0-9]+$',
			message: 'Consist of numbers and letters.',
			description: colors.magenta("File name invalid (ignore file extension) "),
			required: true
		}
	}
};

module.exports = OrdinaryKeystoreSchema;