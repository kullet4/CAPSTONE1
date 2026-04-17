# System Testing and ISO 25010 Evaluation

## 1. Scope
This document covers the prototype evaluation of QuizKo eLMS in terms of:
- Functional Suitability (FUNC SUIT)
- Performance Efficiency (PERF EFF)

The evaluation is designed for the capstone defense and should be used together with the live prototype in a browser.

## 2. Self-Determination Theory Alignment
Self-Determination Theory (SDT) is implemented as the pedagogical foundation of the system:
- Competence: XP, badges, progress bars, class leaderboard, assessment feedback
- Autonomy: student learning paths, self-paced assessments, optional materials
- Relatedness: class leaderboard, teacher monitoring, class-level summaries

## 3. System Test Environment
- Platform: Web browser prototype
- Stack: HTML5, CSS3, JavaScript, Bootstrap, Firebase sync layer
- Persistence: LocalStorage with offline-first service worker caching
- Target users: Admin, Teacher, Student

## 4. Functional Suitability Evaluation

### 4.1 Test Cases

| ID | Feature | Test Procedure | Expected Result | Evaluation Note |
|---|---|---|---|---|
| FS-01 | Login | Enter valid admin, teacher, and student credentials | User is authenticated and redirected to the correct dashboard | Verify during demo |
| FS-02 | Role-Based Access | Open a dashboard using the wrong role | Access is denied and redirected to the proper page | Verify during demo |
| FS-03 | Teacher Assessment Creation | Create a custom assessment with questions | Assessment is saved and appears in the teacher dashboard | Verify during demo |
| FS-04 | Teacher Progress Monitoring | Open teacher dashboard live pulse | Class summary, leaderboard, and learner status are shown | Verify during demo |
| FS-05 | Student Learning Paths | Open student dashboard | Recommended learning paths are shown for autonomy support | Verify during demo |
| FS-06 | Badges and XP | Complete an assessment | XP increases and badges/progress update accordingly | Verify during demo |
| FS-07 | Materials Access | Open a learning material | The content loads in the student dashboard | Verify during demo |
| FS-08 | Offline Recovery | Reload the app while offline after one online visit | Cached shell and local data remain accessible | Verify during demo |

### 4.2 Functional Suitability Notes
- The system supports the core instructional flow expected in a primary LMS.
- The prototype covers content creation, access control, assessment delivery, and progress feedback.
- The SDT features are directly visible in the student dashboard and teacher monitoring tools.

## 5. Performance Efficiency Evaluation

### 5.1 Test Focus
The prototype is evaluated for:
- Lightweight page structure
- Fast client-side rendering
- Cached app shell loading
- Responsiveness on desktop and mobile screens
- Usability under intermittent connectivity

### 5.2 Performance Checks

| ID | Metric | Method | Acceptance Criteria | Evaluation Note |
|---|---|---|---|---|
| PE-01 | First Load Structure | Open login page in browser | Page renders without script errors | Verify during demo |
| PE-02 | Navigation Response | Switch between dashboard sections | UI responds smoothly without blocking | Verify during demo |
| PE-03 | Data Rendering | Load dashboard data from LocalStorage | Tables/cards render without noticeable delay | Verify during demo |
| PE-04 | Offline Behavior | Disconnect network and reload cached pages | Cached app shell and local data still work | Verify during demo |
| PE-05 | Mobile Responsiveness | Resize to phone-sized viewport | Layout remains readable and touch-friendly | Verify during demo |

### 5.3 Performance Efficiency Notes
- The app uses static HTML and client-side rendering, which keeps the prototype lightweight.
- Shared code reduces duplication and improves maintainability.
- Service worker caching reduces dependence on unstable internet connections.

## 6. Summary for Defense Panel
The prototype is structured to meet the capstone evaluation goals at a demonstration level:
- Functional Suitability is covered by working authentication, role separation, assessment workflows, learner tracking, and offline support.
- Performance Efficiency is supported by a lightweight client-side architecture, cached resources, and responsive layout behavior.

## 7. Recommendation
For a formal defense submission, use this document as the evaluation reference and run the prototype live in a browser while showing:
1. Admin login and role access
2. Teacher assessment creation and monitoring
3. Student learning paths, XP, and badges
4. Offline page reload behavior

