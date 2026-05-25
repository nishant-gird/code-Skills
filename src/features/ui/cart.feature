@ui @regression
Feature: Shopping Cart

  Scenario: UI-013 - Add product items into cart from grid layout
    Given User navigates to products page
    When User adds first product to cart
    Then Cart should not be empty
    And Product should be added to cart

  Scenario: UI-014 - Modify cart element quantifiers and verify calculation updates
    Given User navigates to products page
    When User adds first product to cart
    And User navigates to cart page
    And User modifies product quantity in cart
    Then Cart subtotal should be recalculated
    And Item total price should reflect new quantity
