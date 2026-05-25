@api @regression
Feature: Products API

  @smoke
  Scenario: API-001 - Execute GET /productsList and validate structural array types
    When User sends GET request to /productsList
    Then Response status code should be 200
    And Response should contain products array
    And Each product should have required properties

  Scenario: API-002 - Execute invalid POST /productsList request and assert method rejection
    When User sends invalid POST request to /productsList
    Then Response status code should be 400 or 405
    And Response should contain error message

  Scenario: API-003 - Execute GET /brandsList and validate baseline brand items
    When User sends GET request to /brandsList
    Then Response status code should be 200
    And Response should contain brands array
    And Brands list should not be empty

  Scenario: API-004 - Execute invalid PUT /brandsList request and validate error formatting
    When User sends invalid PUT request to /brandsList
    Then Response status code should be 400 or 405
    And Response should contain proper error format
