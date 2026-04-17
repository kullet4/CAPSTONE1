/**
 * QuizKo eLMS - Data Management System
 * Stores and manages all eLMS data using LocalStorage
 */

class eLMSDatabase {
    constructor() {
        this.initializeDatabase();
        this.ensureDefaultUsers();
    }

    normalizeRole(role) {
        if (role === 'official') {
            return 'admin';
        }

        return role || 'student';
    }

    getDefaultUsers() {
        return {
            'admin@school.com': {
                id: 'admin001',
                name: 'Administrator',
                email: 'admin@school.com',
                password: 'admin123',
                role: 'admin',
                gradeLevel: null,
                avatar: '👨‍💼'
            },
            'teacher01@school.com': {
                id: 'teacher001',
                name: 'Maria Santos',
                email: 'teacher01@school.com',
                password: 'teacher123',
                role: 'teacher',
                gradeLevel: 1,
                avatar: '👩‍🏫'
            },
            'teacher02@school.com': {
                id: 'teacher002',
                name: 'Juan Cruz',
                email: 'teacher02@school.com',
                password: 'teacher123',
                role: 'teacher',
                gradeLevel: 3,
                avatar: '👨‍🏫'
            },
            'student01@school.com': {
                id: 'student001',
                name: 'Ana Garcia',
                email: 'student01@school.com',
                password: 'student123',
                role: 'student',
                gradeLevel: 1,
                avatar: '👧'
            },
            'student02@school.com': {
                id: 'student002',
                name: 'Miguel Reyes',
                email: 'student02@school.com',
                password: 'student123',
                role: 'student',
                gradeLevel: 1,
                avatar: '👦'
            }
        };
    }

    ensureDefaultUsers() {
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        const defaultUsers = this.getDefaultUsers();
        const hasUsers = Object.keys(users).length > 0;

        // Seed demo users only when the user store is empty.
        // This prevents intentionally deleted accounts from being resurrected.
        if (hasUsers) {
            return;
        }

        localStorage.setItem('elms_users', JSON.stringify(defaultUsers));
    }

