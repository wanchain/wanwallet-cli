import random
import string
import sys

import pexpect

default_balance = '1000000'
default_eth_recharge_value = "12"
default_eth_transfer_amount = "2"
default_wan_transfer_amount = "200"
default_stamp_value = '2000000000000000000'
default_timeout = '50'
default_wait_after_recharge = 15
show_logs = False


def get_random_string():
    return ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(16)])


def exit_test(message, file_name, process):
    print "\n  =========== Failure: " + file_name + ", Error Message: " + message + " =========== "
    process.close()
    sys.exit(-1)


def test_successful(test_name):
    print ("--------------  " + test_name + " Successful -------------------")


def check_expect(condition, process, file_name, failure_message):
    i = process.expect(['[\s\S]*(' + condition + ')[\s\S]*', pexpect.TIMEOUT, pexpect.EOF],
                       timeout=int(default_timeout))
    if i == 1:
        exit_test(
            "Request timed out. (No response for " + default_timeout + " seconds)",
            file_name, process)
    if i == 2:
        exit_test(failure_message, file_name, process)
