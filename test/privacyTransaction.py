from recharge import *
from createKeystore import *
import pexpect
import sys
import commonUtil
import time




class PrivacyTransaction(Recharge):
    def __init__(self):
        self.ota_address = ''
        self.wallet = None
        super(PrivacyTransaction, self).__init__()

    def get_ota_address(self):
        return self.ota_address

    def get_receiver_wallet(self):
        return self.wallet        

    def generate_privacy_transaction(self):
        self.recharge_account()
        time.sleep(20)

        self.wallet = Recharge()
        self.wallet.recharge_account()

        time.sleep(10)

        child = pexpect.spawn('node privacyTransaction', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child)
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password", child)
        child.sendline(self.get_password())

        commonUtil.check_expect("wallet has been unlocked", child)
        child.sendline("Y")

        commonUtil.check_expect("Input receiver\'s waddress", child)
        child.sendline(self.wallet.get_wan_address());

        commonUtil.check_expect("Input value", child)
        commonUtil.check_expect("Input", child)
        child.sendline(commonUtil.default_transfer_amount)
        child.expect(commonUtil.default_transfer_amount)

        result = child.read()
        

        if (result.find("otaDestAddress") == -1):
            commonUtil.exit_test("'otaDestAddress' text not found ", child)


        ota_address_start = result.find('0x')        
        if (ota_address_start == -1):
            commonUtil.exit_test("'otaDestAddress' value not found", child)    

        self.ota_address = result[ota_address_start+2:ota_address_start + 135]    
        print self.ota_address

        if (result.find(commonUtil.default_stamp_value) == -1):
            commonUtil.exit_test("stamp value " + commonUtil.default_stamp_value + " not found", child)


        child.expect(pexpect.EOF)


if __name__ == "__main__":
    privacy_transaction = PrivacyTransaction()
    privacy_transaction.generate_privacy_transaction()
    commonUtil.test_successful(__file__)
