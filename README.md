# NaturalHarvest

**Pure from Nature, Healthy for Life.** A full-stack e-commerce app for natural pulses and rice.

React + Vite + Tailwind on the front, Express + MongoDB (Mongoose) on the back, JWT auth with customer and admin roles.

## Features

- **Storefront:** home page, product listing with search, filters (category, price, rating, pack size, organic, availability) and six sort orders, product pages (gallery, pack sizes, stock, delivery estimate, benefits, storage, nutrition card, reviews), categories, global search with live suggestions and a no-results state.
- **Cart:** add, remove, change quantity and pack size, subtotal / discount / shipping / tax / grand total. Guests get a local cart that merges into their account on login.
- **Wishlist:** stored in MongoDB for logged-in users; move to cart in one click.
- **Accounts:** register, login, persistent login, protected routes, profile with saved addresses, change password.
- **Checkout and orders:** address form, Cash on Delivery, online payment placeholder (gateway adapter ready for Razorpay or Stripe), order tracking timeline, customer cancel while early in the pipeline.
- **Reviews:** one per customer per product, only after a delivered order; average rating is recalculated.
- **Admin:** dashboard with charts (daily sales, monthly revenue, orders, status mix, top sellers), product CRUD with Cloudinary multi-image upload, inline stock edits, order search / filter / status updates / cancellation, customers (view, deactivate), categories, reviews, contact messages.
- **Pages:** Why NaturalHarvest (farm to customer journey), contact, FAQ, 404.

## Tech stack

Frontend: React 18, Vite, Tailwind CSS 3, React Router 6, Axios, Lucide React, Recharts.
Backend: Node 18+, Express, Mongoose, JWT, bcryptjs, express-validator, helmet, CORS, rate limiting, Multer + Cloudinary.
Database: MongoDB (Atlas for production).

> **bcrypt note:** the app uses `bcryptjs`, a pure-JavaScript, API-compatible implementation. It hashes with the same algorithm and avoids native build problems on Render and Railway.

## Folder structure

```
naturalharvest/
├── backend/
│   ├── config/        db + cloudinary
│   ├── controllers/   auth, product, category, cart, wishlist, order, review, admin, upload, public
│   ├── middleware/    auth (protect / adminOnly), validate, error, upload
│   ├── models/        User, Product, Category, Cart, Order, Review, Subscriber, Message
│   ├── routes/
│   ├── utils/         pricing, paymentGateway adapter, seed.js, seedProducts.js, helpers
│   ├── tests/smoke.mjs   112-check API test
│   └── server.js
├── frontend/
│   ├── public/        your photos (products, categories, hero)
│   └── src/
│       ├── components/ context/ hooks/ layouts/ pages/ (pages/admin) services/ utils/
│       └── __tests__/app.smoke.test.jsx
├── render.yaml  README.md  .gitignore
```

## Installation

You need Node 18+ and a MongoDB database.

### 1. MongoDB

Easiest: a free **MongoDB Atlas** cluster. Create a database user, allow your IP under *Network Access*, and copy the connection string (`mongodb+srv://…`). For local MongoDB use `mongodb://127.0.0.1:27017/naturalharvest`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit the values
npm run seed              # creates categories, 26 products, demo customers, orders, reviews and the admin
npm run dev               # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## Environment variables

**backend/.env**

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret            # use a long random string: openssl rand -hex 48
CLIENT_URL=http://localhost:5173  # comma-separate several origins if needed
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# optional, used by the seed script
ADMIN_NAME=NaturalHarvest Admin
ADMIN_EMAIL=admin@naturalharvest.com
ADMIN_PASSWORD=ChangeMe@123
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

No secret is hard-coded, `.env` files are git-ignored, and the frontend only ever sees `VITE_API_URL`.

## Seed database

```bash
npm run seed            # wipes the database, then inserts demo data
npm run seed:destroy    # wipes only
```

Seeding refuses to run with `NODE_ENV=production` unless you pass `--force`. **It deletes everything**, so use it on a fresh database only.

## Admin login setup

`npm run seed` creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults above). **Change the password** before deploying: set the env values before seeding, or log in and use *Profile → Change password*. Registration can only create customers; the admin role cannot be requested through the API.

Demo customers (seed only): `ananya@example.com` and seven others, password `Customer@123`.

## Pricing rules

Prices are stored **per kg**; pack prices are `price × grams / 1000`. Stock is stored in **kg**. Shipping is free when the discounted subtotal is ₹500 or more, otherwise ₹49. Tax is 5% GST on the discounted subtotal. Constants live in `backend/utils/pricing.js` and `frontend/src/utils/pricing.js`. The server always recalculates totals from database prices at checkout.

## API documentation

