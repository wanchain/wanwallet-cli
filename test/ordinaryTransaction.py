from recharge import *
from createKeystore import *
import pexpect
import sys
import commonUtil
import time


class OrdinaryTransaction(Recharge):
    def __init__(self):
        super(OrdinaryTransaction, self).__init__()

    def generate_ordinary_transaction(self):
        self.recharge_account()

        wallet = CreateKeystore()
        wallet.createWallet()

        time.sleep(10)

        child = pexpect.spawn('node ordinaryTransaction', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child)
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password", child)
        child.sendline(self.get_password())

        commonUtil.check_expect("wallet has been unlocked", child)
        child.sendline("Y")

        commonUtil.check_expect("Input receiver\'s address", child)
        child.sendline(wallet.get_eth_address());

        commonUtil.check_expect("Input value", child)
        time.sleep(2)
        child.sendline(commonUtil.default_transfer_amount)

        commonUtil.check_expect("You have finished a transaction", child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    ordinary_transaction = OrdinaryTransaction()
    ordinary_transaction.generate_ordinary_transaction()
    commonUtil.test_successful(__file__)
