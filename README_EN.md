<p align="center">
  <a href="README_EN.md">English</a> |
  <a href="README.md">简体中文</a>
</p>

# Online Exam System (ExamPro)

An online exam system based on Vue + Spring Boot, supporting multiple question types, automatic paper generation, anti-cheating mechanisms, and score analysis.

## ✨ System Features

### 🎯 Cross-Platform Support
- **Web Frontend** (oes-frontend): Vue 3 based PC management system with complete functionality
- **Mobile App** (oes-uniapp): uni-app based cross-platform mobile application, supporting Android/iOS/H5
- **Backend Service** (oes-backend): Spring Boot unified API interface, front-end and back-end separation architecture

### 🚀 Core Highlights
- 📱 **Mobile First Design**: Complete mobile experience, take exams anytime anywhere
- 🔒 **Multi-layer Anti-Cheating**: Screen switching detection, question randomization, option randomization, leave detection
- ⚡ **Smart Paper Generation**: Support manual and AI automatic paper generation, flexible question type and score configuration
- 💾 **Real-time Saving**: Auto-save every 30 seconds to prevent accidental data loss
- 📊 **Data Analysis**: Score statistics, wrong answer analysis, knowledge point mastery visualization
- 👥 **Multi-role Support**: Admin, Teacher, Student three roles with fine-grained permission control
- 🌐 **Multi-language Support**: Real-time Chinese/English switching, internationalized interface

## Project Structure

```
exam_pro/
├── oes-backend/          # Spring Boot Backend
│   ├── src/main/java/com/oes/
│   │   ├── common/      # Common classes (response wrapper, base entity)
│   │   ├── config/      # Configuration (CORS, interceptors)
│   │   ├── controller/   # Controllers
│   │   ├── entity/       # Entity classes
│   │   ├── interceptor/ # Interceptors
│   │   ├── mapper/       # MyBatis Mapper
│   │   ├── service/      # Service layer
│   │   └── utils/        # Utilities
│   └── src/main/resources/
│       ├── application.yml
│       └── sql/ExamPro.sql
├── oes-frontend/        # Vue PC Frontend
│   └── src/
│       ├── layout/      # Layout components
│       ├── router/      # Router configuration
│       ├── store/       # Pinia state management
│       ├── utils/       # Utilities
│       ├── views/       # Page components
│       └── styles/      # Styles
├── oes-uniapp/          # uni-app Mobile
│   ├── pages/           # Pages
│   │   └── common/      # Common pages
│   │       ├── login.vue      # Login page
│   │       ├── register.vue   # Register page
│   │       ├── dashboard.vue  # Dashboard
│   │       └── account.vue    # Account center
│   ├── utils/           # Utilities
│   │   ├── api.js       # API definitions
│   │   └── request.js   # Request wrapper
│   ├── static/          # Static resources
│   ├── pages.json       # Page routing config
│   └── manifest.json    # App config
├── README.md
└── README_EN.md
```

## Tech Stack

### Backend (oes-backend)
- Spring Boot 3.2.0
- MyBatis Plus 3.5.5
- JWT (jjwt 0.12.3)
- MySQL 8.0
- Lombok

### PC Frontend (oes-frontend)
- Vue 3.4
- Vue Router 4
- Pinia 2.1.7
- Element Plus 2.4.4
- Axios
- ECharts 5.4.3

### Mobile (oes-uniapp)
- **Framework**: uni-app (Vue 3 Composition API)
- **Build Tool**: Vite / HBuilderX
- **UI**: Native components + Emoji icons (no third-party UI library)
- **State Management**: Pinia (reactive language switching)
- **Network**: uni.request wrapper (with interceptors)
- **Target Platforms**:
  - 🤖 Android App
  - 🍎 iOS App
  - 🌐 H5 Web
  - 📱 WeChat Mini Program (extendable)

## Environment Requirements

- JDK 17+
- MySQL 8.0+
- Node.js 18+
- Maven 3.8+
- HBuilderX (recommended for mobile development) or VS Code + uni-app plugin

## Quick Start

### 1. Database Configuration

```bash
# Login to MySQL (default username root, password is set by yourself)
mysql -u root -p

# Create database if not exists
CREATE DATABASE IF NOT EXISTS exam_pro DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Switch to database
USE exam_pro;

# Execute database script
source oes-backend/src/main/resources/sql/ExamPro.sql
```

### 2. Modify Database Connection Configuration

