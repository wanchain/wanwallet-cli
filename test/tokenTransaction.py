from tokenBuyStamp import *

test_name = "tokenTransaction"


class TokenTransaction(TokenBuyStamp):
    """ Class to test token transaction operation """

    def __init__(self):
        super(TokenTransaction, self).__init__()
        self.ota_wallet = None
        self.token_ota_address = ''
        self.token_ota_key = ''

    def get_ota_wallet(self):
        """ return ota receiving wallet """
        return self.ota_wallet

    def get_token_ota_address(self):
        return self.token_ota_address

    def get_token_ota_key(self):
        return self.token_ota_key

    def generate_token_transaction(self):
        """ test token transaction operation """

        # generate token sending wallet
        self.buy_stamp()

        # generate token receiving wallet
        self.ota_wallet = TokenBuyStamp()
        self.ota_wallet.buy_stamp()

        # time.sleep(5)

        child = pexpect.spawn('node tokenTransaction', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input your keystore file name", child, test_name,
                                "'Input your keystore file name' prompt not found")
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password", child, test_name, "'Input password' prompt not found")
        child.sendline(self.get_password())

        commonUtil.check_expect("Input: ", child, test_name, "'Input' prompt for wan address not found")
        child.sendline(self.ota_wallet.get_wan_address())

        commonUtil.check_expect("Input: ", child, test_name, "'Input:' prompt for token amount not found")
        child.sendline(commonUtil.default_wan_transfer_amount)

        commonUtil.check_expect(self.get_stamp_address()[:20] + ")[\s\S]*(Input: ", child, test_name,
                                "stamp address value not found")

        child.sendline("0x" + self.get_stamp_address())
        child.expect("0x" + self.get_stamp_address())

        child.expect(pexpect.EOF, timeout=int(commonUtil.default_timeout))

        # read everything before end of file but after entering stamp address
        result = child.before

        success_message_start = result.find('Token balance of')

        if success_message_start == -1:
            commonUtil.exit_test(" tokenTransaction not successful", test_name, child)

        ota_address_start = result.find('0x', success_message_start)

        if ota_address_start == -1:
            commonUtil.exit_test(" token ota address not found", test_name, child)

        self.token_ota_address = result[ota_address_start:ota_address_start + 42]

        if result.find(commonUtil.default_wan_transfer_amount, ota_address_start) == -1:
            commonUtil.exit_test(
                " token balance amount " + commonUtil.default_wan_transfer_amount + " not found in success message",
                test_name, child)

        ota_key_start = result.find('0x', success_message_start + 42)

        if ota_key_start == -1:
            commonUtil.exit_test(" token ota key not found", test_name, child)

        self.token_ota_key = result[ota_key_start:ota_key_start + 135]

        child.expect(pexpect.EOF)


def main():
    token_transaction = TokenTransaction()
    token_transaction.generate_token_transaction()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
