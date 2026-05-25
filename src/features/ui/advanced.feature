@ui @regression
Feature: Advanced UI Scenarios

  @smoke
  Scenario: UI-016 - Network interception and asset resiliency
    Given User navigates to home page
    When User blocks specific assets on the page
    Then Page should load without blocked assets
    And Core page elements should remain visible and functional

  @smoke
  Scenario: UI-017 - Multi-context session sharing with cookies
    Given User navigates to home page
    When User logs in via first browser context
    And User extracts authentication cookies
    And User creates new isolated browser context with extracted cookies
    Then Second context should access secure pages without login prompt
    And User should remain authenticated in second context
