# 🛠️ Fixora



<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Leaflet-B91C1C?style=flat&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
</p>

An on-demand service marketplace connecting customers with verified technicians for appliance and tech repairs, featuring seamless job posting, instant lead acceptance, and custom bidding.

**Live Website:** [https://fixora.works/](https://fixora.works/)

---

## 🚀 Key Features

### For Customers
* **Effortless Booking:** Send repair requests instantly with descriptions, location, and budget.
* **Smart Bidding:** Receive real-time, competitive price offers from assigned technicians.
* **Verified Assistance:** Hire securely from a pool of identity-verified service providers.

### For Service Providers (Technicians)
* **Live Job Board:** Access nearby service requests instantly via the new job board.
* **Dual Action System:** Instantly accept jobs at the customer's budget or submit custom price offers.
* **Interactive Map Routing:** Pinpoint customer locations precisely using live map tracking.
* **NID Verification:** Must be verified via NID before accessing live jobs.

### For Administrators
* **NID Verification Management:** Manually review, approve, or reject pending NID submissions to ensure a secure and trusted provider network.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js, TypeScript, Vite 
* **Styling & UI:** Tailwind CSS, Shadcn UI Components 
* **State Management:** Custom Global Stores (Zustand)
* **Icons:** Lucide React
* **Map Integration:** Leaflet Map (openstreetmap) 

### Backend
* **Language & Runtime:** Golang (Go) 
* **Architecture:** Modular multi-service layout following the strict **Handler-Service-Repository** design pattern, ensuring a clean separation of concerns and high codebase maintainability.
* **Middleware Layers:** Customized middleware handles secure authentication and request tracking.

### Database
* **Relational Database:** PostgreSQL 
* **Object Storage:** Supabase Storage for storing user profile pictures and NID documents 

### DevOps & Tools
* **Container:** Docker (Containerized setup ensuring environment consistency for seamless production deployment) 
