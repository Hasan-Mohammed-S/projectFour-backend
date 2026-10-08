# Handmade Market — Backend

Express API for a marketplace of independent handmade-product stores. Provides authentication, store/product management, Cloudinary images, transactional checkout, stock updates, order history, and seller fulfillment tracking.

## Technology

- Node.js and Express 5 with CommonJS modules.
- MongoDB and Mongoose 9.
- JWT authentication and bcrypt password hashing.
- Cloudinary SDK, Multer, Helmet, CORS, and authentication rate limiting.
- Node's built-in test runner and `mongodb-memory-server`.

## Requirements

- Node.js **22.12 or later** and npm.
- MongoDB Atlas or a local MongoDB **replica set**. Standalone MongoDB cannot support checkout transactions.
- A Cloudinary account for real image uploads.
- The accompanying frontend, normally at `http://localhost:5173`.

## Local setup

Run commands from `BackEnd/BackEnd/` in the supplied project, or the directory containing the backend's `package.json` if cloned separately.

1. Install locked dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env` in this directory. In Bash or Git Bash:

   ```bash
   cp .env.example .env
   ```

   Alternatively, copy and rename it through your editor or file manager.

3. Configure `.env` with your own credentials:

   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/handmade_market?retryWrites=true&w=majority
   JWT_SECRET=replace_with_your_generated_secret
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   All credential values above are placeholders. Copy your Atlas connection string and explicitly select `handmade_market`. Retain the connection options supplied by Atlas. For a standard URI ending in `:27017/?ssl=true&...`, change that portion to `:27017/handmade_market?ssl=true&...`.

4. Generate a random signing secret and paste the output into `JWT_SECRET`:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

5. Start the backend:

   ```bash
   npm run dev
   ```

   Successful startup prints:

   ```text
   Database connected.
   API ready.
   ```

6. Open `http://localhost:3000/`. The response is:

   ```json
   { "message": "Marketplace API is running." }
   ```

This confirms an HTTP response; the root endpoint is not a continuous database health check. Start the frontend separately.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000`. |
| `MONGODB_URI` | Required connection string with explicit database name and replica-set support. |
| `JWT_SECRET` | At least 32 characters; placeholders starting with `replace_` are rejected. |
| `FRONTEND_URL` | Allowed frontend origin; defaults to `http://localhost:5173`. Multiple origins may be comma-separated. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name; required for image uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key; backend only. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret; backend only. |
| `NODE_ENV` | Set to `production` in production; tests set their own environment. |

`SESSION_SECRET`, `SECRET_NUMBER`, and `PASSWORD` are not used by the current authentication flow. Restart after changing environment variables. Do not commit `.env` or place secrets in frontend code.

## Database setup and existing data

Use a dedicated database such as `handmade_market`, rather than sharing `test.users` with unrelated projects. Model initialization creates collections and indexes before accepting requests. A fresh database contains no accounts, stores, or products; create them through the application.

Selecting a new database does not delete or migrate the old one. Existing application data requires a deliberate migration that preserves document IDs and relationships.

An `E11000` startup error means existing records violate a unique index. Multiple legacy users missing `phoneNumber`, for example, conflict with its unique index. Select the correct dedicated database or review and correct existing application records. Do not remove uniqueness checks to bypass invalid data.

For Atlas, configure a database user with access to the selected database and allow the backend host through Atlas network access. URL-encode special characters in connection-string credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies. |
| `npm run dev` | Start with Nodemon. |
| `npm start` | Start with Node. |
| `npm test` | Run integration tests. |

## Folder structure

| Location | Responsibility |
| --- | --- |
| `server.js` | Environment, middleware, routing, startup, and shutdown. |
| `config/` | MongoDB, Cloudinary, and Multer configuration. |
| `models/` | User, Store, Product, and Order schemas and indexes. |
| `routes/` | Authentication, store, product, order, and administrator endpoints. |
| `controllers/` | HTTP request handling and scoped data access. |
| `middleware/` | Authentication, seller/admin guards, and centralized errors. |
| `services/` | Validation, image uploads/cleanup, and transactional checkout. |
| `tests/` | Integration tests and the synthetic browser-test API. |

## Models and relationships

| Model | Main data and relationships |
| --- | --- |
| User | Unique username, phone, email; hashed password; buyer/seller/admin role; active flag. |
| Store | Unique name, description, address, image URL/public ID; owner references User; active/archive flags. |
| Product | Name, description, category, price, integer stock, image URL/public ID; store references Store; archive flag and version. |
| Order | Buyer and store references; item product references; customer/store/product/price/image snapshots; total, address, status history, checkout key, and timestamps. |

Order snapshots preserve purchase details when catalog information changes. Product/store removal archives records; administrator user removal deactivates the account. Order deletion is rejected.

## Authentication and authorization

