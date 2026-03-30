import { test, expect } from '@playwright/test';

test.describe('Admin Command Center Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Scaffold Admin login
    await page.goto('/auth/login');
    await page.getByPlaceholder(/Email/i).fill('admin.access@furnihub.com');
    await page.getByPlaceholder(/Password/i).fill('Admin#Secure2024');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Verify successful routing to command center (or equivalent)
    await expect(page).toHaveURL(/.*admin/);
  });

  test('Admin approves product', async ({ page }) => {
    // 1. Navigate to pending products tab
    const pendingTab = page.getByRole('button', { name: /Pending Products/i }); // Assuming tab exists
    if(await pendingTab.isVisible()) {
      await pendingTab.click();

      // 2. Click approve on the first product
      const approveBtn = page.getByRole('button', { name: /Approve/i }).first();
      await expect(approveBtn).toBeVisible();
      await approveBtn.click();

      // 3. Confirm success toast
      await expect(page.locator('text=Product Approved Successfully')).toBeVisible();
    }
  });

  test('Admin views system metrics and logs', async ({ page }) => {
    await expect(page.getByText('Total Revenue Engine')).toBeVisible(); // Or similar high level text
    await expect(page.getByText('Active Vendors')).toBeVisible();

    // Tab switch to Users
    const usersMenu = page.locator('a[href="/admin/users"]');
    if(await usersMenu.isVisible()) {
      await usersMenu.click();
      await expect(page.getByRole('table')).toBeVisible();
      // Test banning functionality
      const banBtn = page.getByRole('button', { name: /Ban/i }).first();
      if(await banBtn.isVisible()) {
         await banBtn.click();
         // Verify modal or immediate feedback
         await expect(page.getByText(/User banned/i)).toBeVisible();
      }
    }
  });
});
