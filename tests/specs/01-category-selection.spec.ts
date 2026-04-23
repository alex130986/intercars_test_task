import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { CategoryPage } from '../pages/category.page';
import { sharedData } from '../fixtures/test-data';

test.describe('Navigation and Category Selection', () => {
    test('should navigate to intercars.pl and select category with most products', async ({ page }) => {
        const homePage = new HomePage(page);
        const categoryPage = new CategoryPage(page);

        // Step 1: Go to intercars.pl
        await homePage.goto();

        // Step 2: From Menu select All → See All
        await homePage.openAllCategories();

        // Step 3: Dynamically select category with highest number of products
        const selectedCategory = await categoryPage.getCategoryWithMaxProducts();

        // Store for later tests
        sharedData.selectedCategory = selectedCategory;

        // Step 4: Navigate to the selected category
        await categoryPage.selectCategory(selectedCategory.url);
        
        const productList = page.locator('.product-item, .product');
        await expect(productList).toBeVisible({ timeout: 10000 });

        console.log(`✅ Test 1 completed. Selected category: ${selectedCategory.name} with ${selectedCategory.productCount} products`);
    });
});