    initializeDatabase() {
        if (!localStorage.getItem('elms_initialized')) {
            // Initialize Users
            const defaultUsers = this.getDefaultUsers();

            // Initialize Pre-defined Assessments
            const preDefinedAssessments = {
                'ass001': {
                    id: 'ass001',
                    title: '🌳 Living Things',
                    description: 'Learn about living and non-living things',
                    subject: 'Science',
                    gradeLevel: 1,
                    questions: [
                        { id: 1, question: 'Which is a LIVING thing?', options: ['🧸 Toy', '🌳 Tree', '🚲 Bike'], correctIndex: 1, difficulty: 'easy' },
                        { id: 2, question: 'What do humans need to breathe?', options: ['🍔 Food', '💧 Water', '🌬️ Air'], correctIndex: 2, difficulty: 'easy' }
                    ],
                    createdBy: 'teacher001',
                    isTemplate: true,
                    timeLimit: 10
                },
                'ass002': {
                    id: 'ass002',
                    title: '☀️ Plant Life',
                    description: 'Understanding plant biology',
                    subject: 'Science',
                    gradeLevel: 2,
                    questions: [
                        { id: 1, question: 'What do plants need to grow?', options: ['🍭 Candy', '☀️ Sunlight', '🕶️ Sunglasses'], correctIndex: 1, difficulty: 'easy' }
                    ],
                    createdBy: 'teacher001',
                    isTemplate: true,
                    timeLimit: 10
                }
            };

            // Initialize Learning Materials
            const learningMaterials = {
                'mat001': {
                    id: 'mat001',
                    title: 'Introduction to Science',
                    subject: 'Science',
                    gradeLevel: 1,
                    content: 'Science is the study of the natural world...',
                    type: 'lesson',
                    createdBy: 'admin001',
                    createdAt: new Date().toISOString(),
                    attachments: []
                }
            };

            // Initialize eLMS Policies
            const policies = {
                general: {
                    platformName: 'QuizKo eLMS',
                    description: 'Interactive Learning Platform for Philippine Elementary Schools',
                    passingScore: 75,
                    maxAttempts: 3
                },
                assessmentPolicy: {
                    timeLimitEnabled: true,
                    randomizeQuestions: false,
                    showAnswerFeedback: true,
                    allowRetakes: true
                },
                attendancePolicy: {
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    requiredAttendanceRate: 85
                }
            };

            // Initialize Student Performance
            const studentPerformance = {
                'student001': {
                    studentId: 'student001',
                    xp: 150,
                    level: 2,
                    assessmentScores: [],
                    attendance: { present: 8, absent: 2, late: 1 },
                    completedAssessments: []
                },
                'student002': {
                    studentId: 'student002',
                    xp: 200,
                    level: 2,
                    assessmentScores: [],
                    attendance: { present: 9, absent: 1, late: 0 },
                    completedAssessments: []
                }
            };

            // Initialize Class Assignments
            const classAssignments = {
                'class001': {
                    id: 'class001',
                    code: 'G1-A',
                    name: 'Grade 1 - Section A',
                    gradeLevel: 1,
                    teacherId: 'teacher001',
                    studentIds: ['student001', 'student002'],
                    createdAt: new Date().toISOString()
                }
            };

            // Save all to localStorage
            localStorage.setItem('elms_users', JSON.stringify(defaultUsers));
            localStorage.setItem('elms_assessments', JSON.stringify(preDefinedAssessments));
            localStorage.setItem('elms_materials', JSON.stringify(learningMaterials));
            localStorage.setItem('elms_policies', JSON.stringify(policies));
            localStorage.setItem('elms_student_performance', JSON.stringify(studentPerformance));
            localStorage.setItem('elms_classes', JSON.stringify(classAssignments));
            localStorage.setItem('elms_initialized', 'true');
        }
    }

    // USER MANAGEMENT
    getUser(email) {
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        return users[email] || null;
    }

    getAllUsers() {
        return Object.values(JSON.parse(localStorage.getItem('elms_users') || '{}'));
    }

    getUsersByRole(role) {
        const normalizedRole = this.normalizeRole(role);
        return this.getAllUsers().filter(user => this.normalizeRole(user.role) === normalizedRole);
    }

    addUser(email, userData) {
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        users[email] = {
            ...userData,
            role: this.normalizeRole(userData.role),
            id: userData.id || ('user_' + Date.now())
        };
        localStorage.setItem('elms_users', JSON.stringify(users));
        return users[email];
    }

    updateUser(email, updates) {
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        if (users[email]) {
            users[email] = { ...users[email], ...updates, role: this.normalizeRole(updates.role || users[email].role) };
            localStorage.setItem('elms_users', JSON.stringify(users));
            return users[email];
        }
        return null;
    }

    deleteUser(email) {
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        const user = users[email];

        if (!user) {
            return false;
        }

        delete users[email];
        localStorage.setItem('elms_users', JSON.stringify(users));

        // Remove deleted user from class rosters and teacher assignments.
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        Object.keys(classes).forEach((classId) => {
            const classData = classes[classId];

            if (classData.teacherId === user.id) {
                classData.teacherId = null;
            }

            if (Array.isArray(classData.studentIds)) {
                classData.studentIds = classData.studentIds.filter((studentId) => studentId !== user.id);
            }
        });
        localStorage.setItem('elms_classes', JSON.stringify(classes));

        // Remove student performance rows when a student is deleted.
        if (user.role === 'student') {
            const performance = JSON.parse(localStorage.getItem('elms_student_performance') || '{}');
            delete performance[user.id];
            localStorage.setItem('elms_student_performance', JSON.stringify(performance));
        }

        return true;
    }

    // ASSESSMENT MANAGEMENT
    getAssessment(id) {
        const assessments = JSON.parse(localStorage.getItem('elms_assessments') || '{}');
        return assessments[id] || null;
    }

