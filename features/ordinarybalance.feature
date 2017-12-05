Feature: Simple Balance
  In order to send wancoin
  As a user
  I want to check the balance of my account

  Scenario: New Account
    Given a wallet with address "0xe14117602aee15e271ef72b1b1913919dbc4ca91"
    Then the balance should be "0"

  # 0xe14117602aee15e271ef72b1b1913919dbc4ca91 >> balance 0
  # 0xa8cd26c59409f1baa9c5bf44ee77539c0606c441 >> balance 24
  Scenario: Recharge
    Given a new wallet address
    When I Recharge
    Then the balance should be "12"

  Scenario Outline: Multiple accounts balances
    Given a wallet with address "<address>"
    Then the balance should be "<balance>"

    Examples:
      | address                                    | balance |
      | 0xe14117602aee15e271ef72b1b1913919dbc4ca91 |       0 |
      | 0xa8cd26c59409f1baa9c5bf44ee77539c0606c441 |      24 |