Public registration accepts `buyer` or `seller`; administrator registration is not exposed. Login accepts username, email, or phone number. JWTs expire after eight hours and are verified using HS256. Each authenticated request loads the current database user and rejects missing/deactivated accounts.

Protected requests use:

```http
Authorization: Bearer <token>
```

Passwords are hashed with bcrypt and excluded from serialized account responses. Signup and login are rate-limited. Sellers manage only owned stores/products and see only their stores' orders. Buyers see only their own orders. Only buyers can checkout; sellers cannot purchase products.

Logout acknowledges sign-out and the client removes its token. There is no server-side token revocation list; an otherwise valid token remains valid until expiry or account deactivation.


## user stories

### Visitors

| ID  | User story                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| U01 | As a visitor, I would like to browse the available stores to find the product I want.                      |
| U02 | As a visitor, I would like to filter products by type and price so that I can find what suits me.                       |
| U03 |As a visitor, I would like to view the product images, price, and description so that I can see the important details. |
| U04 |As a visitor, I would like to create a store or buyer account so that I can use the platform. |
| U05 | As a user, I want to sign in and sign out so that I can securely access my account.                                                              |
| U06 |As a user, I would like to edit my name, phone number, and other details to ensure the accuracy of my profile.                                                        |

### Buyer

| ID  | User story                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| B01 | As a buyer, I would like to view all information about the store and its products so that I can see what is currently available and what custom products I can order.                   |
| B02 | As a buyer, I want to add products to the cart so I can review them and remove anything I don't want before completing the order.                     |
| B03 | As a buyer, I would like to view my current and past orders so that I can see everything I have ordered.                        |
| B04 | As a buyer, I would like to receive invoices so I can know the value of my purchases from stores.                   |




### Store

| ID  | User story                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | As a store owner, I want to create and edit my store profile so that I can showcase my products.                              |
| S02 | As a store owner, I would like to upload, replace, or remove my business logo so that buyers can recognize it.                            |
| S03 | As a store owner, I would like to add my products, along with their prices and full details, so that all buyers can view them.                                      |
| S04 | As the owner of the store, I would like to edit the information and change the images to ensure the accuracy of its description.       |
| S05 | As a store owner, I would like to set the products to "out of stock" status.                                    |
| S06 | As a store owner, I would like to delete products when they go out of stock, provided I do not intend to restock them in the future.                        |
| S07 | As an organizer, I would like to view the list of buyer orders from my account.                    |
| S08 | As a store owner , I would like to obtain all the buyer's details and address so that I can deliver the order.                |


### Admins

| ID  | User story                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------- |
| A01 | As an admin, I would like to view information about the stores—specifically their details and logos—so that I can identify the stores using the site for sales.    |
| A02 | As an admin, I would like to review the details regarding the number of users—specifically the number of stores and buyers—and view their data. |
| A03 | As an admin, I would like to remove stores that have recurring complaints, or buyers with recurring complaints, from the Owner Stores.           |

## Entity relationship diagrams (ERDs)

![Current collection relationships](imgs/ERD.png)

## API routes

The base URL is normally `http://localhost:3000`; there is no `/api` prefix. Responses are JSON. Errors use `{ "error": "message" }`.

| Method | Path | Access / behavior |
| --- | --- | --- |
| GET | `/` | Public API response. |
| POST | `/auth/signup`, `/auth/sign-up` | Register buyer/seller. |
| POST | `/auth/login`, `/auth/sign-in` | Login; returns user and token. |
| GET | `/auth/me` | Current authenticated account. |
| PUT | `/auth/me` | Update username, email, and phone. |
| POST | `/auth/logout` | Authenticated sign-out response. |
| GET | `/protected` | Authenticated account wrapped as `{ user }`. |
| GET | `/stores` | Active, non-archived public stores. |
| GET | `/stores/mine` | Seller's non-archived stores. |
| GET | `/stores/:id` | Active public store details. |
| POST | `/stores` | Seller creates store; owner assigned from authentication. |
| PUT | `/stores/:id` | Owning seller edits store. |
| DELETE | `/stores/:id` | Owner archives store after its products are archived. |
| GET | `/products`, `/products?store=:id` | Public catalog or store-filtered catalog. |
| GET | `/products/mine` | Seller's non-archived products. |
| GET | `/products/:id` | Public details; out-of-stock products remain viewable. |
| POST | `/products` | Seller creates product in owned store. |
| PUT | `/products/:id` | Owner edits product; current version required. |
| DELETE | `/products/:id` | Owner archives product. |
| POST | `/orders` | Buyer checkout with `Idempotency-Key` header. |
| GET | `/orders`, `/orders/mine` | Buyer/seller-scoped orders; administrators may view all. |
| GET | `/orders/store/:storeId` | Owning seller's store orders. |
| GET | `/orders/:id` | Order details within the user's access scope. |
| PUT | `/orders/:id` | Owning seller advances status. |
| DELETE | `/orders/:id` | Authenticated request rejected with 405; records retained. |
| GET | `/admin/stats`, `/admin/users`, `/admin/stores` | Administrator statistics/lists. |
| GET | `/admin/sales`, `/admin/sales/:id` | Administrator order/sales data. |
| DELETE | `/admin/users/:id`, `/admin/stores/:id` | Administrator deactivation; records retained. |

