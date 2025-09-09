import { test, expect } from '@playwright/test';

test.setTimeout(35e3);

test('loads the SearchBox homepage', async ({ page }) => {
  await page.goto('/');

  // Check that the main heading is visible
  await expect(page.locator('h1')).toContainText('SearchBox App');
});

test('file upload interface is functional', async ({ page }) => {
  await page.goto('/upload');

  // Check that the file input is present (it's hidden but exists)
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeAttached();

  // Check that the upload button is present and clickable
  const uploadButton = page.locator('button:has-text("Select Files")');
  await expect(uploadButton).toBeVisible();
  await expect(uploadButton).toBeEnabled();

  // Check that the drag and drop area is present
  const dragDropArea = page.locator('text=Drag and drop files here');
  await expect(dragDropArea).toBeVisible();

  // Check that file type restrictions are mentioned
  await expect(page.locator('text=Max size per file: 50.0MB')).toBeVisible();

  // Check that the file input has the correct accept attribute
  await expect(fileInput).toHaveAttribute('accept', '.txt,.md,.pdf,.docx');

  // Check that the file input allows multiple files
  await expect(fileInput).toHaveAttribute('multiple');
});

test('homepage navigation works correctly', async ({ page }) => {
  await page.goto('/');

  // Check that the main heading is visible
  await expect(page.locator('h1')).toContainText('SearchBox App');

  // Check that both navigation cards are present
  await expect(page.locator('text=Upload Documents')).toBeVisible();
  await expect(page.locator('text=Search Documents')).toBeVisible();

  // Test navigation to upload page
  await page.click('text=Start Uploading');
  await expect(page.locator('h1')).toContainText('Upload Documents');

  // Navigate back to homepage
  await page.goto('/');

  // Test navigation to search page
  await page.click('text=Start Searching');
  await expect(page.locator('h1')).toContainText('Search Documents');
});
