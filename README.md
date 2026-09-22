# 🎟️ **EventPulse - Event Ticketing Backend**

### *A production-ready backend for event ticketing, booking, and analytics*

> 
> **"I built this to learn how real-world backends handle concurrency, security, and scalability. Turns out, SQLite can do way more than I thought!"**

* * *

## **🚀 Why I Built This**

I wanted to **master backend engineering** beyond just CRUD apps. EventPulse is my attempt at building a **real-world ticketing system** with:  
✅ **Atomic seat locking** (no overselling!)  
✅ **Dual-token JWT auth** (secure & scalable)  
✅ **Background cron jobs** (auto-release expired seats)  
✅ **QR check-in validation** (fraud prevention)  
✅ **Organizer analytics** (revenue, attendance, tier breakdown)

This project helped me **understand relational databases, transactions, and security** in a way tutorials never could.

* * *

## **🔥 Key Features**

### **🔐 Authentication & Security**

- **JWT Access + Refresh Tokens** (HTTP-only cookies)
- **Refresh Token Rotation** (stolen tokens get invalidated)
- **Role-Based Access Control (RBAC)** (`ATTENDEE`, `ORGANIZER`, `ADMIN`)

### **🎟️ Event & Ticket Management**

- **Create events with multiple ticket tiers** (VIP, GA, Early Bird)
- **Atomic seat locking** (SQLite transactions prevent overselling)
- **10-minute expiration** (abandoned carts auto-release seats)

### **💳 Booking & Payments**

- **Lock → Pay → QR Code** flow
- **Mock payment gateway** (easy to replace with Stripe/Razorpay)

### **📱 QR Check-In System**

- **Organizers scan QR codes at the door**
- **Multi-table JOIN validation** (prevents fake tickets)

### **📊 Organizer Analytics**

- **Revenue, tickets sold, attendance %**
- **Per-tier breakdown** (VIP vs. GA sales)

* * *

## **🛠️ Tech Stack**

| **Category** | **Tech** |
| --- | --- |
| **Backend** | Node.js, Express (ES Modules) |
| **Database** | SQLite (with foreign keys & transactions) |
| **Auth** | JWT, bcrypt, HTTP-only cookies |
| **Background Jobs** | `node-cron` |
| **Utils** | `cookie-parser`, `cors`, `dotenv` |

* * *

## **📂 Project Structure**

    textsrc/├── controllers/ # Business logic├── models/ # SQL queries (transactions, JOINs)├── routes/ # API endpoints├── middlewares/ # Auth, RBAC, error handling├── utils/ # JWT, bcrypt, asyncHandler├── db/ # SQLite setup & schema├── cron/ # Background expiration job├── app.js # Express config└── index.js # Server entry

* * *

## **🚀 How It Works (Booking Flow)**

1️⃣ **User books tickets** → `POST /api/v1/bookings/lock`

- **SQLite transaction** locks seats (`BEGIN` → `COMMIT`/`ROLLBACK`)
- **10-minute expiration** (auto-release if not paid)

2️⃣ **User pays** → `POST /api/v1/bookings/pay`

- **Booking status → `PAID`**
- **QR code generated** (stored in `checkins` table)

3️⃣ **Organizer scans QR** → `POST /api/v1/checkins/validate`

- **Multi-table JOIN** verifies ticket validity
- **Marks as checked-in**

4️⃣ **Background job** (runs every minute)

- **Releases expired locks** (`PENDING_LOCK` → `EXPIRED`)

* * *

## **📡 API Endpoints**

| **Endpoint** | **Method** | **Description** | **Access** |
| --- | --- | --- | --- |
| `/api/v1/users/register` | POST | Register new user | Public |
| `/api/v1/users/login` | POST | Login & get tokens | Public |
| `/api/v1/users/logout` | POST | Logout & clear cookies | Protected |
| `/api/v1/users/refresh` | POST | Refresh access token | Public |
| `/api/v1/users/me` | GET | Get current user | Protected |
| `/api/v1/events` | POST | Create event | `ORGANIZER`/`ADMIN` |
| `/api/v1/events` | GET | List published events | Public |
| `/api/v1/events/:id` | GET | Get event details | Public |
| `/api/v1/bookings/lock` | POST | Lock seats (10 min) | Protected |
| `/api/v1/bookings/pay` | POST | Pay & generate QR | Protected |
| `/api/v1/checkins/validate` | POST | Scan QR & check-in | `ORGANIZER`/`ADMIN` |
| `/api/v1/analytics/me` | GET | Organizer’s events | `ORGANIZER`/`ADMIN` |
| `/api/v1/analytics/events/:id` | GET | Event sales dashboard | `ORGANIZER`/`ADMIN` |

* * *

## **🚀 Deployment to Vercel**

EventPulse is configured for 1-click deployment on **Vercel** with full-stack support (Vite frontend static output + Express API serverless function in `/api/index.js`).

### **Method 1: Deploy via Vercel Web Dashboard (Recommended)**
1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel automatically detects the configuration from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. *(Optional)* Under **Environment Variables**, add:
   - `ACCESS_TOKEN_SECRET`: (e.g. any random 32+ character string)
   - `REFRESH_TOKEN_SECRET`: (e.g. any random 32+ character string)
6. Click **Deploy**. Both the React client and Express API endpoints will be live on your `.vercel.app` domain!

### **Method 2: Deploy via Vercel CLI**
```bash
# 1. Install Vercel CLI if needed
npm install -g vercel

# 2. Deploy to production
vercel --prod
```

* * *

## **💻 How to Run**

### **1️⃣ Clone & Install**

    Bashgit clone https://github.com/yourusername/eventpulse-backend.gitcd eventpulse-backendnpm install

### **2️⃣ Set Up `.env`**

    envPORT=8000NODE_ENV=developmentCORS_ORIGIN=http://localhost:3000ACCESS_TOKEN_SECRET=your_secure_random_stringACCESS_TOKEN_EXPIRY=15mREFRESH_TOKEN_SECRET=another_secure_random_stringREFRESH_TOKEN_EXPIRY=7d

*(Generate secrets with `openssl rand -base64 64`)*

### **3️⃣ Run the Server**

    Bashnpm run dev

- SQLite DB (`eventpulse.db`) is created automatically.
- Tables + indexes are initialized on startup.

* * *

## **📊 Analytics Dashboard Example**

    JSON{ "event": { "title": "Node.js Conference 2025", "venue": "Convention Center", "start_time": "2025-10-15T09:00:00.000Z" }, "sales": { "total_revenue": 1250, "tickets_sold": 25, "remaining_seats": 75, "seats_locked": 2 }, "attendance": { "checked_in_count": 20, "attendance_percentage": 80 }, "tiers": [ { "tier_name": "VIP", "price": 100, "tickets_sold": 10, "revenue": 1000 }, { "tier_name": "General Admission", "price": 25, "tickets_sold": 15, "revenue": 375 } ]}

* * *

## **🔜 What’s Next?**

- **Frontend** (React + TailwindCSS, maybe with a little AI styling help)
- **Real payment gateway** (Stripe/Razorpay)
- **Rate limiting** (prevent brute-force attacks)
- **Dockerize** (easy deployment)
- **Tests** (Jest + Supertest)

* * *

## **🤝 Contributing**

Found a bug? Want to add a feature? Open an issue or PR!

* * *

## **📜 License**

MIT

* * *

## **👨‍💻 Author**

Built with ❤️ by **IHSAAN ULLAH**  
🔗 [LinkedIn](www.linkedin.com/in/ihsaan7)  
🌐 [Portfolio]([https://yourwebsite.com/](https://2025-oct-portfolio.vercel.app/))
