import time

from recharge import *

test_name = "privacyTransaction"


class PrivacyTransaction(Recharge):
    """ Class to test privacy transaction operation """

    def __init__(self):
        self.ota_address = ''
        self.privacy_transaction_receiving_wallet = None
        super(PrivacyTransaction, self).__init__()

    def get_ota_address(self):
        return self.ota_address

    def get_receiver_wallet(self):
        return self.privacy_transaction_receiving_wallet

    def generate_privacy_transaction(self):
        """ test privacy transaction operation """

        # recharge transaction sending wallet
        self.recharge_account()

        # recharge transaction receiving wallet, (recharging because we need to use this wallet in otaRefund)
        self.privacy_transaction_receiving_wallet = Recharge()
        self.privacy_transaction_receiving_wallet.recharge_account()

        # wait for some time, recharge takes time to reflect.
        time.sleep(commonUtil.default_wait_after_recharge)

        child = pexpect.spawn('node privacyTransaction', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child, test_name, "'Input file name' prompt not found")
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password", child, test_name, "'Input password' prompt not found")
        child.sendline(self.get_password())

        commonUtil.check_expect("wallet has been unlocked", child, test_name,
                                "'wallet has been unlocked' message not found")
        child.sendline("Y")

        commonUtil.check_expect("Input receiver\'s waddress", child, test_name,
                                "'Input receiver\'s waddress' prompt not found")
        child.sendline(self.privacy_transaction_receiving_wallet.get_wan_address());

        commonUtil.check_expect("Input", child, test_name, "Input eth address prompt not found")
        child.sendline(commonUtil.default_eth_privacy_transaction)

        child.expect(commonUtil.default_eth_privacy_transaction)

        result = child.read()

        if result.find("value:  " + commonUtil.default_stamp_value) == -1:
            commonUtil.exit_test("'value:  " + commonUtil.default_stamp_value +
                                 "' not found in summary", test_name, child)

        if result.find("otaDestAddress") == -1:
            commonUtil.exit_test("'otaDestAddress' text not found ", test_name, child)

        ota_address_start = result.find('0x', result.find("otaDestAddress"))
        if ota_address_start == -1:
            commonUtil.exit_test("'otaDestAddress' value not found", test_name, child)

        self.ota_address = result[ota_address_start + 2:ota_address_start + 135]

        if result.find(commonUtil.default_stamp_value) == -1:
            commonUtil.exit_test("stamp value " + commonUtil.default_stamp_value + " not found", test_name, child)

        child.expect(pexpect.EOF)


def main():
    privacy_transaction = PrivacyTransaction()
    privacy_transaction.generate_privacy_transaction()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
