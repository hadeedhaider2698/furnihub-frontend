import { test, expect } from '@playwright/test';

test.describe('Authentication Edge Cases', () => {
  test('Login failure scenarios', async ({ page }) => {
    await page.goto('/auth/login');

    // Mismatched credentials
    await page.getByPlaceholder(/Email/i).fill('fake@wrong.com');
    await page.getByPlaceholder(/Password/i).fill('invalidpass');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Expecting error toast
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test('Registration Form validation flows', async ({ page }) => {
    await page.goto('/auth/register');

    // Attempting submit without filling required fields
    const submitBtn = page.getByRole('button', { name: /Create Account/i });
    // Assuming button might be disabled, so we conditionally test
    if (await submitBtn.isEnabled()) {
       await submitBtn.click();
       await expect(page.getByText(/email is required/i)).toBeVisible();
    }

    // Checking password mismatch
    await page.getByPlaceholder(/Full Name/i).fill('Test Name');
    await page.getByPlaceholder(/Email address/i).fill('test@live.com');
    await page.getByPlaceholder(/Create a password/i).fill('Password123');
    await page.getByPlaceholder(/Confirm your password/i).fill('PasswordWrong');
    
    // Depending on form implementation, error may span inline
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });
});
