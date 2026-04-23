import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';
import { CartPage } from '../pages/cart.page';
import { sharedData, ProductData } from '../fixtures/test-data';

test.describe('Cart and Price Verification', () => {
    let productsPage: ProductsPage;
    let cartPage: CartPage;
    let addedProducts: ProductData[] = [];

    test.beforeEach(async ({ page }) => {
        // Ensure we're on products page with filters applied
        if (sharedData.selectedCategory?.url) {
            await page.goto(sharedData.selectedCategory.url);
            await page.waitForLoadState('networkidle');

            // Re-apply filter if needed
            if (sharedData.appliedFilter) {
                // Re-apply the same filter logic
                await page.locator(`.filter-option:has-text("${sharedData.appliedFilter}")`).click();
                await page.waitForLoadState('networkidle');
            }
        } else {
            throw new Error('No category data available. Run test-1 first');
        }

        productsPage = new ProductsPage(page);
        cartPage = new CartPage(page);
    });

    test('should add 2 products to cart and verify prices', async ({ page }) => {
        // Get products list before adding to cart
        const productsList = await productsPage.getProductsList();
        expect(productsList.length).toBeGreaterThanOrEqual(2);

        // Step 7: Add 2 products to the cart
        for (let i = 0; i < 2; i++) {
            const product = await productsPage.addProductToCart(i);
            addedProducts.push(product);
        }

        // Store for verification
        sharedData.addedProducts = addedProducts;

        // Open cart
        await cartPage.openCart();

        // Step 8: Compare prices and verify total
        const cartProducts = await cartPage.getCartProducts();
        const cartTotal = await cartPage.getTotalFromCart();

        // Verify each product price matches
        for (let i = 0; i < addedProducts.length; i++) {
            const addedProduct = addedProducts[i];
            const cartProduct = cartProducts[i];

            expect(cartProduct.name).toContain(addedProduct.name.substring(0, 20));
            expect(cartProduct.price).toBeCloseTo(addedProduct.price, 2);

            console.log(`Price match: ${addedProduct.name} - List: ${addedProduct.price} PLN, Cart: ${cartProduct.price} PLN`);
        }

        // Calculate expected total
        const expectedTotal = addedProducts.reduce((sum, product) => sum + product.price, 0);

        // Verify total price
        expect(cartTotal).toBeCloseTo(expectedTotal, 2);

        console.log(`✅ Test 3 completed. Expected total: ${expectedTotal} PLN, Cart total: ${cartTotal} PLN`);
    });
});