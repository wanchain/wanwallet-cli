import time

from recharge import *

test_name = "tokenRecharge"


class TokenRecharge(Recharge):
    """ Class to test token recharge operation """

    def __init__(self):
        super(TokenRecharge, self).__init__()

    def token_recharge(self):
        """ test token recharge operation """

        # for token recharge, we need a wallet with eth balance
        self.recharge_account()

        # wait for some time, recharge takes time to reflect.reflect. otherwise it is throwing an error with insufficient fund
        time.sleep(commonUtil.default_wait_after_recharge)

        child = pexpect.spawn('node tokenRecharge', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input your keystore file name", child, test_name,
                                "'Input your keystore file name' prompt not found")
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password:", child, test_name, "'Input password:' prompt not found")
        child.sendline(self.get_password())

        # expect "Token balance of", ether address and default balance in the result summary
        commonUtil.check_expect(
            "Token balance of)[\s\S]*(" + self.get_eth_address() + ")[\s\S]*(" + commonUtil.default_balance, child,
            test_name,
            "Token recharge message not displayed as expected")

        child.expect(pexpect.EOF)


def main():
    tokenRecharge = TokenRecharge()
    tokenRecharge.token_recharge()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
