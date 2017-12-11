# -*- coding: utf-8 -*-
from createKeystore import *

test_name = "recharge"


class Recharge(CreateKeystore):
    """ Class to test recharge operation """

    def __init__(self):
        super(Recharge, self).__init__()

    def recharge_account(self):
        """ test recharge wallet operation """

        # create a wallet
        self.create_wallet()

        child = pexpect.spawn('node recharge', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input:", child, test_name, "'Input' prompt not found")
        child.sendline(self.get_eth_address())

        # Expecting recharge successful message with transaction hash starting with 0x
        commonUtil.check_expect("Recharge successful！ tx Hash: 0x", child, test_name,
                                "There was some issue during recharge transaction")

        child.expect(pexpect.EOF)


def main():
    recharge = Recharge()
    recharge.recharge_account()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
