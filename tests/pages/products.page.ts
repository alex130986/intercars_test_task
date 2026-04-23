import {Page, Locator} from '@playwright/test';
import {ProductData} from '../fixtures/test-data';

export class ProductsPage {
    readonly page: Page;
    readonly filterMenu: Locator;
    readonly filterOptions: Locator;
    readonly productItems: Locator;
    readonly productPrices: Locator;
    readonly productNames: Locator;
    readonly addToCartButtons: Locator;
    readonly totalProductsCount: Locator;

    constructor(page: Page) {
        this.page = page;
        this.filterMenu = page.locator('.filter-menu, .filters');
        this.filterOptions = page.locator('.filter-option, .filter-item');
        this.productItems = page.locator('.product-item, .product');
        this.productPrices = page.locator('.price, .product-price');
        this.productNames = page.locator('.product-name, .name');
        this.addToCartButtons = page.locator('button:has-text("Add to cart"), .add-to-cart');
        this.totalProductsCount = page.locator('.total-products, .products-count');
    }

    async verifyFilterCountMatchesTotal(): Promise<boolean> {
        // Get total from filter menu
        const filterTotalText = await this.filterMenu.locator('.total-count, .all-products').textContent() || '0';
        const filterTotal = parseInt(filterTotalText.match(/\d+/)?.[0] || '0');

        // Get actual product count on page
        const actualProducts = await this.productItems.count();

        console.log(`Filter total: ${filterTotal}, Actual products: ${actualProducts}`);
        return filterTotal === actualProducts;
    }

    async applyRandomFilter(): Promise<string> {
        const filters = await this.filterOptions.all();
        if (filters.length === 0) throw new Error('No filters available');

        // Select random filter (skip first if it's "All")
        const randomIndex = Math.floor(Math.random() * (filters.length - 1)) + 1;
        const selectedFilter = filters[randomIndex];
        const filterName = await selectedFilter.textContent() || 'Unknown filter';

        await selectedFilter.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000); // Wait for products to reload

        console.log(`Applied filter: ${filterName}`);
        return filterName;
    }

    async getProductsList(): Promise<ProductData[]> {
        const products: ProductData[] = [];
        const count = await this.productItems.count();

        for (let i = 0; i < Math.min(count, 10); i++) {
            const name = await this.productNames.nth(i).textContent() || `Product ${i}`;
            const priceText = await this.productPrices.nth(i).textContent() || '0';
            const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));

            products.push({
                name: name.trim(),
                price,
                id: `product-${i}`
            });
        }

        return products;
    }

    async addProductToCart(productIndex: number): Promise<ProductData> {
        const product = {
            name: await this.productNames.nth(productIndex).textContent() || `Product ${productIndex}`,
            price: parseFloat((await this.productPrices.nth(productIndex).textContent() || '0').replace(/[^0-9.,]/g, '').replace(',', '.')),
            id: `product-${productIndex}`
        };

        await this.addToCartButtons.nth(productIndex).click();
        await this.page.waitForTimeout(1000); // Wait for add to cart animation

        // Handle possible modal/popup
        const closeButton = this.page.locator('button:has-text("Close"), .close-modal');
        if (await closeButton.isVisible({timeout: 2000}).catch(() => false)) {
            await closeButton.click();
        }

        console.log(`Added to cart: ${product.name} for ${product.price} PLN`);
        return product;
    }
}