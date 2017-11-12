let colors = require("colors/safe");

let keyPasswordSchema = {
	properties: {
		keyPassword: {
			pattern: '[^\u4e00-\u9fa5]+',
			message: "Password invalid",
			description: colors.magenta("Input password: "),
			required: true
		}
	}
};

module.exports = keyPasswordSchema;