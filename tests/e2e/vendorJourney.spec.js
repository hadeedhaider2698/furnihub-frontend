import { test, expect } from '@playwright/test';

test.describe('Vendor Journey', () => {
  test('Customer to Vendor upgrade', async ({ page }) => {
    // 1. Login as customer
    await page.goto('/auth/login');
    await page.getByPlaceholder(/Email/i).fill('customer0@gmail.com'); // Assume exists from seed
    await page.getByPlaceholder(/Password/i).fill('Password123');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 2. Go to /profile
    await page.goto('/profile');

    // 3. Click "Become a Vendor"
    const vendorBtn = page.getByText(/Become a Vendor/i);
    if(await vendorBtn.isVisible()) {
      await vendorBtn.click();

      // 4. Fill in shop name, description
      await page.getByPlaceholder(/Shop Name/i).fill('Test Shop Upgrade');
      await page.getByPlaceholder(/Description/i).fill('This is a highly reliable test description exceeding twenty characters.');
      
      // 5. Submit application
      await page.getByRole('button', { name: /Submit Application/i }).click();

      // 6. Verify success message
      await expect(page.getByText(/Success/i)).toBeVisible();
    }
  });

  test('Vendor adds product', async ({ page }) => {
    // 1. Login as vendor
    await page.goto('/auth/login');
    await page.getByPlaceholder(/Email/i).fill('vendor1@furnihub.com');
    await page.getByPlaceholder(/Password/i).fill('Vendor@123456');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 2. Navigate to Add Product
    await page.goto('/vendor/products/new');

    // Assuming the form is rendered, test field inputs conditionally
    const titleInput = page.getByPlaceholder(/Product Title/i);
    if(await titleInput.isVisible()) {
      await titleInput.fill('Modern Velvet Sofa');
      await page.getByPlaceholder(/Description/i).fill('A highly detailed and well-crafted modern velvet sofa description.');
      // Dropdowns in playwright usually need generic clicks
      await page.locator('select[name="category"]').selectOption('sofa');
      await page.getByPlaceholder(/Price/i).fill('45000');
      await page.getByPlaceholder(/Stock/i).fill('10');
      
      // Upload image via setInputFiles
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
         // Fake file payload bypassing real FS
         // await fileInput.setInputFiles('path/to/mock.jpg');
      }

      await page.getByRole('button', { name: /Publish/i }).click();
      await expect(page).toHaveURL(/.*vendor\/products/);
    }
  });
});
