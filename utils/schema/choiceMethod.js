var colors = require("colors/safe");

var methodSchema = {
	properties: {
		method: {
			pattern: /^1$|^2$|^3$|^4$|^5$/,
			message: "pls input: 1 or 2 or 3 or 4 or 5",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = methodSchema;
