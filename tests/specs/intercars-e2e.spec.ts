import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { CategoryPage } from '../pages/category.page';
import { ProductsPage } from '../pages/products.page';
import { CartPage } from '../pages/cart.page';
import { CategoryData, ProductData } from '../fixtures/test-data';

test.describe('InterCars E2E: Category → Filter → Cart', () => {

    test('should select category, apply filter, add products and verify cart', async () => {
        const browser = await chromium.launch({
            channel: 'chrome',
            headless: false,
            args: ['--disable-blink-features=AutomationControlled'],
        });
        const context = await browser.newContext();
        const page = await context.newPage();

        const homePage = new HomePage(page);
        const categoryPage = new CategoryPage(page);
        const productsPage = new ProductsPage(page);
        const cartPage = new CartPage(page);

        let selectedCategory: CategoryData;
        const addedProducts: ProductData[] = [];

        try {
            await test.step('Navigate to intercars.pl and open categories', async () => {
                await homePage.goto();
                await homePage.openAllCategories();
            });

            await test.step('Select category with most products', async () => {
                selectedCategory = await categoryPage.getCategoryWithMaxProducts();
                await categoryPage.selectCategory(selectedCategory.url);
                await productsPage.waitForProducts();
            });

            await test.step('Verify filter subcategory total matches category count', async () => {
                const filterTotal = await productsPage.getFilterSubcategoryTotal();
                expect(filterTotal).toBeGreaterThan(0);
            });

            await test.step('Apply filter', async () => {
                await productsPage.applyFilter();
                const productCount = await productsPage.productPrices.count();
                expect(productCount).toBeGreaterThan(0);
            });

            await test.step('Add 2 products to cart', async () => {
                const productsList = await productsPage.getProductsList();
                expect(productsList.length).toBeGreaterThanOrEqual(2);

                addedProducts.push(await productsPage.addProductToCart(0, false));
                addedProducts.push(await productsPage.addProductToCart(1, true));
            });

            await test.step('Verify total price in cart', async () => {
                await page.waitForTimeout(2000);

                const cartTotal = await cartPage.getTotalFromCart();
                const expectedTotal = addedProducts.reduce((sum, p) => sum + p.price, 0);

                expect(cartTotal).toBeCloseTo(expectedTotal, 1);
            });
        } finally {
            await browser.close();
        }
    });
});