Registration fields: `username`, `phoneNumber`, `email`, `password`, and optional `role` (default `buyer`). Passwords require at least eight characters and at most 72 bytes. Login accepts `identifier` and `password`.

## Checkout and stock integrity

Example request body; replace ID placeholders with MongoDB document IDs:

```json
{
  "store": "<store-id>",
  "shippingAddress": "Building, road, block, and delivery details",
  "items": [{ "product": "<product-id>", "quantity": 3 }]
}
```

Send these headers:

```http
Content-Type: application/json
Authorization: Bearer <buyer-token>
Idempotency-Key: <unique-checkout-key>
```

The checkout key must contain 16–100 letters, numbers, underscores, or hyphens. Use one key per checkout attempt and reuse it when retrying that same request. Reusing a key with different contents returns 409.

Checkout verifies buyer identity, store availability, product membership, requested quantities, stock, and prices. Prices/totals come from MongoDB. Conditional stock decrements and order creation occur in one transaction; failures roll back stock changes, and stock cannot become negative. Replaying a successful checkout returns the existing order without decrementing again.

New orders return 201; successful replays return 200. Checkout is per store; the frontend clears only that store's purchased cart items. Adding to a cart never decrements backend stock.

## Order lifecycle

New orders start at `preparing`. The owning seller updates status with `PUT /orders/:id`:

```json
{ "status": "ready" }
```

Supported progression: **`preparing` → `ready` → `completed`**. The frontend labels `ready` as **Ready / On the Way**. Updates persist timestamped status history. Completed orders cannot move backward.

Legacy `pending`, `processing`, and `cancelled` values remain for compatibility. There is no new cancellation/refund workflow.

## Product editing and images

Store fields: `name`, `description`, `address`. Product fields: `name`, `description`, `category`, `price`, `stock`, and `store` on creation. Product edits require `version` equal to the current product's `__v`; a stale version returns 409 instead of overwriting intervening stock changes.

Store/product creation and editing accept multipart form data with optional file field **`image`**. Files must be JPG, PNG, or WebP, no larger than **5 MB**. MIME types and file signatures are checked before uploading to Cloudinary's `handmade-market` folder.

The returned secure URL is stored as `image`, and the asset ID as `imagePublicId`. Failed record saves clean up the newly uploaded image. Previous image assets are retained when replaced because historical orders may reference them.

Saving without an image works when Cloudinary is unconfigured; uploading then returns a configuration error. The frontend provides a local image fallback.

## Tests

From the backend directory:

```bash
npm test
```

Tests create a temporary MongoDB replica set with synthetic data and shut it down afterwards. The first run may need network access to download the MongoDB test binary. Coverage includes authentication/authorization, saved orders, backend pricing, stock rollback/concurrency, duplicate checkout requests, seller isolation, status changes, image validation, and product-edit conflicts.

Tests do not use your Atlas database. Cloudinary is mocked, so live credentials/uploads need a separate manual check. For browser workflows, install frontend dependencies and run its Playwright tests with ports 3000 and 5173 free.

## Production deployment

Install runtime dependencies with `npm ci --omit=dev`, supply secrets through the hosting environment, set `NODE_ENV=production`, and run `npm start`. Configure HTTPS, the deployed frontend origin, Atlas network access, and Cloudinary credentials.

The API connects to MongoDB and initializes indexes before listening. SIGINT/SIGTERM close the HTTP server and database connection. Review existing data/indexes before selecting an existing database. Configure the frontend's deployed API URL before building it.

## Troubleshooting

| Issue | Action |
| --- | --- |
| Startup fails before connecting | Check JWT secret length and reject placeholder values. |
| MongoDB connection fails | Check URI, credentials, permissions, Atlas network access, and connectivity. |
| `E11000` during startup | Review unique-field duplicates/missing values and the selected database. |
| Checkout transaction error | Use Atlas or a configured replica set rather than standalone MongoDB. |
| CORS errors | Set `FRONTEND_URL` to the exact frontend origin and restart. |
| Image upload fails | Check all three Cloudinary variables, type/size, and connectivity. |
| Product edit returns 409 | Reload the product and submit its latest stock and `__v`. |
| Login fails after database switch | Register accounts in the new database; migration is not automatic. |
| Port 3000 occupied | Stop the other process or change `PORT` and frontend API URL together. |

## Scope

The API manages orders and fulfillment; payments, refunds, tax/delivery fees, and email/SMS notifications are not implemented. Prices use the application's existing USD convention. Live Atlas data, real Cloudinary uploads, and hosting must be validated in the target deployment environment.
