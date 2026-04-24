import { Page, Locator } from '@playwright/test';
import { ProductData } from '../fixtures/test-data';

export class ProductsPage {
    readonly page: Page;
    readonly filterGroups: Locator;
    readonly filterCounts: Locator;
    readonly productPrices: Locator;
    readonly addToCartButtons: Locator;

    constructor(page: Page) {
        this.page = page;
        this.filterGroups = page.locator('div#collapse div.btn-groups:not(.btn-group-back)');
        this.filterCounts = page.locator('div#collapse div.btn-groups:not(.btn-group-back) span.count');
        this.productPrices = page.locator('[datatest-id="tap-item-product-price"].gross');
        this.addToCartButtons = page.locator('button.addtocard:visible');
    }

    async waitForProducts() {
        await this.productPrices.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async getFilterSubcategoryTotal(): Promise<number> {
        await this.filterCounts.first().waitFor({ state: 'visible', timeout: 10000 });
        const counts = await this.filterCounts.all();
        let total = 0;

        for (const countEl of counts) {
            const text = await countEl.textContent() || '0';
            const match = text.match(/(\d+)/);
            if (match) {
                total += parseInt(match[1]);
            }
        }
        return total;
    }

    async applyFilter(index: number = 0): Promise<string> {
        const filterLink = this.filterGroups.nth(index).locator('a.btn-link');
        await filterLink.waitFor({ state: 'visible', timeout: 10000 });
        const filterName = await filterLink.locator('span.group-filter-name').textContent() || 'Unknown';

        await filterLink.click();
        await this.page.waitForLoadState('load');
        await this.waitForProducts();

        return filterName.trim();
    }

    async getProductsList(): Promise<ProductData[]> {
        const products: ProductData[] = [];
        const count = await this.productPrices.count();

        for (let i = 0; i < Math.min(count, 10); i++) {
            const priceText = await this.productPrices.nth(i).textContent() || '0';
            const price = parseFloat(priceText.replace(',', '.'));
            products.push({ name: `Product ${i}`, price, id: `product-${i}` });
        }
        return products;
    }

    /**
     * Add product to cart and handle the modal.
     * @param productIndex - index of the product in the list
     * @param goToCart - if true, clicks "Przejdź do koszyka" to navigate to cart;
     *                   if false, clicks "Kontynuuj zakupy" to stay on the page
     */
    async addProductToCart(productIndex: number, goToCart: boolean = false): Promise<ProductData> {
        const priceText = await this.productPrices.nth(productIndex).textContent() || '0';
        const price = parseFloat(priceText.replace(',', '.'));
        const product: ProductData = { name: `Product ${productIndex}`, price, id: `product-${productIndex}` };

        await this.addToCartButtons.nth(productIndex).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.addToCartButtons.nth(productIndex).click();

        const modal = this.page.locator('#modalAddToCard');
        await modal.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForTimeout(1500);

        if (goToCart) {
            const goToCartBtn = modal.locator('button[datatest-id="tap-addtobasket-basket"]');
            await goToCartBtn.click();
            await this.page.waitForTimeout(3000);
            if (!this.page.url().includes('/cart')) {
                await this.page.goto('https://intercars.pl/cart/', { waitUntil: 'domcontentloaded' });
            }
        } else {
            await modal.locator('button[datatest-id="tap-addtobasket-continue"]').click();
            await modal.waitFor({ state: 'hidden', timeout: 5000 });
            await this.page.waitForTimeout(1500);
        }

        return product;
    }
}
