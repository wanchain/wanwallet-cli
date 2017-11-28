let colors = require("colors/safe");

let tokenValueSchema = {
	properties: {
        tokenValue: {
			pattern: /^[1-9]\d*$/,
			message: "Value invalid!(you should input positive integer)",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = tokenValueSchema;
