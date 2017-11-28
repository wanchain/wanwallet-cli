let colors = require("colors/safe");

let tokenAddrSchema = {
	properties: {
        tokenAddr: {
			pattern: /^0x[0-9a-fA-F]{40}$/,
            message: 'Token address invalid!',
			description: colors.magenta("Input: "),
			required: true,
            type: 'string'
        }
	}
};

module.exports = tokenAddrSchema;
