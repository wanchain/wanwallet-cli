let colors = require("colors/safe");

let ordinaryStateSchema = {
	properties: {
		state: {
			pattern: /^y$|^Y$|^n$|^N$/,
			message: "you should input y(Y) or n(N)",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = ordinaryStateSchema;