# AI Customer Support Refund Agent

Production-shaped Next.js application for a refund support agent. The customer chat collects refund requests, the agent calls tools against seeded order data, deterministic policy code validates decisions, and the admin dashboard displays persisted reasoning logs.

## Features

- **Customer Chat Interface**: Interactive chat for customers to request refunds with order/item selection
- **AI Agent**: LangGraph-based agent that uses tools to retrieve order facts and apply refund policy
- **Deterministic Policy Validator**: TypeScript policy code that validates and overrides LLM decisions
- **Admin Dashboard**: View conversations, refund requests, and detailed reasoning logs
- **Admin Override**: Admins can override refund decisions with rationale
- **Seeded Data**: Pre-populated customers, orders, products, and refund scenarios
- **Authentication**: Admin login with NextAuth.js credentials provider

## Architecture

### Agent Flow
1. **Agent Reasoning Node**: LLM reviews conversation and selects refund tools
2. **Tool Executor Node**: Calls tools to get order details, check eligibility, calculate amount
3. **Policy Validator Node**: Validates proposed decision against deterministic policy rules
4. **Persist Decision Node**: Saves refund request and agent logs to database

### Policy Rules
- Refunds only for delivered orders
- Product must be returnable (excludes Gift Cards, Digital products)
- Must be within product's return window (default 30 days)
- No duplicate open refunds for same item
- High-value refunds (>₹10,000) auto-escalate to human
- Partial refunds for missing accessories/partial issues (25% of value)

### Database Models
- `Customer`: Customer profiles with orders and conversations
- `Order`: Order details with items and delivery status
- `Product`: Product catalog with returnability settings
- `Conversation`: Chat sessions with messages
- `Message`: Individual chat messages
- `RefundRequest`: Refund requests with decisions and overrides
- `AgentLog`: Detailed reasoning logs for each agent step
- `AdminUser`: Admin accounts for dashboard access

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed database with test data:
   ```bash
   npm run seed
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Usage

### Customer Chat
1. Navigate to `/chat`
2. Select a customer from the dropdown (simulated authentication)
3. Select an order and item from the picker
4. Describe the refund issue in the chat
5. The agent will respond with a decision based on policy

### Admin Dashboard
1. Navigate to `/admin/login`
2. Login with `admin@example.com` / `password123`
3. View dashboard metrics at `/admin`
4. Browse conversation logs at `/admin/logs`
5. View and manage refund requests at `/admin/refunds`
6. Click on conversation or refund IDs to view detailed reasoning traces
7. Override refund decisions using the Override button

## Environment Variables

- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption
- `NEXTAUTH_URL`: Application URL (default: `http://localhost:3000`)
- `ADMIN_EMAIL`: Admin email for login (default: `admin@example.com`)
- `ADMIN_PASSWORD`: Admin password (default: `password123`)
- `LLM_PROVIDER`: LLM provider - `local` or `openai` (default: `local`)
- `OPENAI_API_KEY`: OpenAI API key (requiredif using OpenAI)
- `OPENAI_MODEL`: OpenAI model to use (default: `gpt-4o-mini`)
- `LOG_LEVEL`: Logging level (default: `info`)

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking
- `npm run test`: Run Vitest tests
- `npm run seed`: Seed database with test data

## Testing

Run the test suite:
```bash
npm run test
```

Tests cover:
- Policy eligibility checks (delivery, return window, category, duplicates)
- Refund amount calculations (full and partial)
- Policy validator overrides
- Edge cases (missing delivery date, non-returnable items)

## Why The Validator Exists

The LLM can understand intent and assemble facts, but deterministic TypeScript makes the final refund decision. Every proposed decision is rechecked by `src/lib/policy/refund-policy.ts` before persistence. If the model proposes an outcome that violates policy, the validator wins and records the override in `AgentLog`.

This ensures:
- Policy compliance regardless of LLM behavior
- Audit trail of all decisions and overrides
- Human review of edge cases via escalation
- Consistent application of business rules

## Scope Notes

### Customer Authentication
Customer authentication is intentionally simulated with a seeded customer selector. In production this would be replaced by the storefront session or JWT and the chat API would derive `customerId` from trusted auth context instead of accepting it from the browser.

### Database
SQLite is used for local development because it keeps the assignment self-contained. For serverless deployment, use PostgreSQL via Prisma by changing the datasource provider and `DATABASE_URL`, since file-backed SQLite is not durable on ephemeral serverless filesystems.

### Voice Support
Voice support can be added later by feeding speech-to-text output into the same chat send function; the agent and policy layers do not need to change.

### LLM Provider
The application supports both local (deterministic) and OpenAI-based LLMs. Set `LLM_PROVIDER=openai` and provide an `OPENAI_API_KEY` to use OpenAI. The local mode uses deterministic tool execution without an LLM, which is suitable for testing and scenarios where LLM costs need to be avoided.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v5
- **AI/Agent**: LangGraph with LangChain
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Testing**: Vitest
- **Validation**: Zod
