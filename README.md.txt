# Email Service

## Setup Instructions
1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## Assumptions
- Mock providers are used instead of actual email sending
- Rate limit is set to 5 emails per minute

## Features
- Retry mechanism with exponential backoff
- Fallback between providers
- Idempotency to prevent duplicate sends
- Basic rate limiting
- Status tracking for email sending attempts
