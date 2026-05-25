@ui @regression
Feature: User Authentication

  Scenario: UI-003 - Navigate cleanly to Sign-up/Login functional layout
    Given User navigates to home page
    When User clicks signup link
    Then Login/Signup page should be displayed
    And Email input field should be visible

  Scenario: UI-004 - Register an entirely new user leveraging dynamic data generation
    Given User navigates to home page
    When User clicks signup link
    And User enters unique email and name for signup
    And User completes registration form with dynamic data
    Then Account creation success message should be displayed
    When User clicks continue button
    Then User should be redirected to home page

  @smoke
  Scenario: UI-005 - Log in with valid credentials and verify user profile banner
    Given User navigates to home page
    When User clicks login link
    And User logs in with valid credentials
    Then User should be logged in
    And User profile banner should be visible

  Scenario: UI-006 - Validate login rejection and error message strings for invalid inputs
    Given User navigates to home page
    When User clicks login link
    And User attempts login with invalid email and password
    Then Login error message should be displayed

  @smoke
  Scenario: UI-007 - Execute secure session logout and check state redirection
    Given User navigates to home page
    When User clicks login link
    And User logs in with valid credentials
    And User clicks logout link
    Then User should be logged out
    And Home page should be displayed
