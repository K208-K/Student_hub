# 🎓 Student Hub – Smart Academic Management Platform

A modern **full-stack MERN application** built to help students manage their academic life efficiently in one place.
Student Hub combines productivity tools, academic analytics, and AI-powered assistance into a single smart dashboard.

---

## 🚀 Live Demo

https://student-hub-git-main-k208-ks-projects.vercel.app/dashboard

---

## 📌 Overview

Student Hub is a **student productivity and academic management platform** designed to simplify everyday college tasks.

It provides tools for:

* 📅 timetable management
* 📊 attendance tracking
* 🎯 GPA / CGPA calculation
* 📝 notes management
* 📚 study planning
* 🤖 AI doubt solving
* 👤 profile management
* 📢 notices and updates

The platform is built with a **modern glassmorphism UI**, responsive layouts, and secure authentication.

---

## ✨ Features

### 📊 Academic Tools

* **Attendance Tracker**

  * subject-wise attendance
  * percentage calculation
  * attendance charts
  * bunk prediction

* **GPA / CGPA Calculator**

  * semester-wise SGPA
  * cumulative CGPA
  * dynamic grade point calculation
  * GPA trend visualization

* **Internal Marks Manager**

  * track internal assessments
  * monitor performance

---

### 📅 Productivity Tools

* **Smart Time Table**

  * class scheduling
  * live class indicator
  * subject & faculty tracking

* **Study Planner**

  * daily study task management
  * academic planning

* **Exam Countdown**

  * exam reminder system
  * countdown timer

---

### 📂 Student Utilities

* **Notes Management**

  * create, update, delete notes
  * database synced

* **Notice Board**

  * important announcements
  * academic notices

* **Profile Management**

  * editable student profile
  * academic details
  * profile image upload

---

### 🤖 AI Powered Module

* **AI Doubt Solver**

  * integrated Gemini API
  * academic doubt assistance
  * concept explanations

---

## 🛠️ Tech Stack

### Frontend

* **React.js**
* **Vite**
* **Tailwind CSS**
* **Framer Motion**
* **Recharts**
* **Axios**
* **React Router DOM**

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 📂 Project Structure

```bash
student-hub/
│
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── context/
│   │   └── App.jsx
│
├── server/                 # Backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## 🔐 Authentication

This project uses **JWT-based authentication** for secure login and protected routes.

Features include:

* secure token generation
* protected private routes
* persistent login
* auto logout on unauthorized access

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/student-hub.git
cd student-hub
```

---

### 2️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

### 3️⃣ Backend Setup

```bash
cd server
npm install
npm run dev
```

---

### 4️⃣ Environment Variables

Create `.env` inside server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

Create `.env` inside client folder:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌍 Deployment

The project is deployed using:

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 📈 Future Enhancements

* real-time notifications
* attendance prediction using ML
* resume builder
* placement tracker
* AI academic advisor
* performance analytics dashboard

---

## 👨‍💻 Author

**Abdul Karim**
Full Stack Developer | MERN | AI/ML Enthusiast

---

## ⭐ Support

If you like this project, give it a **star ⭐ on GitHub**
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)
