from tokenTransaction import *

test_name = "tokenOTAtransaction"


class TokenOTATransaction(TokenTransaction):
    """ Class to test token ota transaction operation """

    def __init__(self):
        super(TokenOTATransaction, self).__init__()
        self.ota_receiving_wallet = None

    def generate_token_ota_transaction(self):
        """ test token ota transaction operation """

        # generate token transaction
        self.generate_token_transaction()

        # generate ota receiving wallet
        self.ota_receiving_wallet = CreateKeystore()
        self.ota_receiving_wallet.create_wallet()

        # time.sleep(5)

        child = pexpect.spawn('node tokenOTAtransaction', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child, test_name,
                                "'Input file name' prompt not found")
        child.sendline(self.get_ota_wallet().get_file_name())

        commonUtil.check_expect("Input password:", child, test_name,
                                "'Input password:' prompt not found")
        child.sendline(self.get_ota_wallet().get_password())

        commonUtil.check_expect("Input: ", child, test_name,
                                "'Input:' prompt for ota address not found")
        child.sendline(self.get_token_ota_address())

        commonUtil.check_expect("Input: ", child, test_name,
                                "'Input:' prompt for receiving wan address not found")
        child.sendline(self.ota_receiving_wallet.get_wan_address())

        commonUtil.check_expect("Input: ", child, test_name,
                                "'Input:' prompt for stamp address not found")

        child.sendline("0x" + self.get_ota_wallet().get_stamp_address())

        commonUtil.check_expect("Token balance of)[\s\S]*(" + commonUtil.default_wan_transfer_amount, child, test_name,
                                "Token ota balance message not displayed as expected")

        child.expect(pexpect.EOF)


def main():
    token_ota_transaction = TokenOTATransaction()
    token_ota_transaction.generate_token_ota_transaction()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
