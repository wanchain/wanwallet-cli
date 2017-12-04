from createKeystore import *
import pexpect
import sys
import commonUtil


class Recharge(CreateKeystore):
    def __init__(self):
        super(Recharge, self).__init__()

    def recharge_account(self):
        self.createWallet()
        child = pexpect.spawn('node recharge', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input:", child)
        child.sendline(self.get_eth_address())

        commonUtil.check_expect("Recharge successful", child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    recharge = Recharge()
    recharge.recharge_account()
    commonUtil.test_successful(__file__)
