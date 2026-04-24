import { Page, Locator } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly cartIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartIcon = page.locator('a[href="/cart"]');
    }

    async openCart() {
        await this.cartIcon.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator('#card_result').waitFor({ state: 'visible', timeout: 15000 });
    }

    async getTotalFromCart(): Promise<number> {
        const summaryEl = this.page.locator('span.summary-payment-info').first();
        await summaryEl.waitFor({ state: 'visible', timeout: 10000 });
        const text = await summaryEl.textContent() || '0';
        return parseFloat(text.replace(/[^0-9.,]/g, '').replace(',', '.'));
    }
}
