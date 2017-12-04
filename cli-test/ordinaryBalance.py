from recharge import *
import pexpect
import sys
import commonUtil
import time


class OrdinaryBalance(Recharge):
    def __init__(self):
        Recharge.__init__(self)

    def check_ordinary_balance(self):
        self.recharge_account()
        time.sleep(10)
        child = pexpect.spawn('node ordinaryBalance', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input:", child)
        child.sendline(self.get_eth_address())

        commonUtil.check_expect("12 eth", child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    ordinaryBalance = OrdinaryBalance()
    ordinaryBalance.check_ordinary_balance()
    commonUtil.test_successful(__file__)
