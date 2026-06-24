# 💸 SpendWise — The Expense Tracker

> A full-stack personal finance management web application with AI-powered insights, budget tracking, and automated report generation.

![Tech Stack](https://img.shields.io/badge/Backend-Spring%20Boot%203.3-6DB33F?style=flat&logo=spring)
![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat&logo=react)
![Tech Stack](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)
![Tech Stack](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F55036?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure login & signup with role-based access (Admin / Premium / Normal) |
| 💰 **Expense Tracking** | Add, edit, delete expenses with category, date & description |
| 📊 **Budget Management** | Set monthly category-wise budgets with real-time utilization tracking |
| 🤖 **AI Insights** | Chat with SpendWise AI (Groq Llama 3.3) about your spending patterns |
| 📄 **Excel Export** | Download expenses as formatted `.xlsx` spreadsheet with SUM formula |
| 📑 **PDF Export** | Generate clean invoice-style PDF statements for any date range |
| 👤 **Admin Dashboard** | View and manage all registered users |
| 🌐 **Multilingual AI** | AI responds in English, Hindi, or Hinglish based on your input |

---

## 🛠️ Tech Stack

### Backend
- **Java 22** + **Spring Boot 3.3**
- **Spring Security** + **JWT** (jjwt)
- **Spring Data MongoDB**
- **Apache POI** (Excel generation)
- **iText PDF** (PDF generation)
- **Groq API** (Llama 3.3-70b AI)

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Axios** (API calls)

### Database
- **MongoDB** (local or Atlas)

---

## 🚀 Getting Started

### Prerequisites
- Java 22+
- Node.js 18+
- MongoDB running locally on `localhost:27017`
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

Edit `application.properties` and fill in your values:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/expensetracker
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
cd frontend
npm install
npm run dev
```

Frontend starts at → **http://localhost:5173**

---

## 🔑 Default Seeded Users

On first run, the app auto-seeds these demo accounts:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin + Premium + Normal |
| `premium` | `premium123` | Premium + Normal |
| `user` | `user123` | Normal |

> ⚠️ These are deleted and re-seeded only when the database is empty.

---

## 📁 Project Structure

```
SpendWise-The-Expense-Tracker/
│
├── backend/                         # Spring Boot API
│   └── src/main/java/com/example/expensetracker/
│       ├── config/                  # Database seeder
│       ├── controller/              # REST controllers
│       ├── model/                   # MongoDB models
│       ├── repository/              # Spring Data repos
│       ├── security/                # JWT & auth filters
│       └── service/                 # Business logic + AI
│
├── frontend/                        # React + Vite app
│   └── src/
│       ├── components/              # Layout, Sidebar
│       ├── contexts/                # Auth & Theme context
│       ├── pages/                   # All page components
│       └── services/                # Axios API service
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

---

## 🤖 AI Chat — Language Support

The SpendWise AI automatically detects and responds in your language:

- 🇬🇧 **English** → "Where was my highest spending?" → English reply
- 🇮🇳 **Hinglish** → "Kaha jyada kharch hua?" → Hinglish reply  
- 🇮🇳 **Hindi** → "मेरा बजट कितना है?" → Hindi reply

---

## 📸 Screenshots

> *(Add screenshots of Dashboard, AI Chat, Reports page here)*

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙋‍♂️ Author

**Raghvendra Yadav**  
GitHub: [@raghvendrayadav21](https://github.com/raghvendrayadav21)
