# Project Constraints — FIRST Assist

This document defines the physical, technical, and academic boundaries of FIRST Assist.

## 1. Academic Constraints
* **University Standards**: The system design must be clear, standard, and easy to explain during a paper defense. Over-engineering is prohibited.
* **Methodology Alignment**: The system must align with Design Science Research (DSR). Every feature must solve a defined problem (e.g., voice input solves the problem of typing on the field; AI suggestions solve the problem of missing expertise).

## 2. Technical Stack Constraints
* **Frontend**: Vue.js 3, Vite, Tailwind CSS. Avoid framework churn.
* **Backend**: Node.js and Express.js using standard ES Modules.
* **Database**: MongoDB (via Mongoose ODM) hosted in a cloud environment (e.g. MongoDB Atlas).
* **PWA**: Standard Service Worker (Offline caching of layout files) and Manifest definitions.

## 3. Operational Constraints
* **Field Connectivity**: FRC event venues often have severely congested 2.4/5GHz Wi-Fi networks. The application design must minimize payload sizes and behave gracefully when disconnected.
* **Security & Secrets**: Never place API keys or database passwords in source code. Environment configurations must handle variables.
* **Cost**: Built entirely on free tiers (MongoDB Atlas Free Tier, free speech-to-text API limits, or simulated fallbacks).
