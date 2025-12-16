# Screenshot Capture Guide

This guide will help you systematically capture all screenshots needed for the project report.

## Prerequisites

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in a clean browser window

3. Create a screenshots folder:
   ```bash
   mkdir screenshots
   ```

4. Have a screenshot tool ready (Windows Snipping Tool, Mac Screenshot, or browser extension)

---

## Screenshot Capture Checklist

### 1. Login & Authentication (5 screenshots)

1. **login-page.png**
   - URL: http://localhost:3000/login
   - Show: Login form with glassmorphism effect
   - Note: Make sure background is visible

2. **login-credentials-shown.png**
   - URL: http://localhost:3000/login
   - Show: Test credentials section at bottom

3. **headmaster-login.png**
   - Action: Login as headmaster@school.com
   - Show: Loading or redirect state

4. **teacher-login.png**
   - Action: Login as teacher@school.com
   - Show: Loading or redirect state

5. **student-login.png**
   - Action: Login as student@school.com
   - Show: Loading or redirect state

---

### 2. Headmaster Portal (30 screenshots)

#### Dashboard & Overview

6. **headmaster-dashboard.png**
   - URL: http://localhost:3000/headmaster
   - Show: Main dashboard with all tabs visible
   - Note: Students tab should be active by default

#### Students Tab

7. **students-tab-list.png**
   - Tab: Students
   - Show: Student list with filters and search bar

8. **students-filters-applied.png**
   - Tab: Students
   - Action: Select a class and section
   - Show: Filtered student list

9. **students-search-results.png**
   - Tab: Students
   - Action: Search for a student name
   - Show: Search results

10. **students-add-modal.png**
    - Tab: Students
    - Action: Click "Add Student" button
    - Show: Add student modal form

11. **students-add-form-filled.png**
    - Tab: Students
    - Action: Fill in student details
    - Show: Completed form before submission

12. **student-detail-view.png**
    - Tab: Students
    - Action: Click on a student name/card
    - Show: Student detail modal

13. **student-edit-modal.png**
    - Tab: Students
    - Action: Click edit button on a student
    - Show: Edit student modal

14. **students-pagination.png**
    - Tab: Students
    - Show: Pagination controls at bottom
    - Note: Highlight page numbers

#### Teachers Tab

15. **teachers-tab-list.png**
    - Tab: Teachers
    - Show: Teacher list with search functionality

16. **teachers-search.png**
    - Tab: Teachers
    - Action: Search for a teacher
    - Show: Search results

17. **teachers-add-modal.png**
    - Tab: Teachers
    - Action: Click "Add Teacher" button
    - Show: Add teacher modal form

18. **teacher-detail-view.png**
    - Tab: Teachers
    - Action: Click on a teacher
    - Show: Teacher detail modal with assigned classes

19. **teacher-edit-modal.png**
    - Tab: Teachers
    - Action: Click edit button
    - Show: Edit teacher modal

#### Notice Board Tab

20. **notices-tab-list.png**
    - Tab: Notice Board
    - Show: List of all notices

21. **notices-create-modal.png**
    - Tab: Notice Board
    - Action: Click "Create Notice" button
    - Show: Create notice modal

22. **notices-form-filled.png**
    - Tab: Notice Board
    - Action: Fill in notice details
    - Show: Completed notice form

23. **notices-card-view.png**
    - Tab: Notice Board
    - Show: Close-up of individual notice cards

24. **notices-edit-modal.png**
    - Tab: Notice Board
    - Action: Click edit on a notice
    - Show: Edit notice modal

#### Calendar Tab

25. **calendar-tab-view.png**
    - Tab: Calendar
    - Show: Calendar interface with holidays

26. **calendar-holiday-list.png**
    - Tab: Calendar
    - Show: List of holidays with dates

27. **calendar-monthly-view.png**
    - Tab: Calendar
    - Show: Month calendar with marked holidays

#### Fees Tab

