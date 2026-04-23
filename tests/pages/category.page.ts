import { Page, Locator } from '@playwright/test';

export class CategoryPage {
    readonly page: Page;
    readonly categories: Locator;
    readonly productCounts: Locator;

    constructor(page: Page) {
        this.page = page;
        this.categories = page.getByText('Sklep Inter Cars – szeroki wybór części, opon i akcesoriów  samochodowych');
        this.productCounts = page.locator('.product-count, .count');
    }

    async getCategoryWithMaxProducts(): Promise<{ name: string; productCount: number; url: string }> {
        // Wait for categories to load
        await this.categories.first().waitFor({ state: 'visible' });

        const categories = await this.categories.all();
        let maxCount = 0;
        let selectedCategory: { name: string; productCount: number; url: string } | null = null;

        for (const category of categories) {
            const name = await category.locator('h2, h3, .title').textContent() || '';
            const countText = await category.locator('.product-count, .count').textContent() || '0';
            const count = parseInt(countText.match(/\d+/)?.[0] || '0');
            const url = await category.locator('a').getAttribute('href') || '';

            if (count > maxCount) {
                maxCount = count;
                selectedCategory = { name, productCount: count, url };
            }
        }

        if (!selectedCategory) {
            throw new Error('No categories found');
        }

        console.log(`Selected category: ${selectedCategory.name} with ${selectedCategory.productCount} products`);
        return selectedCategory;
    }

    async selectCategory(categoryUrl: string) {
        // Handle relative or absolute URLs
        const fullUrl = categoryUrl.startsWith('http')
            ? categoryUrl
            : `https://www.intercars.pl${categoryUrl}`;

        await this.page.goto(fullUrl);
        await this.page.waitForLoadState('networkidle');
    }
}