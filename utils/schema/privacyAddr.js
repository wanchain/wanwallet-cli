let colors = require("colors/safe");

let privacyAddrSchema = {
	properties: {
		waddress: {
			pattern: /^(0x)?[0-9a-fA-F]{132}$/,
			message: "Waddress invalid",
			description: colors.magenta("Input: "),
			required: true
		}
	}
};

module.exports = privacyAddrSchema;
