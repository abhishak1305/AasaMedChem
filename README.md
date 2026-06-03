# AasaMedChem Inventory and Order Management

A Next.js application for managing chemical/lab product stock, quotations, and orders.

**Status**: Hackathon submission project. Code is intentionally straightforward for easy explanation.

## Features

- ✅ User authentication with NextAuth (ADMIN and SELLER roles)
- ✅ Admin product catalog management (create, read, update, delete)
- ✅ Seller product search and browsing
- ✅ Unit conversions: `g` ↔ `kg`, `mL` ↔ `L`, `item` (with 8-decimal precision)
- ✅ INR price display with 4-decimal precision
- ✅ Quotation workflow: seller creates → admin reviews → approves/rejects
- ✅ Order conversion: admin converts approved quotations into orders
- ✅ Inventory deduction on order creation
- ✅ Admin and seller order views with detailed line items
- ✅ Responsive dark-themed UI

## Tech Stack

- **Framework**: Next.js 16.2.7 (App Router)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with JWT strategy
- **Styling**: Tailwind CSS + inline styles
- **UI Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/    Auth routes
│   ├── admin/                      Admin pages
│   │   ├── products/               Product CRUD
│   │   ├── quotes/                 Quotation review & order conversion
│   │   └── orders/                 Order viewing
│   ├── dashboard/                  Seller pages
│   │   ├── products/               Browse products
│   │   ├── quotes/                 Create quotations
│   │   └── orders/                 View orders
│   ├── login/                      Login page
│   └── AppShell.js                 Navigation wrapper
├── db/
│   ├── schema.js                   Database tables (Drizzle)
│   ├── index.js                    DB connection pool
│   └── seed.js                     Seed test users
└── utils/
    ├── units.js                    Unit conversion logic
    └── units.test.js               Conversion tests
```

## Database Schema

### Users
- `id` (UUID, PK)
- `email` (Unique)
- `passwordHash` (bcrypt hashed)
- `role` (ADMIN | SELLER)

### Products
- `id`, `sku` (Unique), `name`, `description`
- `dimension` (WEIGHT | VOLUME | COUNT)
- `baseUnit` (g | kg | L | mL | item)
- `pricePerBaseUnit` (NUMERIC 20,4)
- `stockQty` (NUMERIC 20,8)
- `minStockAlert` (NUMERIC 20,8)

### Quotations & Quotation Items
- Seller creates quotation with client details
- Line items store: product, requested quantity/unit, converted qty, price
- Status workflow: DRAFT → PENDING_REVIEW → APPROVED/REJECTED → CONVERTED

### Orders & Order Items
- Created from approved quotations
- Status: PROCESSING, SHIPPED, DELIVERED, CANCELLED
- Stock automatically deducted on order creation

## Unit Conversions

**Supported Conversions:**

| From | To | Ratio |
|------|-----|-------|
| g | kg | ÷ 1000 |
| kg | g | × 1000 |
| mL | L | ÷ 1000 |
| L | mL | × 1000 |
| item | item | × 1 |

**Precision**: 8 decimal places for quantities, 4 decimal places for prices.

**Example:**
- Product: 100g stored as base unit
- Price: ₹500/kg (pricePerBaseUnit)
- Seller requests: 250g
- Conversion: 250g = 0.25kg
- Price: 0.25 × 500 = ₹125

## Pricing Calculations

All prices calculated with consistent 4-decimal precision:

```
Unit Price = (Conversion Factor) × (Price Per Base Unit)
Line Total = Unit Price × Quantity
Grand Total = Sum of all Line Totals
```

Prices stored as `NUMERIC(20,4)` to prevent floating-point errors.

## Local Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Neon PostgreSQL URL and NEXTAUTH_SECRET

# Create database schema
npm run db:push

# Seed test users
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@aasamedchem.com` | `adminSecurePassword123` |
| Seller | `seller@aasamedchem.com` | `sellerSecurePassword123` |

## Usage Flows

### Admin Workflow
1. Login as admin
2. Go to "Manage Products" → Add chemical products with:
   - SKU (unique identifier)
   - Name, description
   - Dimension (weight/volume/count)
   - Base unit for storage
   - Price per base unit (e.g., ₹/kg)
   - Initial stock
3. Go to "Quotations" → Review seller requests → Approve or Reject
4. Approved quotations → Click "Convert to Order"
5. View all orders and inventory

### Seller Workflow
1. Login as seller
2. Go to "Browse Products" → View available catalog with prices
3. Go to "New Quotation" → Create quotation:
   - Enter client name & email
   - Add products with desired quantities and units
   - System auto-converts to base units and calculates prices
   - Submit for admin review
4. View quotation status and approved orders

## Deployment

### Neon PostgreSQL

1. Create account at [neon.tech](https://neon.tech)
2. Create database and copy connection URL
3. Set `DATABASE_URL` in your environment

### Vercel

1. Connect GitHub repository
2. Add environment variables:
   - `DATABASE_URL` (Neon connection string)
   - `NEXTAUTH_SECRET` (Generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (Your domain)
3. Deploy

## Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test:units       # Run unit conversion tests
npm run db:push          # Migrate schema to database
npm run db:generate      # Generate migration files
npm run db:seed          # Seed default users
```

## Key Design Decisions

1. **Precision**: NUMERIC columns used for financial/quantity accuracy
2. **Conversions**: Centralized in `units.js`, used by both client preview and server calculations
3. **Transactions**: Stock validation before order creation prevents partial operations
4. **Auth**: Middleware redirects unauthorized access
5. **Styling**: Inline styles + Tailwind for simplicity (no component library)
6. **Error Handling**: Descriptive error messages for user feedback

## Limitations & Future Improvements

- User management requires database seed (no UI for adding sellers)
- No pagination on large datasets
- No email notifications
- No audit trail/logging
- No PDF export

## Testing

```bash
# Run unit conversion tests
npm run test:units

# Manual test: Create quotation with various units and quantities
# Verify: Client preview price = database stored price
```

## Notes for Evaluators

- **Code is intentionally simple**: Easy to understand, explain, and modify
- **One file per feature**: Clear separation without over-abstraction
- **Validation everywhere**: Client and server-side checks for data integrity
- **Error messages**: Descriptive feedback for debugging
- **Security**: NextAuth handles sessions; input validation prevents SQL injection