28. **fees-summary-dashboard.png**
    - Tab: Fees
    - Show: Three summary cards (Total, Collected, Pending)

29. **fees-student-list.png**
    - Tab: Fees
    - Show: Student fee records table

30. **fees-filters.png**
    - Tab: Fees
    - Action: Apply class and section filters
    - Show: Filtered fee records

31. **fees-search.png**
    - Tab: Fees
    - Action: Search for a student
    - Show: Search results

32. **fees-edit-modal.png**
    - Tab: Fees
    - Action: Click edit on a fee record
    - Show: Fee edit modal

33. **fees-payment-status.png**
    - Tab: Fees
    - Show: Different payment statuses (Paid, Pending, Partial)

#### Complaints Tab

34. **complaints-tab-list.png**
    - Tab: Complaints
    - Show: List of complaints (anonymous)

35. **complaints-detail-view.png**
    - Tab: Complaints
    - Action: Click on a complaint
    - Show: Complaint details (ensure student ID is hidden)

36. **complaints-status-filter.png**
    - Tab: Complaints
    - Action: Filter by status
    - Show: Pending vs Resolved complaints

---

### 3. Teacher Portal (15 screenshots)

37. **teacher-dashboard.png**
    - URL: http://localhost:3000/teacher
    - Show: Teacher portal main interface

38. **teacher-assigned-classes.png**
    - Tab: Dashboard/Attendance
    - Show: Dropdown showing assigned classes only

39. **teacher-class-selection.png**
    - Tab: Dashboard/Attendance
    - Action: Select class dropdown
    - Show: Available classes

40. **teacher-section-selection.png**
    - Tab: Dashboard/Attendance
    - Action: Select section dropdown
    - Show: Available sections for selected class

41. **teacher-date-selection.png**
    - Tab: Dashboard/Attendance
    - Show: Date picker for attendance

42. **teacher-attendance-grid.png**
    - Tab: Dashboard/Attendance
    - Action: Load student list
    - Show: Full attendance grid with all students

43. **teacher-mark-all-present.png**
    - Tab: Dashboard/Attendance
    - Show: "Mark All Present" button highlighted
    - Note: Can take before and after screenshots

44. **teacher-mark-all-absent.png**
    - Tab: Dashboard/Attendance
    - Show: "Mark All Absent" button highlighted

45. **teacher-individual-toggle.png**
    - Tab: Dashboard/Attendance
    - Action: Toggle individual student status
    - Show: Student status changing

46. **teacher-attendance-submit.png**
    - Tab: Dashboard/Attendance
    - Action: Click submit
    - Show: Submit button and confirmation

47. **teacher-success-message.png**
    - Tab: Dashboard/Attendance
    - Show: Success alert after submission

48. **teacher-homework-tab.png**
    - Tab: Homework
    - Show: Homework management interface

49. **teacher-create-homework.png**
    - Tab: Homework
    - Action: Click "Create Homework"
    - Show: Homework creation form

50. **teacher-marks-tab.png**
    - Tab: Marks
    - Show: Marks entry interface

51. **teacher-marks-entry-form.png**
    - Tab: Marks
    - Show: Form for entering student marks

---

### 4. Student Portal (20 screenshots)

52. **student-dashboard.png**
    - URL: http://localhost:3000/student
    - Show: Student portal with all tabs

53. **student-profile-sidebar.png**
    - Show: Left sidebar with student info (class, section, roll number)

#### Academics Tab

54. **student-academics-tab.png**
    - Tab: Academics
    - Show: Test scores and subject performance

55. **student-marks-overview.png**
    - Tab: Academics
    - Show: Subject-wise marks breakdown

56. **student-test-history.png**
    - Tab: Academics
    - Show: Historical test results

57. **student-grades-display.png**
    - Tab: Academics
    - Show: Grades and marks with subjects

#### Timetable Tab

58. **student-timetable-tab.png**
    - Tab: Timetable
    - Show: Class schedule/timetable

