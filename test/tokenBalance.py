from tokenRecharge import *
import pexpect
import sys
import commonUtil
import time


class TokenBalance(TokenRecharge):
    def __init__(self):
        super(TokenBalance, self).__init__()

    def get_token_balance(self):
        self.token_recharge()
        time.sleep(10)
        child = pexpect.spawn('node tokenBalance', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input address", child)
        child.sendline(self.get_eth_address())

        i = child.expect([
                             r'[\s\S]*(Token balance of)[\s\S]*(' + r'[\s\S]' + self.get_eth_address() + r'[\s\S]' + commonUtil.default_balance + r')*[\s\S]',
                             pexpect.TIMEOUT, pexpect.EOF], timeout=30)
        if i == 1 or i == 2:
            commonUtil.exit_test(
                "Test case was expecting text 'Token balance of:' and default balance '" + commonUtil.default_balance + "'",
                child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    token_balance = TokenBalance()
    token_balance.get_token_balance()
    commonUtil.test_successful(__file__)
