import string
import random
import pexpect

default_balance = '1000000'
default_transfer_amount = "5"
default_stamp_value = '5000000000000000000'

def get_random_string():
    return ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(16)])


def exit_test(message, process):
    print message + "\n"
    print "====================== Failed ==========================="
    process.close()
    exit()


def test_successful(test_name):
    print ("--------------  " + test_name + " Successful -------------------")


def check_expect(condition, process):
    i = process.expect([r'[\s\S]*(' + condition + r')[\s\S]*', pexpect.TIMEOUT, pexpect.EOF], timeout=30)
    if i == 1 or i == 2:
        exit_test("Test case was expecting '" + condition + "' prompt", process)
