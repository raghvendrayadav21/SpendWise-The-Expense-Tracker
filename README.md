# 💸 SpendWise — The Expense Tracker

> A premium full-stack personal finance management web application with AI-powered insights, budget tracking, automated report generation, and an elevated glassmorphic interface.

![Tech Stack](https://img.shields.io/badge/Backend-Spring%20Boot%203.3-6DB33F?style=flat&logo=spring)
![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat&logo=react)
![Tech Stack](https://img.shields.io/badge/Database-MySQL-47A248?style=flat&logo=mysql)
![Tech Stack](https://img.shields.io/badge/Animations-Framer%20Motion-00C5FF?style=flat)
![Tech Stack](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F55036?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure login & signup with role-based access (Admin / Premium / Normal) |
| 💰 **Expense Tracking** | Add, edit, delete expenses with category, date & description |
| 📊 **Budget Management** | Set monthly category-wise budgets with real-time utilization progress animations |
| 🤖 **AI Insights** | Chat with SpendWise AI (Groq Llama 3.3) with interactive suggestion prompts |
| 📄 **Excel Export** | Download expenses as formatted `.xlsx` spreadsheet with SUM formula |
| 📑 **PDF Export** | Generate clean invoice-style PDF statements for any date range |
| 👤 **Admin Dashboard** | View and manage registered users with cascading deletion (Protected admin safety) |
| 🌐 **Multilingual AI** | AI responds in English, Hindi, or Hinglish based on your input |
| 🎨 **Premium UI/UX** | Dark glassmorphic interface, custom glows, dynamic typography, and page transitions |

---

## 🛠️ Tech Stack

### Backend
- **Java 22** + **Spring Boot 3.3**
- **Spring Security** + **JWT** (jjwt)
- **Spring Data JPA** (Hibernate ORM)
- **Apache POI** (Excel generation)
- **iText PDF** (PDF generation)
- **Groq API** (Llama 3.3-70b AI)

### Frontend
- **React 19** + **Vite**
- **Framer Motion** (Spring physics page & modal animations)
- **Tailwind CSS** (v4.0)
- **Lucide React** (icons)
- **Recharts** (charts & allocation graphs)
- **Axios** (API calls)

### Database
- **MySQL** (Hosted on Aiven Cloud or running locally)

---

## 🚀 Getting Started

### Prerequisites
- Java 22+
- Node.js 18+
- MySQL Server 8+ (or Aiven Cloud instance)
- Groq API Key → [console.groq.com](https://console.groq.com) (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/raghvendrayadav21/SpendWise-The-Expense-Tracker.git
cd SpendWise-The-Expense-Tracker
```

---

### 2. Backend Setup

```bash
cd backend
```

Create your `application.properties` from the template:

```bash
cp src/main/resources/application.properties.template src/main/resources/application.properties
```

Edit `application.properties` and fill in your values (Local or Cloud MySQL):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expensetracker?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

expensetracker.jwt.secret=YOUR_LONG_SECRET_KEY_MIN_64_CHARS
expensetracker.groq.api-key=YOUR_GROQ_API_KEY
```

Run the backend:

```bash
./mvnw spring-boot:run
```

Backend starts at → **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend starts at → **http://localhost:5173**

---

## 🔑 Default Seeded Users

On first run, the app auto-seeds these demo accounts:

| Username | Password | Role | Profile Status |
|---|---|---|---|
| `admin` | `admin123` | Admin + Premium + Normal | Pre-Updated (Direct Access) |
| `premium` | `premium123` | Premium + Normal | Pending Update |
| `user` | `user123` | Normal | Pre-Updated (Direct Access) |

---

## 📁 Project Structure

```
SpendWise-The-Expense-Tracker/
│
├── backend/                         # Spring Boot API
│   └── src/main/java/com/example/expensetracker/
│       ├── config/                  # Database seeder (JPA Entity mappings)
│       ├── controller/              # REST controllers (Admin, AI, Budget, Expense, Report)
│       ├── model/                   # JPA Entity models (User, Expense, Budget)
│       ├── repository/              # JpaRepository interfaces
│       ├── security/                # JWT & auth filters
│       └── service/                 # Business logic, Report generators & Groq AI
│
├── frontend/                        # React + Vite app
│   └── src/
│       ├── components/              # Layout, Sidebar navigation
│       ├── contexts/                # Auth & Theme state providers
│       ├── pages/                   # Redesigned page components
│       └── services/                # Axios API services
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/signup` | Register |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/budgets` | Get budgets |
| POST | `/api/budgets` | Set budget |
| GET | `/api/reports/excel` | Download Excel report |
| GET | `/api/reports/pdf` | Download PDF report |
| GET | `/api/ai/insights` | Get AI budget insights |
| POST | `/api/ai/query` | Chat with AI |
| GET | `/api/admin/users` | Get all users (Admin only) |
| DELETE | `/api/admin/users/{id}` | Cascade delete user (Admin only) |

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙋‍♂️ Author

**Raghvendra Yadav**  
GitHub: [@raghvendrayadav21](https://github.com/raghvendrayadav21)
