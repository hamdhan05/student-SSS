# Automated Report Generation

This folder contains scripts for automatically capturing screenshots and generating the project report PDF.

## Quick Start (One Command)

Run everything automatically:
```bash
npm run setup-automation
npm run generate-report
```

That's it! The script will:
1. ✅ Install dependencies
2. ✅ Start the dev server
3. ✅ Capture all screenshots
4. ✅ Generate PDF report
5. ✅ Clean up

## Individual Steps

If you prefer to run steps individually:

### 1. Setup (First Time Only)
```bash
npm run setup-automation
```
This installs Playwright and browser binaries.

### 2. Capture Screenshots
```bash
# Make sure dev server is running first
npm run dev

# In another terminal
npm run capture-screenshots
```

### 3. Generate PDF
```bash
npm run generate-pdf
```

## Output Files

After running, you'll have:
- `screenshots/` - All captured screenshots organized by category
- `PROJECT_REPORT_WITH_SCREENSHOTS.md` - Report with embedded screenshots
- `Project_Report.pdf` - Final PDF report (if PDF generation succeeded)

## Troubleshooting

### "Server not responding"
Make sure nothing else is running on port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then try again
npm run generate-report
```

### "Browser failed to launch"
Reinstall browsers:
```bash
npx playwright install chromium
```

### PDF generation failed
If automatic PDF fails, use one of these methods:

**Method 1 - VS Code Extension:**
1. Install "Markdown PDF" extension
2. Open `PROJECT_REPORT_WITH_SCREENSHOTS.md`
3. Right-click → "Markdown PDF: Export (pdf)"

**Method 2 - Online Converter:**
1. Visit https://www.markdowntopdf.com/
2. Upload `PROJECT_REPORT_WITH_SCREENSHOTS.md`
3. Download PDF

**Method 3 - Install Pandoc:**
```bash
# Windows (with Chocolatey)
choco install pandoc

# Then run
pandoc PROJECT_REPORT_WITH_SCREENSHOTS.md -o Project_Report.pdf --pdf-engine=xelatex --toc
```

## Scripts Description

### `capture-screenshots.ts`
Automated Playwright script that:
- Launches Chrome
- Logs in as each user role
- Navigates through all features
- Captures ~50 screenshots
- Organizes them in folders

### `generate-pdf.js`
- Updates markdown report with screenshot paths
- Tries multiple PDF generation methods
- Provides fallback instructions if needed

### `run-all.js`
Master script that orchestrates:
- Starting dev server
- Running screenshot capture
- Generating PDF
- Cleaning up

## Customization

### Change Screenshot Resolution
Edit `scripts/capture-screenshots.ts`:
```typescript
viewport: { width: 1920, height: 1080 }, // Change this
```

### Run Headless (No Browser Window)
Edit `scripts/capture-screenshots.ts`:
```typescript
const browser = await chromium.launch({ 
  headless: true, // Change to true
  slowMo: 100 
});
```

### Add More Screenshots
Edit `scripts/capture-screenshots.ts` and add your capture functions.

## Time Estimate

- Setup: 2-3 minutes (first time only)
- Screenshot capture: 5-8 minutes
- PDF generation: 1-2 minutes

**Total: ~10 minutes for complete automated report**

## Requirements

- Node.js 18+
- Windows/Mac/Linux
- 500MB free space for browser binaries
- Internet connection (for first-time setup)
