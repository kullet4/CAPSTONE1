# 🌟 QuizKo eLMS - Digitizing Instructional Materials

An interactive web-based learning platform designed for Philippine public elementary schools. Built as a capstone project to modernize education delivery through digital learning management.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Project Overview

QuizKo eLMS is a comprehensive Learning Management System tailored for elementary schools, supporting three main user roles:
- **Admins** - Administrative management and policy setting
- **Teachers** - Content creation, assessment management, and student monitoring
- **Students** - Learning engagement, self-assessment, and progress tracking

### Key Features
✅ **Role-Based Access Control** - Secure authentication for different user types  
✅ **Assessment Management** - Pre-defined templates + custom assessment creation  
✅ **Learning Materials** - Centralized digital content repository  
✅ **Progress Tracking** - XP system, levels, and gamification  
✅ **Student Monitoring** - Attendance tracking and performance analytics  
✅ **Responsive Design** - Works seamlessly on desktop and mobile devices  
✅ **Local Storage Database** - Easy to integrate with backend later  

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs entirely in the browser

### Installation
1. Extract the project files to your desired location
2. Open `login.html` in your web browser
3. That's it! The platform is ready to use

### Demo Credentials

**Admin:**
```
Email: admin@school.com
Password: admin123
```

**Teacher:**
```
Email: teacher01@school.com
Password: teacher123
```

**Student:**
```
Email: student01@school.com
Password: student123
```
---

## 📁 Project Structure

```
CAPSTONE1/
├── index.html                 # Main entry point (redirects to login)
├── login.html                 # Login & authentication page
├── admin-dashboard.html       # Admin dashboard
├── teacher-dashboard.html     # Teacher dashboard
├── student-dashboard.html     # Student dashboard
├── SYSTEM_TESTING_ISO25010.md # System testing and ISO 25010 evaluation
├── manifest.webmanifest       # PWA manifest
├── offline.html               # Offline fallback page
├── service-worker.js          # Offline caching strategy
├── assets/
│   └── quizko-icon.svg        # App icon
├── css/
│   └── global.css             # Shared responsive styles
└── js/
    ├── app-shell.js           # Shared auth, role normalization, service worker bootstrap
    ├── dashboard-nav.js       # Section-aware dashboard navigation
    ├── data.js                # LocalStorage database management
    └── firebase-db.js         # Firebase sync and demo account provisioning
```

---

### 🏛️ **Admin**
**Dashboard:** `admin-dashboard.html`

**Capabilities:**
- 👥 Add/manage students and teachers
- 📋 Define pre-defined assessments
- 📚 Manage learning materials
- 📜 Configure eLMS policies
- 📊 View system-wide statistics
4. **eLMS Policies** - Set passing scores, assessment rules, attendance policies


**Capabilities:**
- 📝 Create custom assessments with questions
- 📖 Assign pre-defined assessments to classes
- 📚 Add supplementary learning materials
- 📊 Monitor student performance and grades
- 📅 Track student attendance
- 👥 View class-level statistics

**Key Sections:**
1. **Assessment Management** - Create, edit, and assign assessments
2. **Student Performance** - View grades, XP, levels, and progress
3. **Learning Materials** - Upload lesson materials for student access
4. **Attendance Tracking** - Record daily attendance

---

### 👧 **Students**
**Dashboard:** `student-dashboard.html`

**Capabilities:**
- 🎮 Take assigned assessments
- 📚 Access learning materials
- ⭐ Track XP and level progression
- 📊 View grades and performance history
- 📅 See attendance records
- 🏆 Unlock achievements and badges

**Key Features:**
1. **XP/Level System** - Gain XP by completing assessments, unlock levels
2. **Assessment Taking** - Interactive quiz interface
3. **Material Access** - Browse and read learning content
4. **Progress Tracking** - Visual representation of learning journey
5. **Achievements** - Unlock badges based on performance

---

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic markup structure |
| **CSS3** | Responsive styling & animations |
| **JavaScript (Vanilla)** | Interactivity & logic |
| **Bootstrap 5** | Responsive UI framework |
| **LocalStorage API** | Client-side data persistence |
| **SweetAlert2** | Beautiful alerts & modals |
| **Canvas Confetti** | Celebration animations |

---

## 📊 Data Management

### Database Schema (LocalStorage)
```javascript
{
  elms_users: {
    email: { id, name, email, password, role, gradeLevel, avatar }
  },
  elms_assessments: {
    id: { title, description, questions[], createdBy, isTemplate, timeLimit }
  },
  elms_materials: {
    id: { title, subject, gradeLevel, type, content, createdBy }
  },
  elms_policies: {
    general: { platformName, passingScore, maxAttempts },
    assessmentPolicy: { timeLimitEnabled, randomizeQuestions, showFeedback }
  },
  elms_student_performance: {
    studentId: { xp, level, assessmentScores[], attendance, completedAssessments[] }
  },
  elms_classes: {
    id: { name, gradeLevel, teacherId, studentIds[] }
  }
}
```

### Data Features
- **Automatic Initialization** - Database sets up on first load with sample data
- **CRUD Operations** - Full Create, Read, Update, Delete support
- **XP System** - Students earn XP based on assessment performance
- **Attendance Tracking** - Record present/absent/late for compliance
- **Assessment Scoring** - Automatic percentage calculation and feedback

