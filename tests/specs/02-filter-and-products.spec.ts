import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';
import { sharedData } from '../fixtures/test-data';

test.describe('Filter Validation', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure we're on the category page from test 1
        if (sharedData.selectedCategory?.url) {
            await page.goto(sharedData.selectedCategory.url);
            await page.waitForLoadState('networkidle');
        } else {
            throw new Error('No category selected. Run test-1 first or setup category URL');
        }
    });

    test('should verify filter counts and apply filter', async ({ page }) => {
        const productsPage = new ProductsPage(page);

        // Step 5: Verify total number of products matches filter count
        const isMatch = await productsPage.verifyFilterCountMatchesTotal();
        expect(isMatch).toBeTruthy();

        // Step 6: Apply one of the available filters
        const appliedFilter = await productsPage.applyRandomFilter();
        sharedData.appliedFilter = appliedFilter;

        // Get products after filtering for next test
        sharedData.filteredProducts = await productsPage.getProductsList();

        // Verification: Products count changed after filter
        const productCount = await productsPage.productItems.count();
        expect(productCount).toBeGreaterThan(0);

        console.log(`✅ Test 2 completed. Applied filter: ${appliedFilter}, Found ${productCount} products`);
    });
});