from privacyTransaction import *

test_name = "otaBalance"


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

        i = child.expect(
            '[\s\S]*(' + self.get_ota_address() + ')*[\s\S]*(' + commonUtil.default_stamp_value + ')*[\s\S]', child,
            test_name, "ota address or ota balance not correct")


def main():
    ota_balance = OTABalance()
    ota_balance.get_ota_balance()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