Edit `oes-backend/src/main/resources/application.yml`, modify database connection information:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/exam_pro?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root          # Change to your database username
    password: your_password # Change to your database password
```

### 3. Backend Start

```bash
cd oes-backend

# Start backend
mvn spring-boot:run
```

Backend service will start at **http://localhost:8081**

> ⚠️ **Important**: Backend must listen on `0.0.0.0:8081` to support mobile device access

### 4. PC Frontend Start (oes-frontend)

```bash
cd oes-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

PC frontend will start at **http://localhost:3000**

### 4. Mobile Start (oes-uniapp) 📱

#### Method 1: Using HBuilderX (Recommended)

1. Open **HBuilderX**
2. File → Open Directory → Select `oes-uniapp` folder
3. Run → Run to Browser/Emulator/Device
   - 🌐 **Run to Browser**: Select Chrome or other browser
   - 🤖 **Run to Android Emulator**: Requires Android SDK
   - 📱 **Run to Device**: USB connect phone, enable developer mode

#### Method 2: Using Command Line

```bash
cd oes-uniapp

# Install dependencies
npm install

# Dev mode (H5)
npm run dev:h5

# Dev mode (WeChat Mini Program)
npm run dev:mp-weixin

# Dev mode (Android App)
npm run dev:app-android
```

#### 🔧 IP Address Configuration Before Starting (Important)

Mobile devices need to connect to the backend via IP address. Ensure phone and computer are on the same LAN:

**Step 1: Find your computer IP**
- Windows: `ipconfig | findstr "IPv4"`
- Mac/Linux: `ifconfig | grep inet`

**Step 2: Modify mobile configuration**

Modify `BASE_URL` in `oes-uniapp/utils/request.js`:

```javascript
// oes-uniapp/utils/request.js
const BASE_URL = 'http://YOUR_COMPUTER_IP:8081/api'
```

**Step 3: Modify backend configuration**

Ensure backend listens on `0.0.0.0:8081`:

```yaml
# oes-backend/src/main/resources/application.yml
server:
  address: 0.0.0.0
  port: 8081
```

**Step 4: Firewall Settings**

Allow port 8081 inbound on Windows firewall:
```powershell
netsh advfirewall firewall add rule name="ExamPro" dir=in action=allow protocol=TCP localport=8081
```

**Step 5: Modify avatar URL (Optional)**

If you need to display user avatars, you need to modify the avatar URL configuration in the following files, replacing `192.168.1.92` with your computer's IP address:

| File Path | Line | Description |
|-----------|------|-------------|
| `oes-uniapp/pages/teacher/class-chat.vue` | 274 | Teacher class chat page avatar |
| `oes-uniapp/pages/student/class-chat.vue` | 165 | Student class chat page avatar |
| `oes-uniapp/pages/common/account.vue` | 250 | Account page avatar |
| `oes-uniapp/pages/admin/user-manage.vue` | 153 | User management page avatar |

```javascript
// Before
return 'http://192.168.1.92:8081' + avatar

// After
return 'http://YOUR_COMPUTER_IP:8081' + avatar
```

**Step 6: Other Configuration Files Requiring IP Modification**

| File Path | Description |
|-----------|-------------|
| `oes-frontend/vite.config.js` | Development environment proxy configuration |
| `oes-uniapp/manifest.json` | Mini-program development environment configuration |

## Feature Modules

### 🖥️ PC端 (oes-frontend)

#### Admin
- User management (Student, Teacher, Admin CRUD)
- Department management (Tree structure display)
- Class management (Create, edit, delete, invite code)
- Data statistics (Exam stats, wrong answer stats)

#### Teacher
- Subject management (Create, edit, delete subjects)
- Question bank management (Multiple choice, True/False, Fill blank, Essay)
- Paper management
  - Manual paper generation (Select questions, filter by type)
  - Automatic paper generation (Set question count and score per type)
  - Paper editing (Distinguish selected/unselected questions)
  - Paper preview (Student perspective)
- Exam management
  - Publish exam (Set time, duration, class, permissions)
  - Allow post-exam review settings
  - Monitor exam (Screen switch count, leave count)
  - Extend exam time
- Grade management (Query, export)

#### Student
- Exam list (Pending, Ongoing, Finished)
- Online exam
  - Real-time timer
  - Question navigation (Left sidebar status)
  - Auto-save answers (every 30 seconds)
  - Manual save button
  - Screen switch detection (auto-submit after threshold)
- Exam history (View scores, review papers)
- Wrong answer notebook (Filter by subject, practice feature)

