# Budgeting and Investment Recommendation App - Backend

## Overview

Hi there! Welcome to the backend of the **Budgeting and Investment Recommendation App**. I built this app to help users manage their finances, track income and expenses, and, optionally, receive personalized investment recommendations based on their financial profile. The backend is developed using **Node.js**, **Express.js**, and **PostgreSQL**, with a focus on security and performance.

## Key Features

- **User Authentication and Security**
  - Secure sign-up and login system with password hashing.
  - Email verification to ensure account security.
  - Multi-Factor Authentication (MFA) for an added layer of protection.

- **Budget Tracking**
  - Users can easily input their income and expenses.
  - Disposable income is automatically calculated based on the financial data provided.

- **Email Notifications**
  - Users will receive notifications for account updates like password changes or new logins from unfamiliar devices.
  - **Optional**: Investment alerts to notify users about portfolio updates or new recommendations.

- **Investment Recommendations** (Optional)
  - AI-powered stock recommendations based on the user's financial profile and risk tolerance.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Mocha, Chai, Supertest (for API testing), Jest (for full-stack testing)

## Setup and Installation

Here’s how you can set up the backend on your local machine:

### Prerequisites

Make sure you have the following installed:

- Node.js (v14 or later)
- PostgreSQL (v12 or later)

### Installation

1. First, clone the repository:

   ```bash
   git clone https://github.com/DiandreMiller/WealthWise-backend.git
   cd WealthWise-backend

2. Install all the dependencies:
   ```bash
   npm install

3. Set up the environment variables:

You’ll need to create a .env file in the root directory with the following values:
    ```bash
    PORT=your_port
    DB_HOST=your_host
    DB_NAME=your_db_name
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DATABASE_URL=your_postgresql_database_url
    JWT_SECRET=your_jwt_secret
    EMAIL_HOST=smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USER=your_email_username
    EMAIL_PASS=your_email_password
    EXPECTED_ORIGIN=http://localhost:5173
    EXPECTED_RPID=localhost
    FRONTEND_URL_LOCAL=http://localhost:5173


4. Run the PostgreSQL migrations:
    ```bash
    psql -U yourusername -d yourdatabase < db/migrations.sql

5. Start the backend server:
    ```bash
    nodemon server.js


[Deployed Backend Link](https://icapital-financial-planner-backend.onrender.com/)

//Consider adding yahoo finance api:
https://www.npmjs.com/package/yahoo-finance2

