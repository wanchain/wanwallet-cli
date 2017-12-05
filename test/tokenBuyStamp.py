from recharge import *
import pexpect
import sys
import commonUtil
import time

class TokenBuyStamp(Recharge):
    def __init__(self):
        super(TokenBuyStamp, self).__init__()
        self.stamp_address = ''

    def get_stamp_address(self):
        return self.stamp_address    

    def buy_stamp(self):
        self.recharge_account()
        time.sleep(10)
        child = pexpect.spawn('node tokenBuyStamp', cwd='../src/')
        child.logfile = sys.stdout

        commonUtil.check_expect("Input file name", child)
        child.sendline(self.get_file_name())

        commonUtil.check_expect("Input password:", child)
        child.sendline(self.get_password())
        child.expect(self.get_password())
        
        result = child.read()

        success_message_start = result.find('You have got a stamp, address and value are')    
        if (success_message_start == -1):
            commonUtil.exit_test("success message 'You have got a stamp, address and value are' not found", child)

                    
        stamp_address_start = result.find('0x',success_message_start)        
        if (stamp_address_start == -1):
            commonUtil.exit_test("'stamp address' value not found", child)    

        self.stamp_address = result[stamp_address_start+2:stamp_address_start + 135]    


        child.expect(pexpect.EOF)


if __name__ == "__main__":
    buy_stamp_obj = TokenBuyStamp()
    buy_stamp_obj.buy_stamp()
    commonUtil.test_successful(__file__)
