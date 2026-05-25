@api @regression
Feature: Product Search API

  Scenario: API-005 - Execute POST /searchProduct with valid body parameters
    When User sends POST request to /searchProduct with search term
    Then Response status code should be 200
    And Response should contain matching products array
    And Products should match search criteria

  Scenario: API-006 - Execute POST /searchProduct missing required body parameter
    When User sends POST request to /searchProduct without required parameter
    Then Response status code should be 400
    And Response should contain data validation error message
