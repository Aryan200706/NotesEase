# NotesEase

NotesEase is a web-based note-sharing platform designed for college students.

The platform allows students to upload, preview, download, and manage academic notes in PDF format through a clean and responsive interface.

---

## Features

### User Authentication

- Firebase Authentication
- Secure Sign Up
- Secure Login
- Password Reset Support

### Notes Management

- Upload PDF notes
- Download notes
- Preview notes before downloading
- Delete uploaded notes

### Categorization

Notes are organized by:

- Branch
  - CSE AI ML
  - CSE Core
  - CSE Data Science
  - CSE Cyber Security
  - Other departments

- Semester
  - Semester 1
  - Semester 2
  - Semester 3
  - Semester 4
  - Semester 5
  - Semester 6
  - Semester 7
  - Semester 8

### Search & Filter

- Search notes by title
- Filter notes by branch
- Filter notes by semester

### Admin Panel

Admin users can:

- View all uploaded notes
- Remove inappropriate or duplicate notes
- Manage the shared library

### Responsive Design

- Desktop support
- Tablet support
- Mobile support

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### Backend & Cloud Services

- Firebase Authentication
- Firebase Firestore Database
- Firebase Storage

---

## Project Structure

```
NotesEase
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---


## Firebase Setup

1. Create a Firebase Project
2. Enable Authentication
3. Enable Firestore Database
4. Enable Firebase Storage
5. Add Firebase configuration in:
  Example:
```javascript
firebase.js
```
6. Configure Firestore and Storage rules

---

## Admin Access

Admin privileges are granted through Firestore user roles.

Example:
Admin users can manage all uploaded notes.

---

## Future Improvements

- Image notes support
- Text notes support
- Note ratings
- Bookmark system
- User profiles
- Subject-wise filtering

---

## Author

Aryan Rao (2025302109) , Alok Raj(2025302106) , Bhawna(2025302110)

College Project – NotesEase

2026