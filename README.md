# Form Builder

A modern, full-stack Form Builder system built with **RemixJS**, **TypeScript**, **Material UI**, and **Prisma**.

## Features

- **Admin Dashboard**: Create, edit, and manage forms.
- **Visual Form Editor**:
  - Live preview of the form as you build it.
  - Drag-and-drop field reordering.
  - Sidebar settings for each field (label, placeholder, validation, etc.).
- **AI Agent (Bonus)**: Chat with an AI assistant to automatically generate and add fields to your form.
- **Public Area**:
  - Browse all published forms.
  - Dynamic form filling with real-time validation.
  - Submission confirmation with a data summary modal.
- **Authentication**: Secure admin access via GitHub OAuth 2.0.
- **Database**: Persistent storage using SQLite via Prisma ORM.
- **API**: Modern GraphQL API using `graphql-yoga`.

## Tech Stack

- **Framework**: RemixJS (Vite)
- **Styling**: Material UI (MUI)
- **Database**: SQLite + Prisma
- **API**: GraphQL (Yoga)
- **Auth**: remix-auth + remix-auth-github
- **AI**: OpenAI (GPT-4o-mini)
- **Validation**: Zod
- **Infrastructure**: Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional, for containerized run)
- GitHub OAuth App (for authentication)
- OpenAI API Key (for AI feature)

### Local Setup

1. **Clone and Install**:
```bash
npm install --legacy-peer-deps
```

2. **Environment Variables**:
Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```
- `GITHUB_CLIENT_ID`: From GitHub Developer Settings
- `GITHUB_CLIENT_SECRET`: From GitHub Developer Settings
- `OPENAI_API_KEY`: From OpenAI Dashboard

3. **Database Initialization**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run Dev Server**:
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

### Running with Docker

```bash
docker compose up --build
```

## Admin Access

Click "Admin Login" on the home page. You will be redirected to GitHub for authentication. Once logged in, you can create and publish forms.

## AI Assistant Usage

In the Form Editor, click the robot icon in the top right. You can type instructions like:
- "Add a required phone number field"
- "Add a multiline text area for comments"
- "Add a number field for age with min value 18"
# form-builder
