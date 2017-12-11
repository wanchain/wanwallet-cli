# Requirements:

- Install Python
- Install python package: pexpect (follow instruction here: http://www.pythonforbeginners.com/systems-programming/how-to-use-the-pexpect-module-in-python)

# Execute Test:

Run following commands from wanchain-cli/test directory to execute test cases.
- python createKeystore.py
- python recharge.py
- python ordinaryBalance.py
- python tokenRecharge.py
- python tokenBalance.py
- python ordinaryTransaction.py
- python privacyTransaction.py
- python otaBalance.py
- python tokenBuyStamp.py
- python tokenTransaction.py
- python tokenOTAtransaction.py

# Execute all testcases
- python testAll.py

# Show console log
- Go to commonUtil.py
- change ```show_logs = True```
