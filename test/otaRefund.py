from privacyTransaction import *
import pexpect
import sys
import commonUtil
import time


class OTARefund(PrivacyTransaction):
    def __init__(self):
        super(OTARefund, self).__init__()

    def get_ota_refund(self):
        self.generate_privacy_transaction()

        time.sleep(10)
        child = pexpect.spawn('node otaRefund', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input your keystore file name", child)
        child.sendline(self.get_receiver_wallet().get_file_name())

        commonUtil.check_expect("Input password:", child)
        child.sendline(self.get_receiver_wallet().get_password())        


        commonUtil.check_expect("wallet has been unlocked", child)
        child.sendline("Y")
        #child.expect("Y")

        #commonUtil.check_expect("Input:", child)

        #result =  child.after

        commonUtil.check_expect(self.get_ota_address()[:20], child)    
        #commonUtil.check_expect("value: 5000000000000000000", child)    
        
        child.send(self.get_ota_address())        

        commonUtil.check_expect("transactionHash", child)    
        child.expect(pexpect.EOF)


if __name__ == "__main__":
    ota_refund = OTARefund()
    ota_refund.get_ota_refund()
    commonUtil.test_successful(__file__)
