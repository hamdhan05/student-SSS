import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

// Create screenshots directory structure
function setupDirectories() {
  const dirs = [
    'screenshots/01-authentication',
    'screenshots/02-headmaster/students',
    'screenshots/02-headmaster/teachers',
    'screenshots/02-headmaster/notices',
    'screenshots/02-headmaster/calendar',
    'screenshots/02-headmaster/fees',
    'screenshots/02-headmaster/complaints',
    'screenshots/03-teacher/attendance',
    'screenshots/03-teacher/homework',
    'screenshots/03-teacher/marks',
    'screenshots/04-student/academics',
    'screenshots/04-student/timetable',
    'screenshots/04-student/homework',
    'screenshots/04-student/attendance',
    'screenshots/04-student/notices',
    'screenshots/04-student/complaints',
    'screenshots/05-ui-components',
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Helper function to wait and take screenshot
async function captureScreen(page: Page, name: string, folder: string = '') {
  await page.waitForTimeout(1500); // Wait for animations
  const fullPath = folder 
    ? path.join(SCREENSHOTS_DIR, folder, `${name}.png`)
    : path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: fullPath, fullPage: false });
  console.log(`✓ Captured: ${name}`);
}

async function captureAuthentication(page: Page) {
  console.log('\n📸 Capturing Authentication Screenshots...');
  
  // Login page
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await captureScreen(page, 'login-page', '01-authentication');
  
  // Scroll to show credentials
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await captureScreen(page, 'login-credentials-shown', '01-authentication');
}

async function loginAs(page: Page, role: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', `${role}@school.com`);
  await page.fill('input[type="password"]', 'password123');
  await captureScreen(page, `${role}-login-form`, '01-authentication');
  
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function captureHeadmasterPortal(page: Page) {
  console.log('\n📸 Capturing Headmaster Portal Screenshots...');
  
  await loginAs(page, 'headmaster');
  await captureScreen(page, 'dashboard', '02-headmaster');
  
  // Students Tab
  console.log('  → Students tab...');
  await page.click('text=Students');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'students-list', '02-headmaster/students');
  
  // Search students
  await page.fill('input[placeholder*="Search"]', 'John');
  await page.waitForTimeout(500);
  await captureScreen(page, 'students-search-results', '02-headmaster/students');
  await page.fill('input[placeholder*="Search"]', '');
  
  // Filter by class
  const classSelect = page.locator('select').first();
  await classSelect.selectOption('10');
  await page.waitForTimeout(500);
  await captureScreen(page, 'students-filters-applied', '02-headmaster/students');
  
  // Add student modal
  await page.click('text=Add Student');
  await page.waitForTimeout(500);
  await captureScreen(page, 'add-student-modal', '02-headmaster/students');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Click on first student for details
  const firstStudent = page.locator('.card').first();
  if (await firstStudent.isVisible()) {
    await firstStudent.click();
    await page.waitForTimeout(500);
    await captureScreen(page, 'student-detail-view', '02-headmaster/students');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
  
  // Teachers Tab
  console.log('  → Teachers tab...');
  await page.click('text=Teachers');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'teachers-list', '02-headmaster/teachers');
  
  // Search teachers
  await page.fill('input[placeholder*="Search"]', 'Smith');
  await page.waitForTimeout(500);
  await captureScreen(page, 'teachers-search', '02-headmaster/teachers');
  await page.fill('input[placeholder*="Search"]', '');
  
  // Add teacher modal
  await page.click('text=Add Teacher');
  await page.waitForTimeout(500);
  await captureScreen(page, 'add-teacher-modal', '02-headmaster/teachers');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Click on first teacher
  const firstTeacher = page.locator('.card').first();
  if (await firstTeacher.isVisible()) {
    await firstTeacher.click();
    await page.waitForTimeout(500);
    await captureScreen(page, 'teacher-detail-view', '02-headmaster/teachers');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
  
  // Notice Board Tab
  console.log('  → Notice Board tab...');
  await page.click('text=Notice Board');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'notices-list', '02-headmaster/notices');
  
  // Create notice modal
  await page.click('button:has-text("Create Notice")');
  await page.waitForTimeout(500);
  await captureScreen(page, 'create-notice-modal', '02-headmaster/notices');
  
  // Fill notice form
  await page.fill('input[placeholder*="title"], input[name="title"]', 'Important Announcement');
  await page.fill('textarea', 'This is a sample notice for testing purposes.');
  await page.waitForTimeout(300);
  await captureScreen(page, 'notice-form-filled', '02-headmaster/notices');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Calendar Tab
  console.log('  → Calendar tab...');
  await page.click('text=Calendar');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'calendar-view', '02-headmaster/calendar');
  await captureScreen(page, 'holiday-list', '02-headmaster/calendar');
  
  // Fees Tab
  console.log('  → Fees tab...');
  await page.click('text=Fees');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'fees-summary-dashboard', '02-headmaster/fees');
  
  // Scroll to see fee records
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(300);
  await captureScreen(page, 'fees-student-list', '02-headmaster/fees');
  
  // Filter fees
  await page.evaluate(() => window.scrollTo(0, 0));
  const feeClassSelect = page.locator('select').first();
  await feeClassSelect.selectOption('10');
  await page.waitForTimeout(500);
  await captureScreen(page, 'fees-filters', '02-headmaster/fees');
  
  // Complaints Tab
  console.log('  → Complaints tab...');
  await page.click('text=Complaints');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'complaints-list', '02-headmaster/complaints');
  
  // Click on a complaint if exists
  const firstComplaint = page.locator('.card').first();
  if (await firstComplaint.isVisible()) {
    await firstComplaint.click();
    await page.waitForTimeout(500);
    await captureScreen(page, 'complaint-detail-view', '02-headmaster/complaints');
    await page.keyboard.press('Escape');
  }
  
  // Logout
  await page.click('button:has-text("Logout")');
  await page.waitForTimeout(1000);
}

