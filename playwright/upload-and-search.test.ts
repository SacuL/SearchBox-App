import { test, expect } from '@playwright/test';
import path from 'path';

test.setTimeout(60e3); // 60 seconds timeout for file operations

test('upload file and search for content', async ({ page }) => {
  // Navigate to the upload page
  await page.goto('/upload');

  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Upload Documents');

  // Create a test file with known content
  const timestamp = Date.now();
  const testContent = `This is a test document for e2e testing.
It contains specific text that we will search for later.
The search term "E2E_TEST_SEARCH_TERM_${timestamp}" should be found in this document.
This document also mentions cars, programming, and JavaScript.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

  // Create a temporary file path with unique name
  const testFilePath = path.join(__dirname, `test-document-${timestamp}.txt`);

  // Write the test content to a file (we'll create this in the test)
  const fs = require('fs');
  fs.writeFileSync(testFilePath, testContent);

  try {
    // Step 1: Upload the file
    console.log('📁 Starting file upload...');

    // Find the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Upload the test file
    await fileInput.setInputFiles(testFilePath);

    // Wait for the file to appear in the file list
    await expect(page.locator(`text=test-document-${timestamp}.txt`)).toBeVisible();

    // Click the upload button
    const uploadButton = page.locator('button:has-text("Upload Files")');
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();

    // Wait for upload to complete (look for upload queue or success message)
    await expect(page.locator('text=Upload Queue')).toBeVisible();

    // Wait for the upload to complete (status should show "Completed")
    // Use first() to avoid strict mode violation when multiple files are uploaded
    await expect(page.locator('text=Completed').first()).toBeVisible({ timeout: 30000 });

    console.log('✅ File upload completed');

    // Step 2: Navigate to search page and search for content
    console.log('🔍 Starting search...');

    // Add a small delay to ensure indexing is complete
    await page.waitForTimeout(2000);

    // Navigate to the search page
    await page.goto('/search');

    // Wait for the search page to load
    await expect(page.locator('h1')).toContainText('Search Documents');

    // Wait for the SearchBar to appear (it only shows when there are documents in the index)

    await expect(page.locator('h2:has-text("Search Documents")')).toBeVisible({ timeout: 10000 });

    // Find the search input
    const searchInput = page.locator('input[placeholder*="search query"]');
    await expect(searchInput).toBeVisible();

    // Type the search term
    await searchInput.fill(`E2E_TEST_SEARCH_TERM_${timestamp}`);

    // Click the search button
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Wait for search results
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify that we found the uploaded file in search results
    // Use a more specific selector to avoid strict mode violations
    await expect(page.locator(`h4:has-text("test-document-${timestamp}.txt")`)).toBeVisible();

    // Verify the file extension is shown
    await expect(page.locator('span.bg-gray-100:has-text("TXT")')).toBeVisible();

    console.log('✅ Search completed successfully');

    // Step 3: Test another search term
    console.log('🔍 Testing another search term...');

    // Clear the search input
    await searchInput.clear();
    await searchInput.fill('cars');

    // Search again
    await searchButton.click();

    // Wait for new search results
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify we still find the file
    await expect(page.locator(`h4:has-text("test-document-${timestamp}.txt")`)).toBeVisible();

    console.log('✅ Second search completed successfully');

    // Step 4: Test search for non-existent content
    console.log('🔍 Testing search for non-existent content...');

    // Clear and search for something that doesn't exist
    await searchInput.clear();
    await searchInput.fill('NONEXISTENT_CONTENT_XYZ');

    // Search again
    await searchButton.click();

    // Wait for search results
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify no results found
    await expect(page.locator('text=No results found')).toBeVisible();

    console.log('✅ No results search completed successfully');

    // Step 5: Test download functionality
    console.log('📥 Testing download functionality...');

    // Search for the file again to get the download button
    await searchInput.clear();
    await searchInput.fill(`E2E_TEST_SEARCH_TERM_${timestamp}`);
    await searchButton.click();

    // Wait for search results
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify download button is present
    const downloadButton = page.locator('button:has-text("Download")');
    await expect(downloadButton).toBeVisible();

    // Test download by clicking the button and checking for download
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;

    // Verify download properties
    expect(download.suggestedFilename()).toBe(`test-document-${timestamp}.txt`);

    console.log('✅ Download functionality completed successfully');
  } finally {
    // Clean up the test file
    try {
      fs.unlinkSync(testFilePath);
      console.log('🧹 Test file cleaned up');
    } catch (error) {
      console.log('⚠️ Could not clean up test file:', error);
    }
  }
});

test('upload multiple files and search across them', async ({ page }) => {
  // Navigate to the upload page
  await page.goto('/upload');

  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Upload Documents');

  // Create multiple test files
  const fs = require('fs');
  const timestamp = Date.now();
  const testFiles = [
    {
      name: `document1-${timestamp}.txt`,
      content: `First document about programming and JavaScript.
This document contains information about web development.
Search term: MULTI_FILE_TEST_1_${timestamp}`,
    },
    {
      name: `document2-${timestamp}.txt`,
      content: `Second document about cars and automobiles.
This document discusses different types of vehicles.
Search term: MULTI_FILE_TEST_2_${timestamp}`,
    },
    {
      name: `document3-${timestamp}.txt`,
      content: `Third document about both programming and cars.
This document combines topics from the other two.
Search term: MULTI_FILE_TEST_3_${timestamp}`,
    },
  ];

  const testFilePaths: string[] = [];

  try {
    // Create test files
    testFiles.forEach((file) => {
      const filePath = path.join(__dirname, file.name);
      fs.writeFileSync(filePath, file.content);
      testFilePaths.push(filePath);
    });

    console.log('📁 Starting multiple file upload...');

    // Find the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Upload all test files at once
    await fileInput.setInputFiles(testFilePaths);

    // Wait for all files to appear in the file list
    for (const file of testFiles) {
      await expect(page.locator(`text=${file.name}`)).toBeVisible();
    }

    // Click the upload button
    const uploadButton = page.locator('button:has-text("Upload Files")');
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();

    // Wait for upload to complete
    await expect(page.locator('text=Upload Queue')).toBeVisible();
    // Wait for all uploads to complete (should have 3 "Completed" statuses)
    await expect(page.locator('text=Completed')).toHaveCount(3, { timeout: 30000 });

    console.log('✅ Multiple files uploaded successfully');

    // Test search that should find multiple files
    console.log('🔍 Testing search across multiple files...');

    // Navigate to the search page
    await page.goto('/search');

    // Wait for the search page to load
    await expect(page.locator('h1')).toContainText('Search Documents');

    // Wait for the SearchBar to appear (it only shows when there are documents in the index)
    await expect(page.locator('h2:has-text("Search Documents")')).toBeVisible({ timeout: 15000 });

    const searchInput = page.locator('input[placeholder*="search query"]');
    await expect(searchInput).toBeVisible();

    // Search for a term that appears in multiple files
    await searchInput.fill('programming');

    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Wait for search results
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify we found multiple files
    // Just check that our specific files appear in the search results

    // Verify specific files are found (use first() to avoid strict mode violation)
    await expect(page.locator(`text=document1-${timestamp}.txt`).first()).toBeVisible();
    await expect(page.locator(`text=document3-${timestamp}.txt`).first()).toBeVisible();

    console.log('✅ Multi-file search completed successfully');
  } finally {
    // Clean up test files
    testFilePaths.forEach((filePath) => {
      try {
        fs.unlinkSync(filePath);
      } catch {
        console.log('⚠️ Could not clean up test file:', filePath);
      }
    });
    console.log('🧹 Test files cleaned up');
  }
});
