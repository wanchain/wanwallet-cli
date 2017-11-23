import pexpect
import commonUtil
import sys
import os


class CreateKeystore(object):
    def __init__(self):
        self.address = ''
        self.waddress = ''
        self.file_name = ''
        self.password = ''

    def get_eth_address(self):
        return self.address

    def get_wan_address(self):
        return self.waddress

    def get_file_name(self):
        return self.file_name

    def get_password(self):
        return self.password

    def createWallet(self):

        child = pexpect.spawn('node createKeystore', cwd='../src/')
        child.logfile = sys.stdout

        self.file_name = commonUtil.get_random_string()
        self.password = commonUtil.get_random_string()

        commonUtil.check_expect("Input file name", child)

        child.sendline(self.file_name)
        child.expect(self.file_name)

        commonUtil.check_expect("Input password", child)

        child.sendline(self.password)
        child.expect(self.password)

        result = child.read()

        if (result.find("Please check is the file_name used") != -1):
            commonUtil.exit_test("file_name is already present in the system", child)

        if (result.find("address") == -1):
            commonUtil.exit_test("Wallet Summary: address title not found", child)

        if (result.find("waddress") == -1):
            commonUtil.exit_test("Wallet Summary: waddress title not found", child)

        if (result.find(self.file_name) == -1):
            commonUtil.exit_test("Wallet Summary: file name not present", child)

        if (result.find(self.password) == -1):
            commonUtil.exit_test("Wallet Summary: password not present", child)

        address_start = result.find('0x')

        self.address = result[address_start:address_start + 43]
        if (address_start == -1):
            commonUtil.exit_test('Wallet Summary: address not found', child)

        waddress_start = result.find('0x', address_start + 43)

        self.waddress = result[waddress_start:waddress_start + 135]
        if (waddress_start == -1):
            commonUtil.exit_test('Wallet Summary: wan address not found', child)

        child.expect(pexpect.EOF)


if __name__ == "__main__":
    createKeystore = CreateKeystore()
    createKeystore.createWallet()
    commonUtil.test_successful(__file__)
