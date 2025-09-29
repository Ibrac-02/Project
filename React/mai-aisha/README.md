# Mai Aisha Academy 🎓

A comprehensive school management system built with React Native and Expo, designed to streamline educational administration and enhance communication between administrators, teachers, and students.

## 🌟 Features

### 👨‍💼 **Admin Dashboard**
- **Staff Management**: Manage teachers, headteachers, and administrators
- **Student Management**: Complete student information system with separate collection
- **School Setup**: Configure school information and settings
- **Reports & Analytics**: Performance tracking and data insights
- **Attendance Overview**: Monitor school-wide attendance patterns
- **Announcements**: Broadcast important information

### 👩‍🏫 **Teacher Portal**
- **Attendance Tracking**: Daily student attendance management
- **Grade Management**: Record and track student marks 
- **Lesson Plans**: Create and manage curriculum planning
- **Student Roster**: View assigned students by class
- **Reports**: Generate performance analytics
- **Calendar**: Access academic calendar

### 🎓 **Head Teacher Portal**
- **Teacher Oversight**: Supervise and manage teaching staff
- **Advanced Reporting**: School-wide performance analytics
- **Administrative Functions**: Enhanced management capabilities
- **Staff Evaluation**: Teacher performance monitoring

### 🔧 **System Features**
- **Role-Based Access**: Secure authentication with role permissions
- **Offline Support**: Works without internet connection
- **Dynamic Theming**: Light/dark mode support
- **Push Notifications**: Real-time updates (configurable)
- **Data Import/Export**: CSV import for bulk student data
- **Network Status**: Connection monitoring

## 🏗️ **Architecture**

### **Database Structure (Firestore)**
```
📊 Collections:
├── 👥 users (admin, teacher, headteacher)
├── 🎒 students (dedicated student collection)
├── 📚 classes
├── 📖 subjects
├── ✅ attendance
├── 📊 grades
├── 📝 lessonPlans
├── 📋 exams
├── 📚 assignments
├── 📢 announcements
├── 🔔 notifications
└── 📅 academicCalendar
```

### **App Structure**
```
📱 App Routes:
├── 🔐 (auth) - Authentication screens
├── 👨‍💼 (admin) - Admin dashboard and management
├── 👩‍🏫 (teacher) - Teacher portal and tools
├── 🎒 (headteacher) - Head teacher management
├── 📱 (main) - Shared screens (announcements, calendar)
└── ⚙️ (settings) - User settings and preferences
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- Expo CLI
- Firebase project with Firestore enabled

### **Installation**

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd mai-aisha
   npm install
   ```

2. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Authentication
   - Copy your Firebase config to `config/firebase.ts`

3. **Environment Variables**
   Create a `.env` file with your Firebase configuration:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### **Running the App**
- **Android**: Use Android Studio emulator or physical device
- **iOS**: Use Xcode simulator or physical device
- **Web**: Opens in browser (limited functionality)

## 📱 **User Roles & Access**

### **🔐 Admin**
- Full system access
- Staff and student management
- School configuration
- System analytics

### **👩‍🏫 Teacher**
- Class management
- Student attendance and grades
- Lesson planning
- Student communication

### **🎓 Head Teacher**
- Teacher oversight and supervision
- Advanced reporting and analytics
- School-wide management functions
- Staff evaluation and development

### **📊 Student Data Management**
- **Note**: Students don't directly use the system
- **Data managed by**: Administrators and teachers
- **Information tracked**: Attendance, grades, profiles, parent contacts
- **Access provided to**: Parents/guardians through reports and communications

## 🛠️ **Technical Stack**

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State Management**: React Context + Hooks
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons
- **Offline**: AsyncStorage with sync capabilities
- **Notifications**: Expo Notifications (configurable)

## 📋 **Key Features**

### **✅ Implemented**
- ✅ Role-based authentication and access control
- ✅ Separate staff and student management
- ✅ Dynamic theming (light/dark mode)
- ✅ Offline data synchronization
- ✅ CSV student import functionality
- ✅ Comprehensive attendance system
- ✅ Grade management and reporting
- ✅ School announcements system
- ✅ Academic calendar integration
- ✅ Network status monitoring

### **🔄 In Progress**
- 🔄 Push notifications (stub implementation ready)
- 🔄 Advanced reporting dashboard
- 🔄 Parent portal integration

## 🔧 **Development**

### **Project Structure**
```
mai-aisha/
├── app/                    # App screens (file-based routing)
│   ├── (admin)/           # Admin screens
│   ├── (teacher)/         # Teacher screens
│   ├── (auth)/            # Authentication screens
│   ├── (main)/            # Shared screens
│   └── (settings)/        # Settings screens
├── components/            # Reusable components
├── lib/                   # Business logic and APIs
├── contexts/              # React contexts
├── config/                # Configuration files
└── assets/                # Images and static files
```

### **Key Libraries**
- `expo-router` - File-based navigation
- `firebase` - Backend services
- `@react-native-async-storage/async-storage` - Local storage
- `@react-native-community/netinfo` - Network monitoring
- `react-native-calendars` - Calendar components
- `papaparse` - CSV parsing

## 🚀 **Deployment**

### **Build for Production**
```bash
# Build for Android
npx eas build --platform android

# Build for iOS
npx eas build --platform ios

# Build for both platforms
npx eas build --platform all
```

### **Environment Setup**
- Configure EAS Build in `eas.json`
- Set up environment variables in EAS
- Configure app signing certificates

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Mai Aisha Academy** - Empowering education through technology 🎓✨
