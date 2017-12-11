from tokenRecharge import *

test_name = "tokenBuyStamp"


class TokenBuyStamp(TokenRecharge):
    """ Class to test buy stamp operation """

    def __init__(self):
        super(TokenBuyStamp, self).__init__()
        self.stamp_address = ''

    def get_stamp_address(self):
        return self.stamp_address

    def buy_stamp(self):
        """ test buy stamp operation """

        # recharge a wallet
        self.token_recharge()

        # wait for some time, recharge takes time to reflect.
        time.sleep(commonUtil.default_wait_after_recharge)

        child = pexpect.spawn('node tokenBuyStamp', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child, test_name, "'Input file name' prompt not found")
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password:", child, test_name, "'Input password:' prompt not found")
        child.sendline(self.get_password())
        child.expect(self.get_password())

        child.expect(pexpect.EOF, timeout=int(commonUtil.default_timeout))

        # read everything before end of file but after entering password
        result = child.before

        success_message_start = result.find('You have got a stamp, address and value are')
        if success_message_start == -1:
            commonUtil.exit_test("success message 'You have got a stamp, address and value are' not found", test_name,
                                 child)

        # find stamp address beginning
        stamp_address_start = result.find('0x', success_message_start)
        if stamp_address_start == -1:
            commonUtil.exit_test("stamp address value not found", test_name, child)

        # extract stamp address
        self.stamp_address = result[stamp_address_start + 2:stamp_address_start + 134]


def main():
    buy_stamp_obj = TokenBuyStamp()
    buy_stamp_obj.buy_stamp()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
