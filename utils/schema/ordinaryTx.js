let colors = require("colors/safe");

let ordinaryTxSchema = {
	properties: {
        ordinaryTx: {
			pattern: /^0x[0-9a-fA-F]{64}$/,
            message: 'Tx invalid!',
			description: colors.magenta("Input: "),
			required: true,
            type: 'string'
        }
	}
};

module.exports = ordinaryTxSchema;