Base URL `/api`. Send `Authorization: Bearer <token>` for protected routes. Errors return `{ "message": "...", "errors": [{ "field", "message" }] }`.

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | public |
| | `GET /auth/profile`, `PUT /auth/profile`, `PUT /auth/password` | user |
| Products | `GET /products` (query: `search, category, type, minPrice, maxPrice, rating, weight, organic, inStock, featured, bestSeller, sort, page, limit`) | public |
| | `GET /products/:id` (id or slug), `GET /products/:id/reviews` | public |
| | `POST /products`, `PUT /products/:id`, `DELETE /products/:id` | admin |
| Categories | `GET /categories`, `GET /categories/:id` | public |
| | `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` | admin |
| Cart | `GET /cart`, `POST /cart`, `PUT /cart/:itemId`, `DELETE /cart/:itemId`, `DELETE /cart` | user |
| Wishlist | `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/:productId` | user |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PUT /orders/:id/cancel` | user |
| | `PUT /orders/:id/status`, `PUT /orders/:id/payment` | admin |
| Reviews | `POST /reviews`, `GET /reviews/eligibility/:productId` | user |
| | `GET /reviews/featured` | public |
| | `GET /reviews`, `DELETE /reviews/:id` | admin |
| Admin | `GET /admin/stats`, `GET /admin/orders`, `GET /admin/customers`, `GET /admin/customers/:id`, `PUT /admin/customers/:id/active`, `GET /admin/messages`, `PUT /admin/messages/:id/read` | admin |
| Uploads | `GET /uploads/status`, `POST /uploads` (multipart `images`) | admin |
| Other | `POST /newsletter`, `POST /contact`, `GET /health` | public |

Order statuses: Order Placed, Confirmed, Processing, Packed, Shipped, Out for Delivery, Delivered, Cancelled. Delivered and Cancelled are final. Cancelling returns stock.

## Payments

`backend/utils/paymentGateway.js` is the only place orders talk to a payment provider. Today, `online` orders stay `Pending` until an admin marks them paid. To add Razorpay or Stripe, implement `createPayment` and `verifyPayment` there (sketches are in the file), add a verify endpoint, and read the keys from environment variables.

## Catalogue and photos

The catalogue has two categories, **Pulses** and **Rice**, with 20 seeded products (`backend/utils/seedProducts.js`). Types such as Toor Dal or Basmati Rice are set per product and appear as filter chips on the category pages.

**Using your own photos** (no illustrations are shipped; products without a photo show a plain "Photo coming soon" placeholder):

1. Save photos in `frontend/public/products/` named after the product slug, lowercase, for example `organic-toor-dal.jpg`. Optional extra views: `organic-toor-dal-2.jpg`, `-3.jpg`.
2. Category photos go in `frontend/public/categories/` as `pulses.jpg` and `rice.jpg`. Hero files live in `frontend/public/hero/`.
3. Resize first: about 1600 px on the long side, WebP or JPG, under 300 KB each.
4. Run `cd backend && npm run use-photos`. It links every photo it finds to its product and lists the products still waiting for one. Run it again whenever you add photos, and after any re-seed.

Slugs are the product name lower-cased with dashes, for example `Kidney Beans (Rajma)` becomes `kidney-beans-rajma`. The admin product form can also upload to Cloudinary (once the keys are set) or accept pasted image URLs.

## Testing

```bash
# API: needs a seeded database and the server running
cd backend && npm run seed && npm start        # terminal 1
node tests/smoke.mjs                           # terminal 2  (API_URL=… to target another host)

# UI: renders the real app against that running API
cd frontend && npm test
```

## Deployment

1. **Database:** MongoDB Atlas. Create a user, then allow your host's outbound IPs (or `0.0.0.0/0` for a hobby project) under *Network Access*.
2. **Backend on Render:** *New → Blueprint* using `render.yaml`, or create a Web Service with root `backend`, build `npm install`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL, no trailing slash) and the Cloudinary keys. Railway works the same way with root directory `backend`.
3. **Seed once** against Atlas from your machine: set `MONGO_URI` in `backend/.env` and run `NODE_ENV=development npm run seed`, then change the admin password.
4. **Frontend on Vercel:** import the repo, set the root directory to `frontend`, framework *Vite*, and add `VITE_API_URL=https://<your-api>.onrender.com/api`. `vercel.json` already rewrites all routes to `index.html`.
5. Add the Vercel domain to the backend's `CLIENT_URL` so CORS allows it.

## Before going live

- Replace the placeholder contact details in the footer, Contact and FAQ pages.
- Replace seeded nutrition values with lab-tested figures, and keep product claims factual.
- Confirm GST treatment for your products and adjust `TAX_RATE` if needed.
- Enable HTTPS-only and set a strong `JWT_SECRET`.
#   N a t u r a l N a r v e s t  
 