    getAllAssessments() {
        return Object.values(JSON.parse(localStorage.getItem('elms_assessments') || '{}'));
    }

    getAssessmentsByTeacher(teacherId) {
        return this.getAllAssessments().filter(a => a.createdBy === teacherId);
    }

    getTemplateAssessments() {
        return this.getAllAssessments().filter(a => a.isTemplate);
    }

    createAssessment(assessmentData) {
        const assessments = JSON.parse(localStorage.getItem('elms_assessments') || '{}');
        const id = 'ass_' + Date.now();
        assessments[id] = {
            ...assessmentData,
            id,
            createdAt: new Date().toISOString(),
            isTemplate: assessmentData.isTemplate || false,
            questions: Array.isArray(assessmentData.questions) ? assessmentData.questions : []
        };
        localStorage.setItem('elms_assessments', JSON.stringify(assessments));
        return assessments[id];
    }

    updateAssessment(id, updates) {
        const assessments = JSON.parse(localStorage.getItem('elms_assessments') || '{}');
        if (assessments[id]) {
            assessments[id] = { ...assessments[id], ...updates };
            localStorage.setItem('elms_assessments', JSON.stringify(assessments));
            return assessments[id];
        }
        return null;
    }

    // LEARNING MATERIALS
    getMaterial(id) {
        const materials = JSON.parse(localStorage.getItem('elms_materials') || '{}');
        return materials[id] || null;
    }

    getAllMaterials() {
        return Object.values(JSON.parse(localStorage.getItem('elms_materials') || '{}'));
    }

    getMaterialsByGrade(gradeLevel) {
        return this.getAllMaterials().filter(m => m.gradeLevel === gradeLevel);
    }

    createMaterial(materialData) {
        const materials = JSON.parse(localStorage.getItem('elms_materials') || '{}');
        const id = 'mat_' + Date.now();
        materials[id] = {
            ...materialData,
            id,
            createdAt: new Date().toISOString(),
            visibility: materialData.visibility || 'class',
            gradeLevel: materialData.gradeLevel ? Number(materialData.gradeLevel) : null
        };
        localStorage.setItem('elms_materials', JSON.stringify(materials));
        return materials[id];
    }

    // POLICIES
    getPolicies() {
        return JSON.parse(localStorage.getItem('elms_policies') || '{}');
    }

    updatePolicies(policies) {
        localStorage.setItem('elms_policies', JSON.stringify(policies));
        return policies;
    }

    // STUDENT PERFORMANCE
    getStudentPerformance(studentId) {
        const performance = JSON.parse(localStorage.getItem('elms_student_performance') || '{}');
        return performance[studentId] || null;
    }

    recordAssessmentScore(studentId, assessmentId, score, maxScore) {
        const performance = JSON.parse(localStorage.getItem('elms_student_performance') || '{}');
        if (!performance[studentId]) {
            performance[studentId] = { studentId, xp: 0, level: 1, assessmentScores: [], attendance: {}, completedAssessments: [] };
        }
        
        const xpGained = Math.round((score / maxScore) * 100);
        performance[studentId].xp += xpGained;
        performance[studentId].assessmentScores.push({
            assessmentId,
            score,
            maxScore,
            percentage: (score / maxScore * 100).toFixed(2),
            completedAt: new Date().toISOString()
        });
        if (!performance[studentId].completedAssessments.includes(assessmentId)) {
            performance[studentId].completedAssessments.push(assessmentId);
        }
        
        // Level up every 500 XP
        performance[studentId].level = Math.floor(performance[studentId].xp / 500) + 1;
        
        localStorage.setItem('elms_student_performance', JSON.stringify(performance));
        return performance[studentId];
    }

    recordAttendance(studentId, status) {
        const performance = JSON.parse(localStorage.getItem('elms_student_performance') || '{}');
        if (performance[studentId]) {
            if (!performance[studentId].attendance) performance[studentId].attendance = {};
            const current = performance[studentId].attendance[status] || 0;
            performance[studentId].attendance[status] = current + 1;
            localStorage.setItem('elms_student_performance', JSON.stringify(performance));
        }
    }

