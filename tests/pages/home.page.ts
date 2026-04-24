import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly menuButton: Locator;
    readonly allOption: Locator;

    constructor(page: Page) {
        this.page = page;
        this.menuButton = page.locator('a[datatest-id="tap-menu-test-main"]');
        this.allOption = page.locator('//a[@datatest-id="tap-menu-test-column" and contains(text(),"Zobacz wszystkie")]');
    }

    async goto() {
        await this.page.goto('https://www.intercars.pl', { waitUntil: 'domcontentloaded' });
        await this.handleCookies();
        await this.handleCaptcha();
    }

    private async handleCaptcha() {
        const captchaPage = this.page.locator('text=Performing security verification');
        const isCaptchaVisible = await captchaPage.isVisible({ timeout: 3000 }).catch(() => false);
        if (isCaptchaVisible) {
            await captchaPage.waitFor({ state: 'hidden', timeout: 60000 });
            await this.page.waitForLoadState('domcontentloaded');
        }
    }

    private async handleCookies() {
        try {
            const acceptBtn = this.page.locator('button[datatest-id="tap-osano-accept"]');
            await acceptBtn.waitFor({ state: 'visible', timeout: 5000 });
            await acceptBtn.click();
        } catch {
            // No cookies banner
        }
    }

    async openAllCategories() {
        await this.menuButton.click();
        await this.allOption.click();
    }
}
