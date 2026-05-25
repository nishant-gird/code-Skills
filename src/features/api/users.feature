@api @regression
Feature: User API Lifecycle

  @smoke
  Scenario: API-007 - Complete user lifecycle sequence
    When User sends POST request to /createAccount with valid data
    Then Response status code should be 201
    And Response should contain new user ID
    When User sends PUT request to /updateAccount with updated data
    Then Response status code should be 200
    When User sends GET request to /getUserDetailByEmail
    Then Response status code should be 200
    And Response should contain updated user details
    When User sends DELETE request to /deleteAccount
    Then Response status code should be 200
    And User account should be deleted

  Scenario: API-008 - Execute POST /verifyLogin with invalid credentials
    When User sends POST request to /verifyLogin with invalid credentials
    Then Response status code should be 401 or 400
    And Response should contain specific error message
    And Error message should indicate authentication failure
