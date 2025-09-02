
# EasyGenerator Task

**Author:** Abdelrahman Abbas
**Contact:** [abd.elrahman.abbas.1318@gmail.com](mailto:abd.elrahman.abbas.1318@gmail.com)

---

## 📖 Description

This repository contains the **EasyGenerator Task**, provided as part of the hiring process phases.
The project is built using **Node.js** with **NestJS**, and integrates authentication, testing, and logging features.

---

## 🚀 Tech Stack

- **Node.js** (>= 18.x)
- **Yarn** (>= 1.22.x)
- **NestJS**
- **Mongoose** (MongoDB ODM)
- **MongoDB Atlas**
- **Passport.js** (authentication middleware)
- **JWT** (JSON Web Token for auth)
- **Jest** (unit & integration testing)

---

## ⚙️ Development Setup

1. Ensure you are using the required Node.js version:

   ```bash
   node -v
   ```

   Must be `>= 18`.

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env` file in the project root and configure the required variables:

   ```env
   MONGO_URI=<your-mongodb-atlas-url>
   JWT_SECRET=<your-secret-key>
   PORT=3000
   ```

4. Start the development server:

   ```bash
   yarn start:dev
   ```

---

## 🧪 Testing

The project uses **Jest** for testing. To run the test suite:

```bash
yarn test
```

---

## 📦 Production Deployment

Deployment is handled via **GitHub Actions pipelines** with AWS.

### Requirements

- An AWS machine (EC2 or similar) with a configured user (e.g., `root`).
- SSH key pair (private key stored in GitHub secrets, public key added to the server).
- GitHub repository secrets configured:
  - `AWS_USER` → your AWS machine username (e.g., `root`)
  - `AWS_HOST` → your AWS machine IP or domain (e.g., `197.155.14.5`)
  - `DEPLOY_KEY` → private SSH key for deployment

### Steps

1. On your AWS machine, create a deployment directory:

   ```bash
   mkdir -p ~/easy-task
   ```

   Add your `.env` file inside this directory with all required environment variables.

2. Add the following secrets to your GitHub repository:
   - `AWS_USER`
   - `AWS_HOST`
   - `DEPLOY_KEY`

3. On push to the main branch, the GitHub Actions pipeline will:
   - Build the project
   - Connect to the AWS machine
   - Deploy the latest version into `~/easy-task`

🌍 Deployment

The backend is deployed and accessible at:
👉 http://51.20.246.245:4200

📑 API Documentation

The API is fully documented using Swagger and can be accessed here:
👉 http://51.20.246.245:4200/api-docs
GLOBAL PREFIX = api/v1
