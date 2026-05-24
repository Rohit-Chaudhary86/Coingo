# 🪙 CryptoGo

> A modern cryptocurrency tracking web app built with React — deployed on AWS EC2 using Docker.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazonaws&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=flat&logo=react&logoColor=white)

---

## 🌐 Live Demo

| Platform | URL |
|----------|-----|
| Vercel | [coingo-six.vercel.app](https://coingo-six.vercel.app/) |
| AWS EC2 (Docker) | [http://16.170.204.91](http://16.170.204.91) |
| Docker Hub | [rohitch7/cryptogo](https://hub.docker.com/r/rohitch7/cryptogo) |

---

## 📸 Screenshots
<img width="1552" height="951" alt="Screenshot 2026-05-24 154320" src="https://github.com/user-attachments/assets/c5ce8b2b-fadd-4fed-b736-b12ec091e448" />
<img width="1918" height="1042" alt="Screenshot 2026-05-24 154930" src="https://github.com/user-attachments/assets/13472d33-4436-4c6c-beb7-18d3c64c81a5" />
<img width="1353" height="967" alt="Screenshot 2026-05-24 154938" src="https://github.com/user-attachments/assets/eee7bd0b-1260-443a-b4fa-2c211aecef3f" />
<img width="1829" height="927" alt="Screenshot 2026-05-24 155036" src="https://github.com/user-attachments/assets/ab708fb4-1542-40ee-9008-40b50ada0349" />
<img width="1020" height="926" alt="Screenshot 2026-05-24 155114" src="https://github.com/user-attachments/assets/b09ae2ed-b35f-406b-9180-7b716d3daca0" />
<img width="1919" height="824" alt="Screenshot 2026-05-24 155057" src="https://github.com/user-attachments/assets/77c49a4f-2644-4cbf-a7d5-b6dbded67e7b" />
<img width="1913" height="679" alt="Screenshot 2026-05-24 155051" src="https://github.com/user-attachments/assets/f7c0e6b9-ea8a-4b7d-ac1c-1a89770b972b" />






---

## ✨ Features

- 📈 Live cryptocurrency prices via CoinGecko API
- 🔍 Search and filter coins
- 💱 Multi-currency support (USD, INR, EUR)
- ⚡ API responses cached with React Query
- 🧠 Global state management with Zustand
- 🔁 Suspense and Error Boundaries for better UX
- 📦 Reusable components using Presenter-Container pattern
- 🪝 Custom hooks for clean logic separation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS, DaisyUI |
| State Management | Zustand |
| Data Fetching | React Query |
| API | CoinGecko Free API |
| Containerization | Docker, Nginx |
| Cloud | AWS EC2 (Ubuntu 22.04) |
| Registry | Docker Hub |

---

## 🏗️ Architecture

```
React + Vite App
      ↓
  npm run build → /dist
      ↓
  Nginx (alpine) serves /dist
      ↓
  Docker Container
      ↓
  AWS EC2 (Ubuntu) — Port 80
      ↓
  Public Internet 🌍
```

---

## 🐳 Run with Docker

No Node.js or npm needed — just Docker.

```bash
docker run -d -p 80:80 rohitch7/cryptogo:latest
```

Open `http://localhost` in your browser.

---

## 💻 Run Locally

```bash
# Clone the repo
git clone https://github.com/Rohit-Chaudhary86/Coingo.git
cd Coingo

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🐳 Run with Docker Compose

```bash
# Clone the repo
git clone https://github.com/Rohit-Chaudhary86/Coingo.git
cd Coingo

# Build and run
docker compose up -d --build

# Open http://localhost
```

---

## 📁 Project Structure

```
Coingo/
├── src/
│   ├── components/       # Reusable UI components
│   ├── containers/       # Presenter-Container pattern
│   ├── hooks/            # Custom hooks
│   ├── store/            # Zustand state management
│   ├── services/         # API calls (CoinGecko)
│   └── helpers/          # Axios instance, constants
├── public/
├── Dockerfile            # Multi-stage Docker build
├── nginx.conf            # Nginx config for React Router
├── docker-compose.yml
└── .dockerignore
```

---

## 🔑 Key Concepts Implemented

**Presenter-Container Pattern**
Separates UI logic (Presenter) from business logic (Container) for clean, reusable components.

**Custom Hooks**
Encapsulates API calls and state logic into reusable hooks.

**React Query Caching**
API responses are cached automatically — reduces unnecessary network requests and improves performance.

**Zustand State Management**
Lightweight global state for currency selection and shared UI state.

**Suspense + Error Boundaries**
Graceful loading states and error handling at the component level.

**Multi-stage Docker Build**
Stage 1 — Node alpine builds the app. Stage 2 — Nginx alpine serves the static output. Final image size: ~25MB.

---

## 🚀 Deployment

This app is containerized with Docker and deployed on AWS EC2.

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@16.170.204.91

# Pull latest image from Docker Hub
docker pull rohitch7/cryptogo:latest

# Run
docker run -d -p 80:80 rohitch7/cryptogo:latest
```

---

## 📦 Docker Hub

Image available at: [hub.docker.com/r/rohitch7/cryptogo](https://hub.docker.com/r/rohitch7/cryptogo)

```bash
docker pull rohitch7/cryptogo:latest
```

---

## 👨‍💻 Author

**Rohit Chaudhary**
- GitHub: [@Rohit-Chaudhary86](https://github.com/Rohit-Chaudhary86)
- Docker Hub: [rohitch7](https://hub.docker.com/u/rohitch7)
