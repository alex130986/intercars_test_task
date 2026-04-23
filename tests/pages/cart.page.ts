import { Page, Locator } from '@playwright/test';
import { ProductData } from '../fixtures/test-data';

export class CartPage {
    readonly page: Page;
    readonly cartItems: Locator;
    readonly itemPrices: Locator;
    readonly itemNames: Locator;
    readonly totalPrice: Locator;
    readonly cartIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartIcon = page.locator('.cart-icon, .cart-button');
        this.cartItems = page.locator('.cart-item, .basket-item');
        this.itemPrices = page.locator('.price, .item-price');
        this.itemNames = page.locator('.product-name, .item-name');
        this.totalPrice = page.locator('.total-price, .summary-price, .total-amount');
    }

    async openCart() {
        await this.cartIcon.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }

    async getCartProducts(): Promise<ProductData[]> {
        const products: ProductData[] = [];
        const count = await this.cartItems.count();

        for (let i = 0; i < count; i++) {
            const name = await this.itemNames.nth(i).textContent() || `Cart item ${i}`;
            const priceText = await this.itemPrices.nth(i).textContent() || '0';
            const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));

            products.push({
                name: name.trim(),
                price,
                id: `cart-${i}`
            });
        }

        return products;
    }

    async getTotalFromCart(): Promise<number> {
        const totalText = await this.totalPrice.textContent() || '0';
        const total = parseFloat(totalText.replace(/[^0-9.,]/g, '').replace(',', '.'));
        console.log(`Total from cart: ${total} PLN`);
        return total;
    }
}