@ui @regression
Feature: Contact Us Form

  Scenario: UI-015 - Complete contact-us validation form with attachment file upload
    Given User navigates to home page
    When User navigates to contact page
    And User fills contact form with dynamic data
    And User uploads test attachment
    And User submits contact form
    Then Form submission success message should be displayed
