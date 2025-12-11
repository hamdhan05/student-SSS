# School Management System

A modern, role-based school management frontend built with Next.js 14, React 18, TypeScript, and TanStack React Query. Features a striking black & white UI theme with a blurred school background.

## 🎨 Design Features

- **Black & White Theme**: Elegant monochrome design with high contrast
- **Blurred Background**: Full-screen school image with blur effect
- **Role-Based UI**: Completely isolated interfaces for each role
- **Tab-Based Navigation**: Headmaster portal uses tabs instead of routes
- **Responsive Design**: Works seamlessly on all devices

## 🔐 Authentication & Roles

### Role Detection (Mock)
The app uses **email-based role detection** stored in localStorage:
- Email contains `headmaster` → Headmaster role
- Email contains `teacher` → Teacher role  
- Email contains `student` → Student role

### Test Credentials
- **Headmaster**: `headmaster@school.com` (any password)
- **Teacher**: `teacher@school.com` (any password)
- **Student**: `student@school.com` (any password)

Each role has a completely isolated menu and cannot access other role features.

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query v5
- **Data**: In-memory mock data (no database)
- **Authentication**: localStorage-based mock auth

## 📁 Project Structure

```
/student-SSS
├─ /components
│  ├─ /Auth
│  │  ├─ LoginForm.tsx - Email-based role detection
│  │  └─ PrivateRoute.tsx - Route protection
│  ├─ /Headmaster - Tab components for headmaster portal
│  │  ├─ Students.tsx - Student management with pagination
│  │  ├─ Teachers.tsx - Teacher management
│  │  ├─ Notices.tsx - Notice board CRUD
│  │  ├─ Calendar.tsx - Academic calendar & holidays
│  │  ├─ Fees.tsx - Fee management & tracking
│  │  └─ Complaints.tsx - Anonymous complaint handling
│  └─ /UI - Reusable components (Button, Modal, Input, Calendar)
├─ /pages
│  ├─ _app.tsx - QueryClientProvider setup
│  ├─ login.tsx - Login page
│  ├─ /headmaster/index.tsx - Tab-based portal (no route changes)
│  ├─ /teacher/index.tsx - Attendance marking interface
│  └─ /student/index.tsx - Student dashboard (academics, attendance, complaints)
├─ /lib
│  ├─ /hooks
│  │  └─ useAuth.ts - Role-based auth hook with useRequireAuth
│  ├─ mockData.ts - Comprehensive mock data (60+ students, 5 teachers, etc.)
│  └─ api.ts - Mock API with React Query-ready async functions
├─ /styles
│  └─ globals.css - Black & white theme with blurred background
└─ /public/images
   └─ school-bg.jpg - Background image (add your own school photo)
```

## 🚀 Features by Role

### Headmaster Portal (Tab-Based)
- **Students Tab**: View/search/filter students by class/section with pagination
- **Teachers Tab**: View all teachers with search functionality
- **Notice Board Tab**: Create, edit, delete school notices
- **Calendar Tab**: View holidays and academic calendar
- **Fees Tab**: Track fee collection, filter by class/section
- **Complaints Tab**: View and resolve anonymous student complaints

### Teacher Portal
- **Attendance Marking**: Mark attendance for entire class with batch operations
- **Class Selection**: Choose class, section, and date
- **Quick Actions**: Mark all present/absent buttons
- **Real-time Updates**: Uses React Query mutations for instant feedback

### Student Portal (Tab-Based)
- **Academics Tab**: View test scores and subject-wise performance
- **Attendance Tab**: Check attendance records and percentage
- **Complaints Tab**: Submit anonymous complaints to headmaster
- **Privacy**: Student identity hidden from headmaster in complaints

## 🛠️ Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd student-SSS

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Add Background Image

Replace `/public/images/school-bg.jpg` with your own school building photo for the background effect.

## 📊 Mock Data

All data is stored in `/lib/mockData.ts`:
- **60+ Students** across classes 9-12, sections A-C
- **5 Teachers** with complete profiles
- **Notices, Holidays, Fees, Complaints** - all pre-populated
- **Attendance Records** - sample data for testing

## 🔄 React Query Setup

All data fetching uses TanStack React Query for:
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Loading/error states
- ✅ Pagination support

Example usage:
```typescript
const { data: students, isLoading } = useQuery({
  queryKey: ['students', classId, section, page],
  queryFn: () => getStudents({ classId, section, page, limit: 20 }),
});
```

## 🎯 Key Implementation Details

### Role-Based Access Control
```typescript
// Protect routes by role
const { user, loading } = useRequireAuth(['headmaster']);

// Redirect to appropriate dashboard based on role
if (user.role === 'headmaster') router.push('/headmaster');
else if (user.role === 'teacher') router.push('/teacher');
else if (user.role === 'student') router.push('/student');
```

### Tab-Based Navigation (Headmaster)
Instead of separate routes, the headmaster portal uses `useState` to switch between tab components:
```typescript
const [activeTab, setActiveTab] = useState<TabType>('students');
// No router.push() - content changes without route changes
```

### Anonymous Complaints
Complaints submitted by students have `studentId` stripped before showing to headmaster:
```typescript
export const getComplaints = async () => {
  // Returns complaints without studentId for anonymity
  return mockComplaints.map(({ studentId, ...rest }) => rest);
};
```

## 🎨 Theme Customization

The black & white theme is defined in `/styles/globals.css`:
```css
/* Blurred background */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('/images/school-bg.jpg');
  filter: blur(6px) brightness(0.45);
}

/* Card styling */
.card {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #333;
  backdrop-filter: blur(10px);
}
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔮 Future Enhancements

- [ ] Connect to real database (Supabase/PostgreSQL)
- [ ] Add email notifications for notices
- [ ] Export reports (PDF/CSV)
- [ ] Add student/teacher photo uploads
- [ ] Implement timetable management
- [ ] Add exam management module
- [ ] Real-time updates with WebSockets

## 📄 License

MIT License - feel free to use this project for your school!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built with ❤️ using Next.js and React Query

### Students
- id (uuid, primary key)
- name (text)
- rollNumber (text)
- grade (text)
- class (text)
- email (text)
- phone (text)
- dateOfBirth (date)
- address (text)
- parentName (text)
- parentPhone (text)

### Attendance
- id (uuid, primary key)
- studentId (uuid, foreign key)
- date (date)
- status (text: 'present', 'absent', 'late')

### Classes
- id (uuid, primary key)
- name (text)
- grade (text)
- teacherId (uuid, foreign key)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features by Role

### Teacher
- View assigned students
- Mark attendance (individual or batch)
- View student profiles
- Track attendance history

### Headmaster
- Dashboard with school statistics
- Manage all teachers
- View all students
- Access comprehensive reports

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.