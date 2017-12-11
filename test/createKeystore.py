import sys

import pexpect

import commonUtil

test_name = "createKeystore"


class CreateKeystore(object):
    """ Class to test create wallet operation """

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

    def create_wallet(self):
        """ test create wallet operation"""

        child = pexpect.spawn('node createKeystore', cwd='../src/')
        if commonUtil.show_logs:
            child.logfile = sys.stdout

        self.file_name = commonUtil.get_random_string()
        self.password = commonUtil.get_random_string()

        commonUtil.check_expect("Input file name", child, test_name, "'Input file name' prompt not found")
        child.sendline(self.file_name)

        commonUtil.check_expect("Input password", child, test_name, "'Input password' prompt not found")
        child.sendline(self.password)

        result = child.read()

        if result.find("Please check if the filename is used") != -1:
            commonUtil.exit_test("file name is already present in the system", child)

        if result.find("address") == -1:
            commonUtil.exit_test("'address' title not found in wallet summary", child)

        if result.find("waddress") == -1:
            commonUtil.exit_test("waddress' title not found in wallet summary", child)

        if result.find(self.file_name) == -1:
            commonUtil.exit_test("file name:" + self.file_name + " not found in wallet summary", child)

        if result.find(self.password) == -1:
            commonUtil.exit_test("password:" + self.password + " not found in wallet summary", child)

        address_start = result.find('0x')
        if address_start == -1:
            commonUtil.exit_test('address value starting with 0x not found in wallet summary', child)
        self.address = result[address_start:address_start + 42]

        waddress_start = result.find('0x', address_start + 42)
        if waddress_start == -1:
            commonUtil.exit_test('wan address value starting with 0x not found in wallet summary', child)
        self.waddress = result[waddress_start:waddress_start + 134]

        child.expect(pexpect.EOF)


def main():
    createKeystore = CreateKeystore()
    createKeystore.create_wallet()
    commonUtil.test_successful(test_name)


if __name__ == "__main__":
    main()
