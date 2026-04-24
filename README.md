# InterCars E2E Test

End-to-end test for [intercars.pl](https://intercars.pl) built with Playwright.

## Test Scenario

1. Navigate to intercars.pl, open the category menu (Wszystkie → Zobacz wszystkie)
2. Dynamically select the category with the highest number of products
3. Verify that the total product count across filter subcategories is greater than 0
4. Apply one of the available filters
5. Add 2 products to the cart
6. Verify the total price in the cart matches the sum of product prices from the listing

## Prerequisites

- Node.js 18+
- Google Chrome (installed locally)

## Installation

```bash
npm install
```

## Running Tests

```bash
npm test
```

The test runs in headed mode using Google Chrome with automation detection disabled.

## Notes

- If a CAPTCHA appears, solve it manually — the test will wait up to 60 seconds
- Test timeout is 90 seconds (configurable in `playwright.config.ts`)

## Project Structure

```
tests/
├── fixtures/
│   └── test-data.ts          # CategoryData, ProductData interfaces
├── pages/
│   ├── home.page.ts           # Home page, cookies, CAPTCHA handling
│   ├── category.page.ts       # Category listing page
│   ├── products.page.ts       # Product list, filters, add-to-cart
│   └── cart.page.ts           # Cart page
└── specs/
    └── intercars-e2e.spec.ts  # E2E test spec
```
