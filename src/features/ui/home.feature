@ui @regression
Feature: Home Page Navigation and Display

  Background:
    Given User navigates to home page

  @smoke
  Scenario: UI-001 - Verify home page elements and responsive layout sections
    Then Home page should be loaded with all essential elements
    And Products grid should be visible
    And Slider carousel should be displayed

  @smoke
  Scenario: UI-002 - Validate main global header navigation accessibility
    Then Header navigation should be accessible
    And Products link should be visible in header
    And Cart link should be visible in header
    And Contact link should be visible in header
    And Login link should be visible in header
