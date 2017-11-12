let colors = require("colors/safe");

let ordinaryValueSchema = {
	properties: {
		value: {
			pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
			message: "value invalid!",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = ordinaryValueSchema;
