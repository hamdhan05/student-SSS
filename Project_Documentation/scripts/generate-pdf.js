const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📄 Generating PDF report...\n');

const reportPath = path.join(process.cwd(), 'PROJECT_REPORT.md');
const outputPath = path.join(process.cwd(), 'Project_Report.pdf');
const screenshotsDir = path.join(process.cwd(), 'screenshots');

// Check if screenshots exist
if (!fs.existsSync(screenshotsDir)) {
  console.error('❌ Screenshots folder not found!');
  console.log('Please run: npm run capture-screenshots first');
  process.exit(1);
}

// Update markdown with screenshot paths
console.log('📝 Updating report with screenshot references...');

let reportContent = fs.readFileSync(reportPath, 'utf-8');

// Map of placeholders to actual screenshots
const screenshotMap = {
  'login-page.png': './screenshots/01-authentication/login-page.png',
  'login-credentials-shown.png': './screenshots/01-authentication/login-credentials-shown.png',
  'headmaster-login.png': './screenshots/01-authentication/headmaster-login-form.png',
  'teacher-login.png': './screenshots/01-authentication/teacher-login-form.png',
  'student-login.png': './screenshots/01-authentication/student-login-form.png',
  
  // Headmaster screenshots
  'headmaster-dashboard.png': './screenshots/02-headmaster/dashboard.png',
  'students-list.png': './screenshots/02-headmaster/students/students-list.png',
  'students-search-results.png': './screenshots/02-headmaster/students/students-search-results.png',
  'students-filters-applied.png': './screenshots/02-headmaster/students/students-filters-applied.png',
  'add-student-modal.png': './screenshots/02-headmaster/students/add-student-modal.png',
  'student-detail-view.png': './screenshots/02-headmaster/students/student-detail-view.png',
  
  'teachers-list.png': './screenshots/02-headmaster/teachers/teachers-list.png',
  'teachers-search.png': './screenshots/02-headmaster/teachers/teachers-search.png',
  'add-teacher-modal.png': './screenshots/02-headmaster/teachers/add-teacher-modal.png',
  'teacher-detail-view.png': './screenshots/02-headmaster/teachers/teacher-detail-view.png',
  
  'notices-list.png': './screenshots/02-headmaster/notices/notices-list.png',
  'create-notice-modal.png': './screenshots/02-headmaster/notices/create-notice-modal.png',
  'notice-form-filled.png': './screenshots/02-headmaster/notices/notice-form-filled.png',
  
  'calendar-view.png': './screenshots/02-headmaster/calendar/calendar-view.png',
  'holiday-list.png': './screenshots/02-headmaster/calendar/holiday-list.png',
  
  'fees-summary-dashboard.png': './screenshots/02-headmaster/fees/fees-summary-dashboard.png',
  'fees-student-list.png': './screenshots/02-headmaster/fees/fees-student-list.png',
  'fees-filters.png': './screenshots/02-headmaster/fees/fees-filters.png',
  
  'complaints-list.png': './screenshots/02-headmaster/complaints/complaints-list.png',
  'complaint-detail-view.png': './screenshots/02-headmaster/complaints/complaint-detail-view.png',
  
  // Teacher screenshots
  'teacher-dashboard.png': './screenshots/03-teacher/dashboard.png',
  'class-selection.png': './screenshots/03-teacher/attendance/class-selection.png',
  'attendance-grid.png': './screenshots/03-teacher/attendance/attendance-grid.png',
  'mark-all-present.png': './screenshots/03-teacher/attendance/mark-all-present.png',
  'mark-all-absent.png': './screenshots/03-teacher/attendance/mark-all-absent.png',
  'individual-toggle.png': './screenshots/03-teacher/attendance/individual-toggle.png',
  'attendance-submit-button.png': './screenshots/03-teacher/attendance/attendance-submit-button.png',
  'teacher-homework-list.png': './screenshots/03-teacher/homework/homework-list.png',
  'marks-entry.png': './screenshots/03-teacher/marks/marks-entry.png',
  
  // Student screenshots
  'student-dashboard.png': './screenshots/04-student/dashboard.png',
  'academics-overview.png': './screenshots/04-student/academics/academics-overview.png',
  'marks-view.png': './screenshots/04-student/academics/marks-view.png',
  'timetable-view.png': './screenshots/04-student/timetable/timetable-view.png',
  'student-homework-list.png': './screenshots/04-student/homework/homework-list.png',
  'attendance-overview.png': './screenshots/04-student/attendance/attendance-overview.png',
  'attendance-percentage.png': './screenshots/04-student/attendance/attendance-percentage.png',
  'student-notices-view.png': './screenshots/04-student/notices/notices-view.png',
  'complaint-form-empty.png': './screenshots/04-student/complaints/complaint-form-empty.png',
  'complaint-form-filled.png': './screenshots/04-student/complaints/complaint-form-filled.png',
  
  // UI Components
  'glassmorphism-effect.png': './screenshots/05-ui-components/glassmorphism-effect.png',
  'responsive-desktop.png': './screenshots/05-ui-components/responsive-desktop.png',
  'responsive-tablet.png': './screenshots/05-ui-components/responsive-tablet.png',
  'responsive-mobile.png': './screenshots/05-ui-components/responsive-mobile.png',
};

