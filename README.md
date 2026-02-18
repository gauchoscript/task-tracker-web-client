# Tasflou | Task Tracking Reimagined

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) 
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) 
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white) 
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white) 
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white) 
![AWS](https://img.shields.io/badge/AWS-S3%2FCloudFront-232F3E?logo=amazon-aws&logoColor=white) 
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)

**Tasflou** is a high-performance, modern task management application built for speed and reliability. This project serves as a technical showcase for implementing complex frontend architectures, including $O(1)$ drag-and-drop reordering, optimistic UI patterns, and resilient push notification systems.


## 🎯 Project Goals
Tasflou was built as a comprehensive portfolio project to demonstrate mastery over the entire software development lifecycle—from architectural design and frontend optimization to cloud deployment and CI/CD automation. The focus was on creating a production-ready, accessible, and performant application that mirrors industry-standard engineering practices.


### [🚀 Live Demo](https://www.gauchoscript.dev/projects/tasflou)

![Tasflou Home Screenshot](/public/product-scrennshot.png)


## 🛠 Technical Highlights

### 1. High-Efficiency Task Reordering (Gap-Based Logic)
Most task managers suffer from $O(N)$ write complexity when reordering tasks (shifting all indices). **Tasflou** implements a **Gap-Based Positional System**:
- **Strategy**: Instead of sequential indices, tasks use a large-gap `position` field.
- **Complexity**: Reordering is reduced to $O(1)$ on the backend as only the moved task's position needs updating.
- **Edge Handling**: Uses `above_id` and `below_id` tokens to calculate the midpoint for insertions, ensuring stable ordering even with concurrent updates.

### 2. Instantaneous Feedback (Optimistic UI)
To provide a premium "zero-latency" feel, the application leverages **TanStack Query** for state synchronization:
- **Optimistic Updates**: Task movement, deletion, and creation are reflected in the UI immediately before the server responds.
- **Rollback Mechanism**: Robust error handling automatically reverts the UI state if a network request fails, maintaining a consistent source of truth.

### 3. PWA & Push Notifications
Tasflou is a fully featured **PWA** designed for a native-like experience:
- **Firebase Cloud Messaging (FCM)**: Integrated cross-browser push notifications.
- **Service Worker Lifecycle**: Custom service worker logic handles registration, update prompts, and background message processing.


## 🏗 Tech Stack & Infrastructure

### Frontend & Engineering
- **React 19** + **TypeScript** + **Vite**
- **State Management**: Zustand (Auth/UI State) + TanStack Query v5 (Server State)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + MSW (API Mocking)

### DevOps & Deployment
- **Hosting**: AWS S3 + Amazon CloudFront (CDN) for low-latency global delivery.
- **CI/CD**: Fully automated pipeline via GitHub Actions. Any merge to `main` triggers an automatic build, test, and deployment flow to the production environment.


## 🔧 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- **Backend API**: This repository is for the frontend web client. You will also need the [Tasflou API](https://github.com/gauchoscript/task-tracker-api) running.

### Installation & Local Dev
1. Clone the repository:
   ```bash
   git clone https://github.com/gauchoscript/task-tracker-web-client.git
   cd task-tracker-web-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your **API** and **Firebase** credentials.
4. Start the development server:
   ```bash
   npm run dev
   ```


## 📄 License
Project developed for portfolio purposes. Use for learning or reference.