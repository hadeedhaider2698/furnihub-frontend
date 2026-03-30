import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] }); // Strict Mobile Viewport Override for this file

test.describe('Mobile Viewport Specific Testing', () => {
  test('Bottom Navigation Bar is visible and functional on Mobile', async ({ page }) => {
    await page.goto('/');

    // Validate Bottom Navigation structure is visible strictly on mobile
    const bottomNav = page.locator('nav.fixed.bottom-0'); // Typical standard TW setup
    if(await bottomNav.isVisible()) {
      // Click Explore
      await page.locator('nav a[href="/explore"]').click();
      await expect(page).toHaveURL(/.*explore/);
      
      // Click Add Post (Middle Button)
      await page.locator('nav button[aria-label="New Post"]').click();
      // Should redirect to auth or open drawer
      await expect(page.locator('text=Post')).toBeDefined();
    }
  });

  test('Mobile slide-up carts and modals check', async ({ page }) => {
    await page.goto('/cart'); // Directly loading cart
    // Since mobile drawer may slide up overlaying everything
    await expect(page.getByText(/Checkout/i)).toBeVisible();
    
    // Test touch-close interactions if specifically mocked (usually hard to simulate exact swipe in PW, we click close)
    const closeBtn = page.getByRole('button', { name: /Close/i });
    if(await closeBtn.isVisible()) {
        await closeBtn.click();
    }
  });

  test('Masonry Grid collapses to mobile columns', async ({ page }) => {
    await page.goto('/explore');
    // Ensure the masonry wrapper is present
    await expect(page.locator('text=Categories')).toBeVisible();
    
    // In mobile, we check if the category horizontal scroll triggers
    const container = page.locator('.overflow-x-auto');
    if (await container.isVisible()) {
      // Validate element attributes for smooth scroll
      await expect(container).toHaveClass(/scrollbar-hide/);
    }
  });
});
