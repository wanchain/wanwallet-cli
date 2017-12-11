import time

from recharge import *

test_name = "ordinaryBalance"


class OrdinaryBalance(Recharge):
    """ Class to test ordinary balance inquiry operation """

    def __init__(self):
        Recharge.__init__(self)

    def check_ordinary_balance(self):
        """ test ordinary balance inquiry operation """

        # recharge the account
        self.recharge_account()

        # wait for some time, sometimes the balance doesn't reflect immediately after recharge
        time.sleep(commonUtil.default_wait_after_recharge)
        child = pexpect.spawn('node ordinaryBalance', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        commonUtil.check_expect("Input:", child, test_name, "'Input:' prompt not found")
        child.sendline(self.get_eth_address())

        # By default it recharges to 12 eth, so balance should reflect 12 eth
        commonUtil.check_expect(commonUtil.default_eth_recharge_value + " eth", child, test_name,
                                commonUtil.default_eth_recharge_value + " eth" + " balance not found")

        child.expect(pexpect.EOF)


def main():
    ordinaryBalance = OrdinaryBalance()
    ordinaryBalance.check_ordinary_balance()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
