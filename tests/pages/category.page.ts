import { Page, Locator } from '@playwright/test';
import { CategoryData } from '../fixtures/test-data';

export class CategoryPage {
    readonly page: Page;
    readonly categoryLinks: Locator;

    constructor(page: Page) {
        this.page = page;
        this.categoryLinks = page.locator('a:has-text(")")').filter({ hasText: /\(\d+\)/ });
    }

    async getCategoryWithMaxProducts(): Promise<CategoryData> {
        await this.categoryLinks.first().waitFor({ state: 'visible', timeout: 15000 });
        const allLinks = await this.categoryLinks.all();

        let maxCount = 0;
        let bestCategory: CategoryData | null = null;

        for (const link of allLinks) {
            const text = await link.textContent() || '';
            const match = text.match(/\((\d+)\)/);
            if (!match) continue;

            const count = parseInt(match[1]);
            const name = text.replace(/\(\d+\)/, '').trim();
            const url = await link.getAttribute('href') || '';

            if (count > maxCount) {
                maxCount = count;
                bestCategory = { name, productCount: count, url };
            }
        }

        if (!bestCategory) {
            throw new Error('No categories found on the page');
        }
        return bestCategory;
    }

    async selectCategory(categoryUrl: string) {
        const fullUrl = categoryUrl.startsWith('http')
            ? categoryUrl
            : `https://www.intercars.pl${categoryUrl}`;
        await this.page.goto(fullUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }
}
