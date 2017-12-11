var colors = require("colors/safe");

var ordinaryValueSchema = {
	properties: {
		value: {
			pattern: /^10$|^20$|^50$|^100$|^200$|^500$|^1000$|^50000$|^50000$/,
			message: "You only can input (10, 20, 50, 100, 200, 500, 1000, 50000, 50000).",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = ordinaryValueSchema;
