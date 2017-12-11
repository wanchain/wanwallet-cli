import time

from recharge import *

test_name = "ordinaryTransaction"


class OrdinaryTransaction(Recharge):
    """ Class to test ordinary transaction operation """

    def __init__(self):
        super(OrdinaryTransaction, self).__init__()

    def generate_ordinary_transaction(self):
        """ test ordinary transaction operation """

        # recharge an account
        self.recharge_account()

        # create a receiving wallet
        wallet = CreateKeystore()
        wallet.create_wallet()

        # wait for some time, recharge takes time to reflect.
        time.sleep(commonUtil.default_wait_after_recharge)

        child = pexpect.spawn('node ordinaryTransaction', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child, test_name, "'Input file name' prompt not found")
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password", child, test_name, "'Input password' prompt not found")
        child.sendline(self.get_password())

        commonUtil.check_expect("wallet has been unlocked", child, test_name,
                                "'wallet has been unlocked' message not found")
        child.sendline("Y")

        commonUtil.check_expect("Input receiver\'s address", child, test_name,
                                "'Input receiver\'s address' prompt not found")
        child.sendline(wallet.get_eth_address());

        commonUtil.check_expect("Input value", child, test_name, "'Input value' prompt not found")
        time.sleep(2)
        child.sendline(commonUtil.default_eth_transfer_amount)

        commonUtil.check_expect("You have finished a transaction", child, test_name,
                                "'You have finished a transaction' message not found")

        child.expect(pexpect.EOF)


def main():
    ordinary_transaction = OrdinaryTransaction()
    ordinary_transaction.generate_ordinary_transaction()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
