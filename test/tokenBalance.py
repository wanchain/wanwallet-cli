from tokenRecharge import *

test_name = "tokenBalance"


class TokenBalance(TokenRecharge):
    """ Class to test token balance inquiry operation """

    def __init__(self):
        super(TokenBalance, self).__init__()

    def get_token_balance(self):
        """ test token balance inquiry operation """

        # recharge a wallet with token
        self.token_recharge()

        # wait for some time, recharge takes time to reflect.
        time.sleep(commonUtil.default_wait_after_recharge)

        child = pexpect.spawn('node tokenBalance', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input address", child, test_name, "'Input address' prompt not found")
        child.sendline(self.get_eth_address())

        # expect "Token balance of", ether address and default balance in the result summary
        commonUtil.check_expect(
            "Token balance of)[\s\S]*(" + self.get_eth_address() + ")[\s\S]*(" + commonUtil.default_balance, child,
            test_name, "Token balance message not displayed as expected")

        child.expect(pexpect.EOF)


def main():
    token_balance = TokenBalance()
    token_balance.get_token_balance()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
