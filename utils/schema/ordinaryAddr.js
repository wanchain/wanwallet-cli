let colors = require("colors/safe");

let ordinaryAddrSchema = {
	properties: {
        ordinaryAddr: {
			pattern: /^0x[0-9a-fA-F]{40}$/,
            message: 'Address invalid!',
			description: colors.magenta("Input: "),
			required: true,
            type: 'string'
        }
	}
};

module.exports = ordinaryAddrSchema;