// Replace placeholders with actual markdown image syntax
Object.entries(screenshotMap).forEach(([filename, filepath]) => {
  const plainFilename = filename.replace('.png', '');
  const placeholder = `**📸 Screenshot Placeholder: ${plainFilename}**`;
  const imageMarkdown = `![${plainFilename}](${filepath})`;
  // Use string replace instead of regex to avoid special character issues
  reportContent = reportContent.split(placeholder).join(imageMarkdown);
});

// Replace generic placeholders
reportContent = reportContent.replace(/\*\*📸 Screenshot Placeholder:([^\*]+)\*\*/g, 
  (match, description) => {
    const cleanDesc = description.trim();
    return `![${cleanDesc}](./screenshots/placeholder.png)\n*Note: Screenshot for "${cleanDesc}" not captured automatically*`;
  });

// Save updated report
const updatedReportPath = path.join(process.cwd(), 'PROJECT_REPORT_WITH_SCREENSHOTS.md');
fs.writeFileSync(updatedReportPath, reportContent);
console.log('✓ Updated report saved to PROJECT_REPORT_WITH_SCREENSHOTS.md\n');

// Try to generate PDF using different methods
console.log('📄 Attempting PDF generation...\n');

// Method 1: Try markdown-pdf (if installed)
try {
  console.log('Trying markdown-pdf...');
  execSync(`npx markdown-pdf "${updatedReportPath}" -o "${outputPath}"`, { stdio: 'inherit' });
  console.log('✅ PDF generated successfully using markdown-pdf!');
  console.log(`📁 Output: ${outputPath}\n`);
  process.exit(0);
} catch (error) {
  console.log('⚠️  markdown-pdf not available, trying next method...\n');
}

// Method 2: Try pandoc (if installed)
try {
  console.log('Trying pandoc...');
  execSync(`pandoc "${updatedReportPath}" -o "${outputPath}" --pdf-engine=xelatex --toc --number-sections`, { stdio: 'inherit' });
  console.log('✅ PDF generated successfully using pandoc!');
  console.log(`📁 Output: ${outputPath}\n`);
  process.exit(0);
} catch (error) {
  console.log('⚠️  pandoc not available\n');
}

// Method 3: Install and use markdown-pdf
try {
  console.log('Installing markdown-pdf...');
  execSync('npm install -g markdown-pdf', { stdio: 'inherit' });
  execSync(`markdown-pdf "${updatedReportPath}" -o "${outputPath}"`, { stdio: 'inherit' });
  console.log('✅ PDF generated successfully!');
  console.log(`📁 Output: ${outputPath}\n`);
  process.exit(0);
} catch (error) {
  console.log('⚠️  Failed to install markdown-pdf\n');
}

// If all methods fail, provide instructions
console.log('⚠️  Automatic PDF generation failed.\n');
console.log('📝 Manual PDF generation options:\n');
console.log('Option 1 - VS Code Extension:');
console.log('  1. Install "Markdown PDF" extension in VS Code');
console.log('  2. Open PROJECT_REPORT_WITH_SCREENSHOTS.md');
console.log('  3. Right-click and select "Markdown PDF: Export (pdf)"\n');
console.log('Option 2 - Online Converter:');
console.log('  1. Visit https://www.markdowntopdf.com/');
console.log('  2. Upload PROJECT_REPORT_WITH_SCREENSHOTS.md');
console.log('  3. Download the PDF\n');
console.log('Option 3 - Install Pandoc:');
console.log('  Windows: choco install pandoc');
console.log('  Mac: brew install pandoc');
console.log('  Then run: npm run generate-pdf again\n');
