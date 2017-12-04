from privacyTransaction import *
import pexpect
import sys
import commonUtil
import time


class OTABalance(PrivacyTransaction):
    def __init__(self):
        super(OTABalance, self).__init__()

    def get_ota_balance(self):
        self.generate_privacy_transaction()
        time.sleep(10)
        child = pexpect.spawn('node otaBalance', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input waddress", child)
        child.sendline(self.get_receiver_wallet().get_wan_address())



        i = child.expect([
                             r'[\s\S]*(' + self.get_ota_address() + r')*[\s\S]*(' + commonUtil.default_stamp_value + r')*[\s\S]',
                             pexpect.TIMEOUT, pexpect.EOF], timeout=30)
        if i == 1 or i == 2:
            commonUtil.exit_test(
                "ota address or ota balance not correct",
                child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    ota_balance = OTABalance()
    ota_balance.get_ota_balance()
    commonUtil.test_successful(__file__)
