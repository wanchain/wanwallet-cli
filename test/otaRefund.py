from privacyTransaction import *

test_name = "otaRefund"


class OTARefund(PrivacyTransaction):
    """ Class to test ota refund operation """

    def __init__(self):
        super(OTARefund, self).__init__()

    def get_ota_refund(self):
        """ test ota refund operation """

        # generate a privacy transaction to generate ota address
        self.generate_privacy_transaction()

        # time.sleep(10)
        child = pexpect.spawn('node otaRefund', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input your keystore file name", child, test_name,
                                "'Input your keystore file name' prompt not found")
        child.sendline(self.get_receiver_wallet().get_file_name())

        commonUtil.check_expect("Input password:", child, test_name, "'Input password:' prompt not found")
        child.sendline(self.get_receiver_wallet().get_password())

        commonUtil.check_expect("wallet has been unlocked", child, test_name,
                                "'wallet has been unlocked' message not found")
        child.sendline("Y")

        commonUtil.check_expect(self.get_ota_address()[:20], child, test_name, "ota address is not displayed")

        child.sendline(self.get_ota_address())

        commonUtil.check_expect("blockHash)[\s\S]*(transactionHash)[\s\S]*(", child, test_name,
                                "'transactionHash' message not found")
        child.expect(pexpect.EOF)


def main():
    ota_refund = OTARefund()
    ota_refund.get_ota_refund()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
