# Clinic Management System (CMS) - Backend

## Overview

The Clinic Management System (CMS) Backend is a RESTful API built using **Node.js**, **Express.js**, and **MongoDB**. It provides secure authentication, user management, appointment management, and role-based access control for a clinic management platform.

The backend is designed to support multiple user roles such as **Admin**, **Doctor**, **Receptionist**, and **Patient**, while ensuring secure access using JWT-based authentication.

---

## Features

* JWT Authentication
* Access & Refresh Token Authentication
* Role-Based Access Control (RBAC)
* User Registration & Login
* Secure Password Hashing using bcrypt
* User Profile Management
* Appointment Management APIs
* Protected Routes
* Cookie-based Authentication
* MongoDB Database Integration
* Error Handling Middleware
* Input Validation
* Modular Project Structure
* RESTful API Design

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)
* bcrypt

### File Upload

* Multer
* Cloudinary

### Other Packages

* dotenv
* cookie-parser
* cors
* nodemon

---

## Project Structure

```
CMS_Backend
│
├── public/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd CMS_Backend
```

### Install Dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env` file in the root directory.

Example:

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Running the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## Authentication

The backend uses **JWT Authentication** with:

* Access Token
* Refresh Token

Protected routes require a valid Access Token.

---

## User Roles

The system supports Role-Based Access Control.

Example roles:

* Admin
* Doctor
* Receptionist
* Patient

Each role has access only to authorized resources.

---

## API Modules

### Authentication

* Register User
* Login
* Logout
* Refresh Access Token

### User

* Get User Profile
* Update User Profile
* Get All Users
* Delete User

### Appointment

* Create Appointment
* Update Appointment
* Cancel Appointment
* Get Appointment Details
* Get User Appointments

---

## Response Format

### Success

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {}
}
```

### Error

```json
{
    "success": false,
    "message": "Error message"
}
```

---

## Security

* Password hashing using bcrypt
* JWT Authentication
* Refresh Token Rotation
* Protected Routes
* Role-Based Authorization
* Environment Variables
* HTTP-only Cookies
* CORS Configuration

---

## Future Improvements

* Email Verification
* Password Reset
* Doctor Schedule Management
* Medical Records
* Prescription Management
* Notifications
* Billing Module
* Dashboard Analytics
* Audit Logs
* API Documentation (Swagger/OpenAPI)

---

## Contributing

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

## Author

Developed by **Devansh Parashar**.