    // CLASS MANAGEMENT
    getClass(id) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        return classes[id] || null;
    }

    getAllClasses() {
        return Object.values(JSON.parse(localStorage.getItem('elms_classes') || '{}'));
    }

    getClassesByTeacher(teacherId) {
        return this.getAllClasses().filter(c => c.teacherId === teacherId);
    }

    createClass(classData) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        const id = 'class_' + Date.now();
        classes[id] = { ...classData, id, createdAt: new Date().toISOString() };
        localStorage.setItem('elms_classes', JSON.stringify(classes));
        return classes[id];
    }

    updateClass(id, updates) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        if (classes[id]) {
            classes[id] = { ...classes[id], ...updates };
            localStorage.setItem('elms_classes', JSON.stringify(classes));
            return classes[id];
        }
        return null;
    }

    // CLASS MANAGEMENT - Enhanced with proper relationships
    assignStudentToClass(studentId, classId) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        if (classes[classId]) {
            if (!classes[classId].studentIds) {
                classes[classId].studentIds = [];
            }
            // Prevent duplicates
            if (!classes[classId].studentIds.includes(studentId)) {
                classes[classId].studentIds.push(studentId);
                localStorage.setItem('elms_classes', JSON.stringify(classes));
                return true;
            }
        }
        return false;
    }

    removeStudentFromClass(studentId, classId) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        if (classes[classId] && classes[classId].studentIds) {
            classes[classId].studentIds = classes[classId].studentIds.filter(id => id !== studentId);
            localStorage.setItem('elms_classes', JSON.stringify(classes));
            return true;
        }
        return false;
    }

    assignTeacherToClass(teacherId, classId) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        if (classes[classId]) {
            classes[classId].teacherId = teacherId;
            localStorage.setItem('elms_classes', JSON.stringify(classes));
            return true;
        }
        return false;
    }

    getStudentsInClass(classId) {
        const classData = this.getClass(classId);
        if (!classData || !classData.studentIds) return [];
        
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        return classData.studentIds
            .map(studentId => Object.values(users).find(u => u.id === studentId))
            .filter(u => u !== undefined);
    }

    getClassesForStudent(studentId) {
        return this.getAllClasses().filter(c => c.studentIds && c.studentIds.includes(studentId));
    }

    getTeacherInfo(teacherId) {
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        return Object.values(users).find(u => u.id === teacherId) || null;
    }

    // Get class details with full relationships
    getClassWithDetails(classId) {
        const classData = this.getClass(classId);
        if (!classData) return null;

        return {
            ...classData,
            teacher: this.getTeacherInfo(classData.teacherId),
            students: this.getStudentsInClass(classId),
            studentCount: (classData.studentIds || []).length
        };
    }

    deleteClass(classId) {
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        delete classes[classId];
        localStorage.setItem('elms_classes', JSON.stringify(classes));
        return true;
    }

    getLeaderboard(options = {}) {
        const students = this.getUsersByRole('student');
        const classes = this.getAllClasses();
        const filteredStudents = students.filter((student) => {
            if (options.gradeLevel && student.gradeLevel !== Number(options.gradeLevel)) {
                return false;
            }

            if (options.classId) {
                const classData = classes.find((entry) => entry.id === options.classId);
                return Boolean(classData && classData.studentIds && classData.studentIds.includes(student.id));
            }

            return true;
        });

        return filteredStudents
            .map((student) => {
                const performance = this.getStudentPerformance(student.id) || {
                    xp: 0,
                    level: 1,
                    assessmentScores: [],
                    attendance: { present: 0, absent: 0, late: 0 },
                    completedAssessments: []
                };

                return {
                    ...student,
                    xp: performance.xp || 0,
                    level: performance.level || 1,
                    assessmentsCompleted: (performance.completedAssessments || []).length,
                    averageScore: performance.assessmentScores.length
                        ? performance.assessmentScores.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / performance.assessmentScores.length
                        : 0
                };
            })
            .sort((a, b) => b.xp - a.xp || b.averageScore - a.averageScore || a.name.localeCompare(b.name));
    }

    getStudentBadges(studentId) {
        const performance = this.getStudentPerformance(studentId) || { xp: 0, level: 1, assessmentScores: [], attendance: { present: 0, absent: 0, late: 0 }, completedAssessments: [] };
        const badges = [];

        if ((performance.completedAssessments || []).length > 0) {
            badges.push({ icon: '🎯', label: 'First Step', description: 'Completed a learning task' });
        }

        if ((performance.assessmentScores || []).some((item) => Number(item.percentage) === 100)) {
            badges.push({ icon: '⭐', label: 'Perfect Score', description: 'Earned a perfect assessment score' });
        }

        if ((performance.level || 1) >= 2) {
            badges.push({ icon: '🚀', label: 'Level Up', description: 'Reached Level 2 or higher' });
        }

        if ((performance.attendance?.present || 0) > 0 && (performance.attendance?.absent || 0) === 0) {
            badges.push({ icon: '📚', label: 'Ready to Learn', description: 'Strong attendance record' });
        }

        return badges;
    }

    getStudentLearningPaths(studentId) {
        const student = this.getAllUsers().find((user) => user.id === studentId);
        const performance = this.getStudentPerformance(studentId) || { xp: 0, level: 1, assessmentScores: [], attendance: {}, completedAssessments: [] };
        const averageScore = performance.assessmentScores.length
            ? performance.assessmentScores.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / performance.assessmentScores.length
            : 0;

        return [
            {
                id: 'guided',
                title: 'Guided Practice',
                description: 'Step-by-step review with visual prompts and hints.',
                action: 'Review lessons first',
                recommended: averageScore < 75
            },
            {
                id: 'challenge',
                title: 'Challenge Quest',
                description: 'Short quizzes and games for practice and mastery.',
                action: 'Try a challenge',
                recommended: averageScore >= 60 && averageScore < 90
            },
            {
                id: 'independent',
                title: 'Independent Explorer',
                description: 'Self-chosen activities for learners ready to go further.',
                action: 'Pick your own path',
                recommended: averageScore >= 90 || (performance.level || 1) >= 2,
                gradeLevel: student ? student.gradeLevel : null
            }
        ];
    }

    getTeacherClassSummary(teacherId) {
        return this.getClassesByTeacher(teacherId).map((classData) => {
            const students = this.getStudentsInClass(classData.id);
            const leaderboard = this.getLeaderboard({ classId: classData.id });
            const averageScore = leaderboard.length
                ? leaderboard.reduce((sum, student) => sum + student.averageScore, 0) / leaderboard.length
                : 0;

            return {
                ...classData,
                studentCount: students.length,
                averageScore,
                topStudent: leaderboard[0] || null,
                classroomMood: averageScore >= 85 ? 'Thriving' : averageScore >= 70 ? 'Growing' : 'Needs support'
            };
        });
    }

    getTeacherMaterials(teacherId) {
        return this.getAllMaterials().filter((material) => material.createdBy === teacherId);
    }

    getStudentRecommendations(studentId) {
        const student = this.getAllUsers().find((user) => user.id === studentId);
        const completed = new Set((this.getStudentPerformance(studentId)?.completedAssessments || []));
        const materials = this.getAllMaterials().filter((material) => !student || !material.gradeLevel || material.gradeLevel === student.gradeLevel);
        const assessments = this.getAllAssessments().filter((assessment) => !completed.has(assessment.id));

        return {
            materials: materials.slice(0, 3),
            assessments: assessments.slice(0, 3),
            badges: this.getStudentBadges(studentId),
            learningPaths: this.getStudentLearningPaths(studentId)
        };
    }
}

// Global database instance
const DB = new eLMSDatabase();
