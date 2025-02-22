# Bachelor Thesis: A Safe and Secure Backend for a Local-First Web Application with Yjs

## Project Overview
This project was a part of my bachelor thesis and it focuses on the development of a secure backend for **Labbook**, a real-time collaborative lab notebook application designed for biology and chemistry students and teachers. The goal was to enhance the application's security and reliability while maintaining a **local-first** approach.

### Key Features:
- **User Authentication & Authorization:** Integrated **Keycloak** for token-based authentication and authorization in the backend.
- **Role-Based Access Control (RBAC):** Implemented RBAC to ensure secure access to the API for the React client application.
- **Token Management:** Configured the backend to handle token management, ensuring only authenticated and authorized users can access resources.
- **Robust Backend Architecture:** Enhanced the application's security and reliability through a well-structured backend and strict access controls.
- **Containerization:** Used **Docker** to containerize the application components for easy deployment and scalability.

---

## Repository Structure
The repository contains the following components:

### 1. **`software`**
   - The **React client application** for Labbook.
   - **My Contribution:** Integrated Keycloak for user authentication and authorization.

### 2. **`images`**
   - An **Express.js API** with **NGINX** for storing and serving images.
   - **My Contribution:** Integrated Keycloak for secure access and token management.

### 3. **`skript-server`**
   - An **Express.js API** that communicates with a **PostgreSQL** database.
   - **My Contribution:** Integrated Keycloak for secure access and token management.

### 4. **`hocuspocus-server`**
   - A **Node.js backend** for configuring a **WebSocket API** using **HocusPocus**.
   - **My Contribution:** Developed and configured the WebSocket API to ensure secure real-time collaboration and token management.

---

## Technologies Used
- **Frontend:** React.js
- **Backend:** Express.js, Node.js, HocusPocus (WebSocket API)
- **Database:** PostgreSQL
- **Authentication:** Keycloak
- **Image Storage & Serving:** NGINX
- **Containerization:** Docker
- **Version Control:** Git

---
