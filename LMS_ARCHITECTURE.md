# QuizKo LMS - Class Management Architecture

## 📋 System Overview

This LMS implements a relationship-based system similar to STI eLMS with proper database associations between Students, Teachers, and Classes.

### **Data Relationships**

```
Classes/Sections
├── teacherId (foreign key → Teachers)
├── name: String (e.g., "Grade 1 - Section A")
├── gradeLevel: Number (1-6)
└── studentIds: Array of studentId (many-to-many)
    └── Each student belongs to exactly one class
```

---

## 🗂️ Database Structure

### Class Object
```javascript
{
  id: "class_1708624893923",
  code: "G1-A",              // Unique class code
  name: "Grade 1 - Section A",
  gradeLevel: 1,
  teacherId: "teacher001",   // Assigned teacher
  studentIds: [              // Array of enrolled students
    "student001",
    "student002"
  ],
  createdAt: "2026-02-22T10:00:00.000Z"
}
```

---

## 🛠️ Core Database Methods

### **Class Management**

#### 1. Create a New Class
```javascript
// Admin creates a class
const newClass = DB.createClass({
  code: 'G3-B',
  name: 'Grade 3 - Section B',
  gradeLevel: 3,
  teacherId: null,           // Optional - assign teacher later
  studentIds: []
});

// Returns:
// { id: 'class_...', code: 'G3-B', ... }
```

#### 2. Assign Teacher to Class
```javascript
// Admin assigns a teacher to a class
const success = DB.assignTeacherToClass(teacherId, classId);
// Updates the class with the teacher's ID
// One teacher can manage multiple classes
```

#### 3. Assign Student to Class
```javascript
// Admin or system assigns a student to a class
const success = DB.assignStudentToClass(studentId, classId);
// Returns: true if successful, false if already assigned

// Example: Bulk assign students
const classId = 'class_123';
const studentIds = ['student001', 'student002', 'student003'];

studentIds.forEach(sid => {
  DB.assignStudentToClass(sid, classId);
});
```

#### 4. Get Students in a Class
```javascript
// Retrieve all students in a specific class
const students = DB.getStudentsInClass(classId);
// Returns: Array of student objects with full data

// Example result:
// [
//   { id: 'student001', name: 'Ana Garcia', email: 'ana@school.com', ... },
//   { id: 'student002', name: 'Miguel Reyes', email: 'miguel@school.com', ... }
// ]
```

#### 5. Get Classes for a Teacher
```javascript
// Get all classes assigned to a specific teacher
const teacherClasses = DB.getClassesByTeacher(teacherId);
// Returns: Array of class objects

// Example in teacher dashboard:
document.addEventListener('DOMContentLoaded', () => {
  const myClasses = DB.getClassesByTeacher(currentUser.id);
  console.log(`Teacher manages ${myClasses.length} classes`);
});
```

#### 6. Get Class Details with Full Relationships
```javascript
// Get class with teacher info and student roster
const classDetails = DB.getClassWithDetails(classId);

// Returns:
// {
//   id: 'class_...',
//   name: 'Grade 1 - Section A',
//   teacher: { id: 'teacher001', name: 'Maria Santos', ... },
//   students: [ { id: 'student001', name: 'Ana Garcia', ... }, ... ],
//   studentCount: 25,
//   gradeLevel: 1
// }
```

#### 7. Remove Student from Class
```javascript
// Admin removes a student from a class
const success = DB.removeStudentFromClass(studentId, classId);
// Returns: true if removed successfully
```

#### 8. Delete a Class
```javascript
// Admin deletes an entire class
const success = DB.deleteClass(classId);
// Removes the class record (consider archiving instead)
```

---

## 👨‍💼 Admin Workflow

### **Step 1: Create Classes**
```javascript
// Admin creates class structure
const class1 = DB.createClass({
  code: 'G1-A',
  name: 'Grade 1 - Section A',
  gradeLevel: 1
});

const class2 = DB.createClass({
  code: 'G1-B',
  name: 'Grade 1 - Section B',
  gradeLevel: 1
});
```

### **Step 2: Assign Teachers**
```javascript
// Admin assigns teachers to classes
DB.assignTeacherToClass('teacher001', class1.id);  // Maria to G1-A
DB.assignTeacherToClass('teacher002', class2.id);  // Juan to G1-B

// One teacher can manage multiple grades:
DB.assignTeacherToClass('teacher001', 'class_G2A');  // Maria also teaches G2-A
```

### **Step 3: Assign Students**
```javascript
// Admin assigns students to classes
// Typically by reading from registration data

const studentsForG1A = [
  'student001', 'student002', 'student003'
];

studentsForG1A.forEach(studentId => {
  DB.assignStudentToClass(studentId, class1.id);
});

// Or auto-assign based on grade level:
function autoAssignStudentToClass(studentId) {
  const student = DB.getUser(studentEmail);
  const availableClasses = DB.getAllClasses()
    .filter(c => c.gradeLevel === student.gradeLevel && !c.teacherId);
  
  if (availableClasses.length > 0) {
    DB.assignStudentToClass(studentId, availableClasses[0].id);
  }
}
```

---

## 👨‍🏫 Teacher Dashboard Integration

### **Get All My Classes**
```javascript
function loadTeacherClasses() {
  const myClasses = DB.getClassesByTeacher(currentUser.id);
  
  myClasses.forEach(classData => {
    console.log(`📚 Class: ${classData.name}`);
    console.log(`   Code: ${classData.code}`);
    console.log(`   Students: ${classData.studentIds.length}`);
  });
  
  return myClasses;
}
```

