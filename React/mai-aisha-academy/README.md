
# Mai Aisha Academy Secondary School Management System

This project aims to develop a mobile-first (Expo/React Native) secondary school management system tailored for the Malawian education context. The system will primarily be used by teachers, headteachers, and administrators to manage school operations, student data, and academic records. Students will not be direct users of this system.

## User Roles and Responsibilities:

### Administrator
- **User Management**: Create and manage accounts for headteachers and teachers, assign roles and permissions.
- **School Setup**: Configure academic years, terms, classes, subjects, and manage student enrollment.
- **Reporting**: Generate comprehensive reports on school performance, attendance, and staff data.
- **Data Management**: Ensure system integrity, data backups, and manage access controls.
 
### Headteacher
- **Oversight & Monitoring**: View student academic performance summaries and monitor teacher activities.
- **Approvals**: Approve leave requests, disciplinary actions, and academic calendar changes.
- **Timetable Management**: Oversee the creation and publication of school timetables.
- **Reporting**: Generate academic and staff performance reports.

### Teacher
- **Attendance Management**: Record and track daily attendance for assigned classes.
- **Grade Entry**: Enter student marks for assignments, tests, and examinations.
- **Student Information Access**: View basic information for students in their classes.
- **Lesson Planning**: Upload or outline lesson plans (optional).
- **Communication**: Send internal messages to Headteacher or Administrator.

## Project Structure:

```
mai-aisha-academy/
├── app/                      # Expo Router application entry points and screens
│   ├── (auth)/               # Authentication related screens (login, signup, etc.)
│   │   ├── _layout.tsx
│   │   └── sign-in.tsx
│   ├── (admin)/              # Administrator specific screens
│   │   ├── _layout.tsx
│   │   ├── users.tsx
│   │   └── settings.tsx
│   ├── (headteacher)/        # Headteacher specific screens
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   └── reports.tsx
│   ├── (teacher)/            # Teacher specific screens
│   │   ├── _layout.tsx
│   │   ├── attendance.tsx
│   │   └── grades.tsx
│   ├── _layout.tsx           # Root layout for the application
│   ├── +not-found.tsx
│   └── index.tsx             # Main entry point/landing page
├── assets/                   # Static assets (images, fonts)
├── components/               # Reusable UI components
│   ├── ui/                   # Generic UI components (buttons, inputs, etc.)
│   └── specific/             # Components specific to certain features/roles
├── constants/                # Application-wide constants (colors, themes, etc.)
├── hooks/                    # Reusable React hooks
├── lib/                      # Utility functions, API services, third-party integrations
│   ├── api.ts                # API client
│   ├── auth.ts               # Authentication logic (Firebase, etc.)
│   ├── utils.ts              # General utility functions
│   └── firebase.ts           # Firebase configuration and services
├── navigation/               # Navigation logic (if not fully using Expo Router groups)
├── app.json                  # Expo configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project README (this file)
```