async function captureTeacherPortal(page: Page) {
  console.log('\n📸 Capturing Teacher Portal Screenshots...');
  
  await loginAs(page, 'teacher');
  await captureScreen(page, 'dashboard', '03-teacher');
  
  console.log('  → Attendance marking...');
  
  // Class selection
  await page.waitForTimeout(1000);
  await captureScreen(page, 'class-selection', '03-teacher/attendance');
  
  // Select class
  const classSelect = page.locator('select').first();
  await classSelect.selectOption('10');
  await page.waitForTimeout(500);
  
  // Select section
  const sectionSelect = page.locator('select').nth(1);
  await sectionSelect.selectOption('A');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'attendance-grid', '03-teacher/attendance');
  
  // Mark all present
  await page.click('button:has-text("Mark All Present")');
  await page.waitForTimeout(500);
  await captureScreen(page, 'mark-all-present', '03-teacher/attendance');
  
  // Mark all absent
  await page.click('button:has-text("Mark All Absent")');
  await page.waitForTimeout(500);
  await captureScreen(page, 'mark-all-absent', '03-teacher/attendance');
  
  // Toggle individual student
  await page.click('button:has-text("Mark All Present")');
  await page.waitForTimeout(300);
  const firstToggle = page.locator('button:has-text("Present")').first();
  if (await firstToggle.isVisible()) {
    await firstToggle.click();
    await page.waitForTimeout(300);
    await captureScreen(page, 'individual-toggle', '03-teacher/attendance');
  }
  
  // Submit attendance
  await captureScreen(page, 'attendance-submit-button', '03-teacher/attendance');
  
  // Homework tab
  console.log('  → Homework tab...');
  await page.click('text=Homework');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'homework-list', '03-teacher/homework');
  
  // Marks tab
  console.log('  → Marks tab...');
  await page.click('text=Marks');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'marks-entry', '03-teacher/marks');
  
  // Logout
  try {
    await page.click('button:has-text("Logout")', { timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('⚠️  Logout button not found, navigating to login manually');
    await page.goto(`${BASE_URL}/login`);
  }
}

async function captureStudentPortal(page: Page) {
  console.log('\n📸 Capturing Student Portal Screenshots...');
  
  await loginAs(page, 'student');
  await captureScreen(page, 'dashboard', '04-student');
  
  // Academics Tab
  console.log('  → Academics tab...');
  await page.click('text=Academics');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'academics-overview', '04-student/academics');
  await captureScreen(page, 'marks-view', '04-student/academics');
  
  // Timetable Tab
  console.log('  → Timetable tab...');
  await page.click('text=Timetable');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'timetable-view', '04-student/timetable');
  
  // Homework Tab
  console.log('  → Homework tab...');
  await page.click('text=Homework');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'homework-list', '04-student/homework');
  
  // Attendance Tab
  console.log('  → Attendance tab...');
  await page.click('text=Attendance');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'attendance-overview', '04-student/attendance');
  await captureScreen(page, 'attendance-percentage', '04-student/attendance');
  
  // Notices Tab
  console.log('  → Notices tab...');
  await page.click('text=Notices');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'notices-view', '04-student/notices');
  
  // Complaints Tab
  console.log('  → Complaints tab...');
  await page.click('text=Submit Complaint');
  await page.waitForTimeout(1000);
  await captureScreen(page, 'complaint-form-empty', '04-student/complaints');
  
  // Fill complaint form
  await page.fill('input[name="title"]', 'Sample Complaint');
  await page.fill('textarea[name="description"]', 'This is a test complaint for demonstration purposes.');
  await page.waitForTimeout(300);
  await captureScreen(page, 'complaint-form-filled', '04-student/complaints');
  
  // Logout
  try {
    await page.click('button:has-text("Logout")', { timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('⚠️  Logout button not found, navigating to login manually');
    await page.goto(`${BASE_URL}/login`);
  }
}

async function captureUIComponents(page: Page) {
  console.log('\n📸 Capturing UI Components...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // Capture glassmorphism effect
  await captureScreen(page, 'glassmorphism-effect', '05-ui-components');
  
  // Capture responsive views
  await page.setViewportSize({ width: 1920, height: 1080 });
  await captureScreen(page, 'responsive-desktop', '05-ui-components');
  
  await page.setViewportSize({ width: 768, height: 1024 });
  await captureScreen(page, 'responsive-tablet', '05-ui-components');
  
  await page.setViewportSize({ width: 375, height: 667 });
  await captureScreen(page, 'responsive-mobile', '05-ui-components');
  
  // Reset viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
}

async function main() {
  console.log('🚀 Starting automated screenshot capture...\n');
  
  // Setup directories
  setupDirectories();
  console.log('✓ Created screenshot directories');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 100 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  try {
    // Capture all screenshots
    await captureAuthentication(page);
    await captureHeadmasterPortal(page);
    await captureTeacherPortal(page);
    await captureStudentPortal(page);
    await captureUIComponents(page);
    
    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved in: ${SCREENSHOTS_DIR}`);
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

main();
