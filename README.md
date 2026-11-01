# Zahrat Manisa — Admin Dashboard

Operational dashboard for **Zahrat Manisa** (زهرة مانيسا), a travel platform focused on airline ticket search and booking.

This app is the admin control center: bookings, flights, ticketing, customers, payments, promotions, reports, roles, and integrations. The interface is in English and Arabic.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 and shadcn/ui
- TanStack Query and Axios for API data
- TanStack Table, React Hook Form, Zod, Zustand
- Biome for formatting and linting

## Screens

- Overview and finance
- Bookings, flights, ticketing, cancellations
- Customers and support
- Transactions, refunds, reconciliation
- Promotions, notifications, campaigns
- Reports and analytics
- Users, roles, and permissions
- Airlines and providers, integrations, audit logs, settings

## Data architecture

Routes and layouts use the Next.js App Router. Browser data comes from the Python API through Axios and TanStack Query. Zustand holds shared UI state only.

The architectural contract, including loading, skeletons, permissions, and the move from mock data to the Python API, is in [docs/data-architecture/README.md](docs/data-architecture/README.md).

## Run locally

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build
npm run lint
npm run format
npm run check
```
