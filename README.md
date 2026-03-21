# portfolio-gallery

Personal portfolio website and photography gallery built on AWS serverless infrastructure.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Express API running on AWS Lambda via serverless-http
- **Image Storage:** S3 with CloudFront CDN + Lambda thumbnail generation
- **Infrastructure:** AWS CDK (TypeScript)
- **CI/CD:** GitHub Actions
- **Database:** MongoDB Atlas (free tier)

## Project Structure

```
├── frontend/          React SPA
├── backend/           Express API (Lambda-ready)
├── lambdas/           Standalone Lambda functions (thumbnail generator)
├── infra/             AWS CDK infrastructure
└── .github/workflows/ CI/CD pipelines
```

## Getting Started

```bash
# Install all dependencies
npm install

# Run frontend dev server
npm run dev:frontend

# Run backend locally
npm run dev:backend

# Deploy infrastructure
npm run infra:deploy
```
