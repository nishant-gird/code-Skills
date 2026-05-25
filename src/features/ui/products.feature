@ui @regression
Feature: Product Catalog and Search

  Scenario: UI-008 - Open products grid view and confirm data item visibility
    Given User navigates to products page
    Then Products grid should be displayed
    And Multiple products should be visible

  Scenario: UI-009 - Open specific product details page; confirm price, name, and stock attributes match
    Given User navigates to products page
    When User clicks on first product
    Then Product details page should be loaded
    And Product name should be displayed
    And Product price should be displayed
    And Product description should be visible

  Scenario: UI-010 - Execute keyword product search yielding successful results
    Given User navigates to products page
    When User searches for product with keyword
    Then Search results should be displayed
    And Products matching search term should be visible

  Scenario: UI-011 - Execute keyword product search yielding explicit empty-state results
    Given User navigates to products page
    When User searches for non-existent product
    Then No products found message should be displayed

  Scenario: UI-012 - Apply brand-specific navigational filters and verify item updates
    Given User navigates to products page
    When User applies brand filter
    Then Product list should be updated with filtered results
    And Filtered products should match selected brand

  Scenario: UI-012 - Apply category filter and verify item updates
    Given User navigates to products page
    When User applies category filter
    Then Product list should be updated with filtered results