---

## 🎮 Gamification System

### XP & Leveling
- **Initial Level:** Level 1
- **XP per Question:** 50 XP
- **Level Up Threshold:** 500 XP per level
- **Rank System:** Bronze → Silver → Gold → Platinum → Diamond

### Achievements
- 🎯 First Assessment
- ⭐ Perfect Score
- 🚀 Level 2 Unlocked
- 📚 Dedication Badge

---

## 📱 Responsive Design

### Breakpoints
- **Mobile** (< 768px): Single column, optimized touch targets
- **Tablet** (768px - 1024px): 2-column layout
- **Desktop** (> 1024px): Full multi-column layout

### Features
- Collapsible navigation menu
- Touch-friendly buttons and inputs
- Optimized table views for small screens
- Mobile-first CSS approach

---

## 🔐 Security Features

### Authentication
- Email-based login system
- Password validation
- Session management via LocalStorage
- Role-based access control (prevents unauthorized dashboard access)

### Data Protection
- Client-side data validation
- User confirmation for destructive actions
- Secure logout functionality

---

## 🚀 Future Enhancements

### Backend Integration
- [ ] Connect to database (MySQL/MongoDB)
- [ ] REST API implementation
- [ ] User authentication with encryption
- [ ] Session management

### Advanced Features
- [ ] Real-time notifications
- [ ] File upload support (PDF, images, videos)
- [ ] Progress analytics and charts
- [ ] Parent portal integration
- [ ] Mobile app version
- [ ] Multimedia assessment support
- [ ] Automated backups
- [ ] Email notifications

### Advanced Gamification
- [ ] Leaderboards
- [ ] Achievement badges with descriptions
- [ ] Streak tracking
- [ ] Reward system
- [ ] Group challenges

---

## 📖 How to Use

### For Admin
1. Login with admin credentials
2. Navigate to **Student Management** to add students
3. Navigate to **Teacher Management** to add teachers
4. Go to **Learning Materials** to upload curriculum content
5. Visit **eLMS Policies** to configure system rules

### For Teachers
1. Login with teacher credentials
2. Go to **Assessment Management** to create custom quizzes
3. Click **Assign Template** to assign pre-built assessments
4. Visit **Student Performance** to monitor progress
5. Use **Attendance** button to track daily attendance
6. Upload materials in **Learning Materials** section

### For Students
1. Login with student credentials
2. View **Available Assessments** and click "Start"
3. Answer all questions and submit
4. Check **Your Grades** section for feedback
5. Browse **Learning Materials** for study resources
6. Monitor XP progress in the main card at the top

---

## 🧪 System Testing & ISO 25010 Evaluation

The project includes a dedicated evaluation guide for the defense panel:
- **[SYSTEM_TESTING_ISO25010.md](SYSTEM_TESTING_ISO25010.md)** - system test cases, Functional Suitability checks, and Performance Efficiency evaluation notes

The evaluation focus is on:
- **Functional Suitability (FUNC SUIT)** - whether login, role access, assessments, materials, progress tracking, and offline recovery work as intended
- **Performance Efficiency (PERF EFF)** - whether the prototype stays lightweight, responsive, and usable on constrained or intermittent connections

---

## 🐛 Troubleshooting

### Issue: Dashboard won't load
**Solution:** Clear browser cache and reload the page. Ensure JavaScript is enabled.

### Issue: Can't login
**Solution:** Check that you're using the correct email and password. Demo credentials are provided above.

### Issue: Data not saving
**Solution:** Ensure LocalStorage is enabled in your browser. Check browser privacy settings.

### Issue: Mobile layout looks broken
**Solution:** Refresh the page and ensure viewport meta tag is present. Try rotating device.

---

## 📝 Configuration

You can customize the platform by editing the policies in the **Admin Dashboard**:

- **Platform Name** - Change the LMS name
- **Passing Score** - Adjust required percentage to pass
- **Max Attempts** - Set how many times students can retake assessments
- **Assessment Policies** - Enable/disable time limits, randomization, feedback

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section above
2. Review the code comments for technical details
3. Ensure all files are in the correct directory

---

## 📄 License

This project is provided as-is for educational purposes.

---

## 👨‍💻 Development Notes

### Key JavaScript Objects

**Database (data.js):**
```javascript
DB.getUser(email)                    // Get user by email
DB.addUser(email, userData)          // Add new user
DB.getAssessment(id)                 // Get assessment details
DB.createAssessment(data)            // Create new assessment
DB.getAllMaterials()                 // Get all learning materials
DB.recordAssessmentScore(...)        // Record student assessment score
DB.recordAttendance(studentId, status) // Mark attendance
```

### Styling Variables (global.css)
```css
--primary: #667eea              /* Main brand color */
--admin-color: #f59e0b       /* Admin color */
--teacher-color: #0d6efd        /* Teacher color */
--student-color: #22c55e        /* Student color */
--danger: #ef4444               /* Error color */
--light: #f8fafc                /* Light background */
```

---

## ✨ Credits

Built with:
- **Bootstrap 5** - Responsive framework
- **Bootstrap Icons** - Icon library
- **Google Fonts** - Typography
- **SweetAlert2** - Alert dialogs
- **Canvas Confetti** - Celebration effects

---

**Last Updated:** February 22, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