---

### 📱 Mobile端 (oes-uniapp)

#### 🔐 Authentication Module
- **Login**
  - Username/password login
  - JWT Token authentication
  - Auto redirect to dashboard
  - Login state persistence

- **Register**
  - Role selection (Student/Teacher)
  - Form validation (username 3-20 chars, password 6-20 chars)
  - Department selector
  - Redirect to login after success

#### 📊 Dashboard
- **Personalized Welcome**
  - Display real name
  - Display role badge (Admin/Teacher/Student)
  - Display current date and time

- **Statistics Cards** (Dynamic based on role)
  - 👨🎓 **Student View**: Pending exams, completed exams, wrong answers, average score
  - 👨‍🏫 **Teacher View**: Class count, paper count, question count, exam count
  - 👤 **Admin View**: Total users, student count, teacher count, department count

- **Quick Access**
  - Click cards to navigate to corresponding pages
  - Right arrow indicator for clickable items

- **Information Cards**
  - 📝 **Recent Logs** (Admin): Latest system operation records
  - 📅 **Recent Exams** (Teacher): Exam list with status
  - ⏰ **Pending Exams** (Student): Upcoming exams, direct entry
  - ℹ️ **Exam Tips** (Student): 4 important reminders

#### 👤 Account Center
- **User Info Display**
  - Avatar display
  - Username and real name
  - Role badge

- **Profile Management** ✨
  - Edit real name, email, phone
  - Real-time API update
  - Local cache sync
  - Form validation and error handling

- **Change Password** ✨
  - Current password verification
  - New password input and confirmation
  - Password strength validation
  - API call for password change

- **About System**
  - App logo display
  - Version number (v1.0.0)
  - App description
  - Copyright info

- **Tools**
  - Clear local cache (with confirmation dialog)
  - Logout (clear Token and user info)

#### 🎨 UI/UX Features
- **Native Component Approach**
  - Emoji icons instead of third-party icon libraries (zero dependency)
  - Native View components for modals
  - Fully custom style control

- **Responsive Design**
  - Adapt to different screen sizes
  - Support portrait/landscape rotation
  - Touch-friendly interaction

- **User Experience**
  - Loading state indicators
  - Success/failure feedback
  - Smooth page transitions
  - Bottom sheet forms (mobile-friendly)

## Core Features

### 🎯 Automatic Paper Generation (PC)
- Set question count per type
- Set score per question type
- Auto calculate total score (count × score per question)
- Pass rate support percentage setting

### 📝 Paper Editing (PC)
- Checkbox to distinguish selected/unselected
- Filter by question type
- Maintain selection state after filtering
- Individual question score display and setting

### 🔒 Anti-Cheating (PC + Mobile)
- Question randomization (different order for each student)
- Option randomization (random arrangement for objective questions)
- Screen switch detection (auto-submit after 3 switches)
- Leave detection during exam
- Suspicious behavior marking

### ✅ Auto Grading
- Objective questions (single choice, multiple choice, true/false) auto graded
- Subjective questions (fill blank, essay) require manual grading by teacher
- Wrong answer records auto saved when submitting

### 👑 Permission Control
- Post-exam paper review permission (controlled by teacher)
- Detailed answers not visible until subjective questions graded

### 💾 Auto Save (PC)
- Auto-save every 30 seconds
- Manual save button
- Answers recoverable after exit or refresh

### 📱 Mobile Special Features
- **Offline First**: Local storage for user info, reduce network requests
- **Lightweight**: No third-party UI library, small package size
- **Native Experience**: Bottom sheet, touch feedback, gesture operations
- **Cross-platform**: One codebase, multiple platforms
- **Real-time Sync**: Immediate local cache update after modification

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/info` - Get user info
- `POST /api/auth/register` - User register
- `POST /api/auth/changePassword` - Change password

### User Management
- `GET /api/users/page` - Paginated user query
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users/{id}` - Delete user

### Class Management
- `GET /api/classes/page` - Paginated class query (Admin)
- `POST /api/class/create` - Create class (Teacher)
- `PUT /api/classes` - Update class
- `DELETE /api/classes/{id}` - Delete class
- `GET /api/class/my-classes` - Get my classes
- `POST /api/class/join-by-code` - Join class by invite code

### Question Bank
- `GET /api/questions/page` - Paginated question query
- `POST /api/questions` - Create question
- `PUT /api/questions` - Update question
- `DELETE /api/questions/{id}` - Delete question