### **Get All Students (from all my classes)**
```javascript
function loadAllMyStudents() {
  const myClasses = DB.getClassesByTeacher(currentUser.id);
  let allStudents = [];
  
  myClasses.forEach(classData => {
    const classStudents = DB.getStudentsInClass(classData.id);
    allStudents = allStudents.concat(
      classStudents.map(s => ({
        ...s,
        className: classData.name,
        classCode: classData.code
      }))
    );
  });
  
  return allStudents;
}
```

### **Get Students for a Specific Class**
```javascript
function getClassRoster(classId) {
  const classData = DB.getClass(classId);
  const students = DB.getStudentsInClass(classId);
  
  return {
    class: classData.name,
    code: classData.code,
    roster: students,
    totalCount: students.length,
    absentToday: [],
    presentToday: []
  };
}
```

### **Mark Attendance by Class**
```javascript
function recordAttendanceByClass(classId, attendanceData) {
  // attendanceData: { studentId: 'present'|'absent', ... }
  
  Object.entries(attendanceData).forEach(([studentId, status]) => {
    DB.recordAttendance(studentId, status);
  });
}
```

---

## 📊 Example Usage Scenarios

### **Scenario 1: New Teacher Setup**
```javascript
// Admin creates teacher account
const newTeacher = DB.addUser('teacher-new@school.com', {
  name: 'Sarah Johnson',
  email: 'teacher-new@school.com',
  password: 'pass123',
  role: 'teacher',
  gradeLevel: 2,
  avatar: '👩‍🏫'
});

// Admin creates classes for the teacher
const class1 = DB.createClass({
  code: 'G2-A',
  name: 'Grade 2 - Section A',
  gradeLevel: 2,
  teacherId: newTeacher.id
});

const class2 = DB.createClass({
  code: 'G2-C',
  name: 'Grade 2 - Section C',
  gradeLevel: 2,
  teacherId: newTeacher.id
});

// Admin assigns existing students to classes
const allG2Students = DB.getUsersByRole('student')
  .filter(s => s.gradeLevel === 2);

// First 30 to G2-A
allG2Students.slice(0, 30).forEach(s => {
  DB.assignStudentToClass(s.id, class1.id);
});

// Remaining to G2-C
allG2Students.slice(30).forEach(s => {
  DB.assignStudentToClass(s.id, class2.id);
});

// Now teacher logs in and sees:
// - 2 classes
// - ~60 students total
// - Organized by section
```

### **Scenario 2: Student Transfer**
```javascript
// Admin transfers a student to another class
function transferStudent(studentId, newClassId) {
  // Find current class
  const currentClass = DB.getClassesForStudent(studentId)[0];
  
  if (currentClass) {
    // Remove from current class
    DB.removeStudentFromClass(studentId, currentClass.id);
  }
  
  // Add to new class
  DB.assignStudentToClass(studentId, newClassId);
  
  Swal.fire('Success', 'Student transferred successfully', 'success');
}
```

### **Scenario 3: Teacher Report by Class**
```javascript
// Teacher generates report per class
function generateClassReport(classId) {
  const classData = DB.getClassWithDetails(classId);
  const students = classData.students;
  
  const report = {
    className: classData.name,
    classCode: classData.code,
    teacher: classData.teacher.name,
    totalStudents: students.length,
    averageGrade: calculateAverage(students),
    topPerformers: students.sort((a, b) => b.xp - a.xp).slice(0, 5),
    needsSupport: students.filter(s => calculateGrade(s) < 75)
  };
  
  return report;
}
```

---

## 🔄 Workflow Summary

```
1. ADMIN CREATES
   ├─ [G1-A] Grade 1 Section A
   ├─ [G1-B] Grade 1 Section B
   └─ [G3-A] Grade 3 Section A

2. ADMIN ASSIGNS TEACHERS
   ├─ Maria → G1-A & G1-B (manages both sections)
   ├─ Juan → G3-A
   └─ Sarah → (unassigned - assign later)

3. ADMIN ASSIGNS STUDENTS
   ├─ Ana, Miguel, Diego → G1-A
   ├─ Emily, Carlos, Rosa → G1-B
   └─ Pedro, Lisa, Mark → G3-A

4. TEACHER LOGS IN
   ├─ Maria sees: 2 classes (G1-A, G1-B)
   ├─ Each class shows: 3 students
   ├─ Total students: 6
   └─ Can manage assessments & grades per class

5. SYSTEM ENSURES
   ├─ No empty student lists (pre-assigned)
   ├─ Clear class ownership (one teacher per class)
   ├─ Scalable design (teacher can manage multiple classes)
   └─ Proper relationships enforced
```

---

## 🎯 Key Features

✅ **No Empty Classrooms** - Students assigned before teacher login
✅ **Multiple Classes** - One teacher can manage many sections
✅ **Clear Relationships** - Proper foreign keys enforced in code
✅ **Scalable** - Add unlimited teachers/students/classes
✅ **Flexible** - Admin can reassign at any time
✅ **Performance** - Indexed lookups by teacher, grade, class

---

## 📝 Implementation Checklist

- [x] Database relationships in `js/data.js`
- [x] Admin class management UI
- [x] Student assignment interface
- [x] Teacher assignment interface
- [x] Teacher dashboard integration
- [x] Multi-class support
- [x] Attendance tracking by class
- [x] Class-based reporting

---

## 🚀 Next Steps

1. **Optional: GUI for bulk import** - CSV upload for students
2. **Optional: Class sections editor** - Create/edit classes inline
3. **Optional: Teacher self-enrollment** - Teachers request classes
4. **Optional: Auto-balance** - Distribute students evenly across sections

