let colors = require("colors/safe");

let choiceMethodSchema = {
	properties: {
		method: {
			pattern: /^1$|^2$|^3$|^4$|^5$/,
			message: "pls input: 1 or 2 or 3 or 4 or 5",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = choiceMethodSchema;
