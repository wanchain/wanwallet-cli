let colors = require("colors/safe");

let stampAddrSchema = {
	properties: {
        stampAddr: {
			pattern: /^(0x)?[0-9a-fA-F]{132}$/,
			message: "Stamp invalid",
			description: colors.magenta("Input: "),
			required: true,
            type: 'string'
        }
	}
};

module.exports = stampAddrSchema;
