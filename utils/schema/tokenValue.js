let colors = require("colors/safe");

let tokenValueSchema = {
	properties: {
		value: {
			pattern: /^[1-9]\d*$/,
			message: "Value invalid!(you should input positive integer)",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = tokenValueSchema;