59. **student-timetable-daily.png**
    - Tab: Timetable
    - Show: Day-wise schedule view

#### Homework Tab

60. **student-homework-tab.png**
    - Tab: Homework
    - Show: List of homework assignments

61. **student-homework-details.png**
    - Tab: Homework
    - Action: Click on homework
    - Show: Detailed homework view with description

62. **student-homework-pending.png**
    - Tab: Homework
    - Show: Pending homework assignments

63. **student-homework-subject-filter.png**
    - Tab: Homework
    - Show: Homework organized by subject

#### Attendance Tab

64. **student-attendance-tab.png**
    - Tab: Attendance
    - Show: Attendance records and percentage

65. **student-attendance-percentage.png**
    - Tab: Attendance
    - Show: Large attendance percentage card

66. **student-attendance-records.png**
    - Tab: Attendance
    - Show: Date-wise attendance list

67. **student-attendance-calendar.png**
    - Tab: Attendance
    - Show: Calendar view of attendance (if available)

68. **student-attendance-monthly.png**
    - Tab: Attendance
    - Show: Monthly attendance summary

#### Notices Tab

69. **student-notices-tab.png**
    - Tab: Notices
    - Show: School notices from student perspective

70. **student-notices-list.png**
    - Tab: Notices
    - Show: Multiple notices displayed

#### Complaints Tab

71. **student-complaints-tab.png**
    - Tab: Submit Complaint
    - Show: Complaint submission form

72. **student-complaint-form-empty.png**
    - Tab: Submit Complaint
    - Show: Empty form with title and description fields

73. **student-complaint-form-filled.png**
    - Tab: Submit Complaint
    - Action: Fill in complaint details
    - Show: Completed form before submission

74. **student-complaint-submit-button.png**
    - Tab: Submit Complaint
    - Show: Submit button highlighted

75. **student-complaint-success.png**
    - Tab: Submit Complaint
    - Action: Submit complaint
    - Show: Success message with privacy assurance

---

### 5. UI Components & Design (10 screenshots)

76. **design-system-buttons.png**
    - Show: Different button variants (primary, secondary, disabled)
    - Tip: Create a test page or capture from multiple screens

77. **design-system-inputs.png**
    - Show: Various input field types

78. **design-system-cards.png**
    - Show: Different card styles used in the app

79. **design-system-modal.png**
    - Show: Modal dialog example

80. **glassmorphism-effect.png**
    - Show: Close-up of glassmorphism effect on cards

81. **background-blur-effect.png**
    - Show: Background blur demonstration

82. **responsive-desktop.png**
    - Show: Full desktop view (1920x1080)

83. **responsive-tablet.png**
    - Browser: Resize to tablet size
    - Show: Tablet view (768px width)

84. **responsive-mobile.png**
    - Browser: Resize to mobile size
    - Show: Mobile view (375px width)

85. **color-scheme-showcase.png**
    - Show: Black and white color scheme across components

---

## Screenshot Organization

Create this folder structure:

```
screenshots/
├── 01-authentication/
│   ├── login-page.png
│   ├── login-credentials-shown.png
│   ├── headmaster-login.png
│   ├── teacher-login.png
│   └── student-login.png
├── 02-headmaster/
│   ├── dashboard.png
│   ├── students/
│   │   ├── students-list.png
│   │   ├── add-student.png
│   │   └── ...
│   ├── teachers/
│   ├── notices/
│   ├── calendar/
│   ├── fees/
│   └── complaints/
├── 03-teacher/
│   ├── dashboard.png
│   ├── attendance/
│   ├── homework/
│   └── marks/
├── 04-student/
│   ├── dashboard.png
│   ├── academics/
│   ├── timetable/
│   ├── homework/
│   ├── attendance/
│   ├── notices/
│   └── complaints/
└── 05-ui-components/
    ├── buttons.png
    ├── inputs.png
    └── ...
```

