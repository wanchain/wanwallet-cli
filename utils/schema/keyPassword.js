var colors = require("colors/safe");

var keyPasswordSchema = {
	properties: {
		keyPassword: {
			pattern: '[^\u4e00-\u9fa5]+',
			message: "the password is invalid",
			description: colors.magenta("Input password: "),
			required: true
		}
	}
};

module.exports = keyPasswordSchema;