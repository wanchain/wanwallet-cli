let colors = require("colors/safe");

let ordinaryKeystoreSchema = {
	properties: {
		ordinaryKeystore: {
			pattern: '^[A-Za-z0-9]+$',
			message: 'Consist of numbers and letters.',
			description: colors.magenta("Input file name (ignore file extension) "),
			required: true
		}
	}
};

module.exports = ordinaryKeystoreSchema;