---

## Tips for High-Quality Screenshots

### 1. Browser Setup
```
- Use Chrome or Firefox
- Window size: 1920x1080 (or consistent size)
- Zoom level: 100%
- Hide bookmarks bar: Ctrl+Shift+B
- Full screen: F11 (exit with F11)
```

### 2. Data Preparation
```
- Use test accounts only
- Have mock data ready
- Ensure data is realistic
- Keep names professional
```

### 3. Screenshot Quality
```
- Format: PNG (better quality)
- Resolution: High DPI if possible
- Clean screen: No unnecessary elements
- Proper lighting: Ensure text is readable
```

### 4. Capture Techniques

**Windows:**
```
- Snipping Tool: Windows + Shift + S
- Snip & Sketch: Full window capture
- Alt + PrtScn: Active window only
```

**Mac:**
```
- Cmd + Shift + 3: Full screen
- Cmd + Shift + 4: Select area
- Cmd + Shift + 4, then Space: Window capture
```

**Browser Extensions:**
```
- Awesome Screenshot
- Fireshot
- Nimbus Screenshot
```

### 5. Annotation (Optional)
```
- Add arrows to highlight features
- Add text boxes for explanations
- Use red circles for important areas
- Keep annotations minimal and professional
```

---

## Quick Capture Script

Save this as `capture-order.txt` and follow sequentially:

```
1. Start dev server: npm run dev
2. Open browser: http://localhost:3000
3. Login as headmaster
4. Capture all headmaster screenshots
5. Logout
6. Login as teacher
7. Capture all teacher screenshots
8. Logout
9. Login as student
10. Capture all student screenshots
11. Capture UI component screenshots
12. Organize into folders
13. Review all screenshots
14. Update PROJECT_REPORT.md with image links
```

---

## After Capturing Screenshots

### 1. Review Checklist
- [ ] All 85 screenshots captured
- [ ] Organized in folders
- [ ] Consistent resolution
- [ ] Clear and readable
- [ ] No personal information
- [ ] Professional appearance

### 2. Image Optimization (Optional)
```bash
# Install imagemagick
# Resize all images to consistent width
magick mogrify -resize 1920x1080 screenshots/**/*.png

# Compress images
# Use online tools like tinypng.com or ImageOptim
```

### 3. Update Report
- Replace "📸 Screenshot Placeholder" with actual images
- Use relative paths: `![Description](./screenshots/folder/image.png)`
- Add captions if needed
- Verify all links work

### 4. Generate PDF
```bash
# Using Pandoc (recommended)
pandoc PROJECT_REPORT.md -o Project_Report.pdf \
  --pdf-engine=xelatex \
  --toc \
  --number-sections \
  --highlight-style=tango

# Or use VS Code extension: Markdown PDF
```

---

## Troubleshooting

### Issue: Blurry Screenshots
**Solution:** Use higher resolution or browser zoom

### Issue: Inconsistent Sizes
**Solution:** Set browser to fixed size before capturing

### Issue: Missing Data
**Solution:** Check mock data in lib/mockData.ts

### Issue: Layout Issues
**Solution:** Clear cache and reload (Ctrl+Shift+R)

### Issue: Modal Not Showing
**Solution:** Click slowly to allow modals to render

---

## Time Estimate

- **Authentication**: 10 minutes
- **Headmaster Portal**: 45 minutes
- **Teacher Portal**: 25 minutes
- **Student Portal**: 35 minutes
- **UI Components**: 15 minutes
- **Organization**: 15 minutes
- **PDF Generation**: 10 minutes

**Total Time**: ~2.5 hours

---

## Final Steps

1. ✅ Capture all screenshots
2. ✅ Organize in folders
3. ✅ Update PROJECT_REPORT.md
4. ✅ Generate PDF
5. ✅ Review final PDF
6. ✅ Share with stakeholders

---

Good luck with your screenshot capture! Take your time and ensure quality over speed.
