let colors = require("colors/safe");

let privacyValueSchema = {
	properties: {
		value: {
			pattern: /^0.1$|^0.2$|^0.5$|^1$|^2$|^5$|^10$|^20$|^50$|^100$/,
			message: "You only can input (0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100).",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = privacyValueSchema;