### Paper Management
- `GET /api/papers/page` - Paginated paper query
- `GET /api/papers/{id}` - Get paper detail
- `POST /api/papers` - Create paper
- `PUT /api/papers` - Update paper
- `DELETE /api/papers/{id}` - Delete paper
- `POST /api/papers/auto-generate` - Auto generate paper

### Exam Management
- `GET /api/exams/page` - Paginated exam query
- `POST /api/exams` - Create exam
- `PUT /api/exams` - Update exam
- `DELETE /api/exams/{id}` - Delete exam
- `POST /api/exams/{id}/extend` - Extend exam time

### Exam Records
- `POST /api/exam-records/start` - Start exam
- `POST /api/exam-records/auto-save` - Auto save answers
- `POST /api/exam-records/submit/{id}` - Submit exam
- `POST /api/exam-records/screen-switch` - Record screen switch
- `GET /api/exam-records/history` - Exam history

### Wrong Questions
- `GET /api/wrong-questions/page` - Paginated wrong questions
- `POST /api/wrong-questions/practice` - Practice wrong questions

---

## 🏗️ Mobile Architecture (oes-uniapp)

### Directory Structure
```
oes-uniapp/
├── pages/                    # Pages
│   └── common/              # Common pages (all roles)
│       ├── login.vue        # Login page
│       ├── register.vue     # Register page
│       ├── dashboard.vue    # Dashboard
│       └── account.vue      # Account center
├── utils/                   # Utilities
│   ├── api.js               # API definitions (RESTful)
│   ├── request.js           # Request wrapper (interceptors, Token)
│   └── lang.js              # Language packs (Chinese/English)
├── store/                   # Pinia store
│   └── index.js             # Global state (user, language)
├── static/                  # Static resources
│   ├── logo.png             # App logo
│   └── avatar.png           # Default avatar
├── pages.json               # Page routing
├── manifest.json            # App config
└── App.vue                  # Root component
```

### Tech Selection Rationale

#### ✅ Why native components instead of third-party UI libraries?
1. **Reduce dependencies**: Avoid version conflicts
2. **Smaller package**: Remove unnecessary library code
3. **Full control**: Custom styles without restrictions
4. **Better performance**: Native rendering is faster

#### ✅ Why Pinia for state management?
1. **Reactive**: Real-time language switching across all pages
2. **Centralized**: Global state accessible anywhere
3. **Persistent**: Auto-save language preference to storage

#### ✅ Why Emoji icons?
1. **Zero dependency**: No icon library needed
2. **Cross-platform**: Consistent display across platforms
3. **Customizable**: Size and color adjustable
4. **International**: Natural multi-language support

### Code Standards

#### Vue 3 Composition API Style
```javascript
// ✅ Recommended
export default {
  setup() {
    const userStore = useUserStore()
    
    const toggleLanguage = () => {
      const newLang = userStore.language === 'zh' ? 'en' : 'zh'
      userStore.changeLanguage(newLang)
    }

    return { userStore, toggleLanguage }
  }
}
```

#### API Calling Standard
```javascript
// utils/api.js - Unified API definition
export const userApi = {
  update: (data) => put('/users', data),
  getById: (id) => get(`/users/${id}`)
}
```

#### Style Standard (SCSS)
```scss
.container {
  padding: 24rpx;  // Responsive unit
  
  .title {
    font-size: 36rpx;
    color: #333;
  }
}
```

### Development Roadmap

### v1.0.0 (Completed) ✅
- [x] User authentication (login/register)
- [x] Dashboard (stats cards, info display)
- [x] Account center (profile edit, password change)
- [x] Cross-platform support (Android/iOS/H5)

### v1.1.0 (Current) ✅
- [x] Online exam (mobile)
- [x] Exam history
- [x] Wrong answer notebook
- [x] Message notifications
- [x] Multi-language support

### v1.2.0 (Planned)
- [ ] Offline exam mode
- [ ] Voice reading questions
- [ ] Gesture shortcuts
- [ ] Dark mode

### v2.0.0 (Long-term)
- [ ] AI smart paper recommendation
- [ ] Real-time collaborative editing
- [ ] Video proctoring
- [ ] Blockchain score verification

---

## 🤝 Contribution Guide

Welcome to submit Issues and Pull Requests!

### Development Workflow
1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- Follow ESLint configuration
- Use Conventional Commits for commit messages
- Single responsibility principle for components
- Write necessary comments

## 📄 License

MIT License