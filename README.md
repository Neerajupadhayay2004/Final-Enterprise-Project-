<img width="1920" height="1080" alt="Screenshot_2026-07-03_22-24-28" src="https://github.com/user-attachments/assets/b635bde3-a220-4c20-beb5-9e1ed56eafb6" />
<img width="1920" height="1080" alt="Screenshot_2026-07-03_22-24-38" src="https://github.com/user-attachments/assets/6378cc0e-bc85-4cd0-9eb4-e1cd782f77a9" />
<img width="1920" height="1080" alt="Screenshot_2026-07-03_22-24-47" src="https://github.com/user-attachments/assets/7e05d432-a515-4fa3-b675-676ce8a7da08" />
<img width="1920" height="1080" alt="Screenshot_2026-07-03_22-24-57" src="https://github.com/user-attachments/assets/d2df6a97-8bc9-4213-bacc-a10158b15027" />
# 🛡️ SentinelX – Enterprise Cyber Threat Intelligence Platform

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-green)

SentinelX is a modern **Enterprise Cyber Threat Intelligence Platform** designed for cybersecurity professionals, SOC analysts, researchers, and students. It combines **OSINT investigations, AI-powered scam detection, threat intelligence, analytics, PDF reporting, and user management** into a single platform.

---

## 🚀 Features

### 🕵️ OSINT Investigation

- IP Address Lookup
- Domain Lookup
- WHOIS Lookup
- DNS Records
- SSL Certificate Analysis
- Subdomain Enumeration
- Email Investigation
- Username Search
- Phone Investigation
- Metadata Analysis
- Image EXIF Analysis
- ASN Lookup
- Geolocation
- Breach Lookup
- GitHub Search
- Reddit Search
- Twitter/X Search
- LinkedIn Search

---

### 🛡️ Scam Detection

Analyze

- URLs
- Emails
- SMS
- Phone Numbers
- Websites

Detection includes

- Phishing
- Fraud Websites
- Suspicious Domains
- Brand Impersonation
- Scam Indicators
- AI-powered Risk Analysis

---

### 🎯 Threat Intelligence

- IOC Management
- Malicious IP Tracking
- Domain Reputation
- URL Intelligence
- Threat Feed Dashboard
- Threat Categorization
- Risk Scoring

---

### 🤖 AI Security Analyst

Powered by LLMs

Supports

- Email Analysis
- IOC Extraction
- Malware Analysis
- Threat Hunting
- CVE Explanation
- Incident Summary
- Executive Reports

Supports uploading

- Logs
- URLs
- Emails
- PDF
- CSV
- Screenshots
- PCAP

---

### 📊 Analytics Dashboard

- Security Score
- Threat Trends
- Attack Timeline
- Activity Heatmap
- Severity Distribution
- Threat Categories
- Incident Statistics

---

### 📄 Reporting

Generate professional reports including

- Threat Summary
- IOC Details
- Risk Score
- Investigation Timeline
- Executive Summary
- Analyst Notes

---

### 👥 User Management

- Authentication
- Protected Routes
- User Profiles
- Admin Panel
- Notifications

---

## 🛠 Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Recharts
- Framer Motion

### Backend

- Supabase
- PostgreSQL
- Row Level Security (RLS)
- Supabase Authentication

### AI

Supports integration with

- OpenAI
- Google Gemini
- Ollama

### Development

- ESLint
- npm
- Git
- Vercel Ready

---

# 📂 Project Structure

```
app/
components/
hooks/
lib/
public/
supabase/
types/
utils/
```

---

# 🔐 Authentication

- Email Login
- Secure Sessions
- Protected Pages
- Role Ready Architecture

---

# 📷 Dashboard

- Enterprise Dashboard
- OSINT Module
- Scam Detection
- Threat Intelligence
- AI Security Analyst
- Analytics
- Reports
- User Management

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/sentinelx.git

cd sentinelx
```

Install dependencies

```bash
npm install
```

Create an environment file

```bash
cp .env.example .env.local
```

Run development server

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

OPENAI_API_KEY=your_openai_key

GEMINI_API_KEY=your_gemini_key

VIRUSTOTAL_API_KEY=your_virustotal_key

ABUSEIPDB_API_KEY=your_abuseipdb_key
```

Only the **Supabase URL** and **Supabase Anon Key** are required to run the application. Other API keys are optional and enable additional threat intelligence and AI features.

---

# 🗄️ Database

Built using

- Supabase PostgreSQL
- Authentication
- Row Level Security
- SQL Migrations
- Storage

---

# 🔒 Security

- TypeScript
- Secure Authentication
- Environment Variables
- Protected Routes
- Input Validation
- SQL Injection Protection
- XSS Protection
- CSRF Ready

---

# 📈 Future Roadmap

- VirusTotal Integration
- AbuseIPDB Integration
- Shodan Integration
- AlienVault OTX
- URLScan
- PDF Export
- Email Notifications
- Webhooks
- Docker Support
- Multi-Tenant Organizations
- RBAC Permissions
- AI Threat Hunting
- MITRE ATT&CK Mapping

---

# 🤝 Contributing

Contributions, feature requests, and pull requests are welcome.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

---

# 👨‍💻 Author

**Neeraj Upadhayay**

Cybersecurity | Threat Intelligence | OSINT | AI Security | Full Stack Developer

GitHub: https://github.com/Neerajupadhayay2004

LinkedIn: https://linkedin.com/in/your-linkedin

---

## ⚠️ Disclaimer

This project is intended for educational, research, and authorized security testing purposes only. Users are responsible for complying with applicable laws and regulations. Do not use this software against systems, networks, or data without proper authorization.
