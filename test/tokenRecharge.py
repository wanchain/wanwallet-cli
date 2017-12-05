from recharge import *
import pexpect
import sys
import commonUtil
import time

default_balance = '1000000'


class TokenRecharge(Recharge):
    def __init__(self):
        super(TokenRecharge, self).__init__()

    def token_recharge(self):
        self.recharge_account()
        time.sleep(10)

        child = pexpect.spawn('node tokenRecharge', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input your keystore file name", child)
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password:", child)
        child.sendline(self.get_password())

        i = child.expect(
            [r'[\s\S]*(Token balance of)[\s\S]*(' + default_balance + r')*[\s\S]', pexpect.TIMEOUT, pexpect.EOF],
            timeout=30)
        if i == 1 or i == 2:
            commonUtil.exit_test(
                "Test case was expecting text 'Token balance of:' and default balance '" + default_balance + "'", child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    tokenRecharge = TokenRecharge()
    tokenRecharge.token_recharge()
    commonUtil.test_successful(__file__)
