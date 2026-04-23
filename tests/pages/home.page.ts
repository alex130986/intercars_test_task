import {Page, Locator} from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly menuButton: Locator;
    readonly allOption: Locator;
    readonly seeAllLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.menuButton = page.locator('a[datatest-id="tap-menu-test-main"]');
        this.allOption = page.locator('//a[@datatest-id="tap-menu-test-column" and contains(text(),"Zobacz wszystkie")]');
        //this.seeAllLink = page.locator('a:has-text("See All"), button:has-text("See All")');
    }

    async goto() {
        await this.page.goto('https://www.intercars.pl');
        // Cookies handling
        await this.handleCookies();
        // Manual CAPTCHA handling
        await this.handleCaptcha();
    }

    private async handleCaptcha() {
        const captcha = this.page.locator('iframe[title*="captcha"], .captcha');
        const isCaptchaVisible = await captcha.isVisible({timeout: 3000}).catch(() => false);
        if (isCaptchaVisible) {
            console.log('CAPTCHA detected! Please solve it manually within 30 seconds...');
            await this.page.waitForTimeout(30000);
        }
    }

    private async handleCookies() {
        try {
            const acceptCookiesButton = this.page.locator('button[datatest-id="tap-osano-accept"]');
            
            await acceptCookiesButton.waitFor({state: 'visible', timeout: 30000});
            await acceptCookiesButton.click();
            console.log('Cookies accepted');
            return true;
        } catch (error) {
            console.log('Cookies button not found or not clickable');
            return false;
        }
    }

    async openAllCategories() {
        // await this.menuButton.waitFor({state: 'visible'});
        await this.menuButton.click();
        await this.allOption.click();
        // await this.allOption.hover();
        // await this.seeAllLink.click();
    }
}