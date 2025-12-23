# MERN Estate

Full-stack real estate listings app with authentication, profile management, image uploads, and listing CRUD.

## Features
- Email/password auth and Google OAuth
- Profile updates with avatar uploads
- Create, update, delete, and view listings
- Image upload via Appwrite Storage (URLs saved in MongoDB)
- Inline form validation and error handling

## Tech Stack
- **Frontend:** React, Vite, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Auth:** JWT cookies + Firebase Google OAuth
- **Storage:** Appwrite (image hosting)
- **Database:** MongoDB (Atlas or local)

## Project Structure
```
mern-estate/
  api/                # Express API + MongoDB models
  client/             # React + Vite frontend
  .env                # Server environment variables
```

## Prerequisites
- Node.js 18+ (22 works)
- MongoDB connection string (Atlas or local)
- Appwrite project + storage bucket
- Firebase project (for Google OAuth)

## Environment Variables

### Server (`.env` in repo root)
```
MONGO=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mern-estate?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
```

### Client (`client/.env`)
```
VITE_FIREBASE_API_KEY=<firebase_api_key>
VITE_APPWRITE_PROJECT_ID=<appwrite_project_id>
VITE_APPWRITE_PROJECT_NAME=<optional_display_name>
VITE_APPWRITE_ENDPOINT=https://<appwrite_endpoint>/v1
VITE_APPWRITE_BUCKET_ID=<appwrite_bucket_id>
```

Notes:
- For Atlas, ensure your IP is whitelisted under **Network Access**.
- If you see `EAI_AGAIN` DNS errors, try a different DNS resolver or use the non-SRV MongoDB connection string.

## Install
From the repo root:
```
npm install
cd client
npm install
```

## Run (Development)

Start the API (runs on `http://localhost:3000`):
```
npm run dev
```

Start the client (Vite dev server on `http://localhost:5173`):
```
cd client
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000` (see `client/vite.config.js`).

## Build (Client)
```
cd client
npm run build
npm run preview
```

## API Routes (Summary)

Auth:
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/google`
- `GET /api/auth/signout`

Users:
- `POST /api/user/update/:id`
- `DELETE /api/user/delete/:id`
- `GET /api/user/listings/:id`

Listings:
- `POST /api/listing/create`
- `POST /api/listing/update/:id`
- `DELETE /api/listing/delete/:id`
- `GET /api/listing/:id` (alias: `/api/listing/get/:id`)

## Data Model (Listing)
Key fields:
- `name`, `description`, `address`
- `type` (rent/sale), `offer`, `regularPrice`, `discountedPrice`
- `bedrooms`, `bathrooms`, `parking`, `furnished`
- `imageUrls` (array of Appwrite URLs)
- `userRef` (owner id)

## Common Troubleshooting
- **MongoDB Atlas IP error:** whitelist your current IP or temporarily use `0.0.0.0/0`.
- **DNS errors (`EAI_AGAIN`):** switch DNS (8.8.8.8 / 1.1.1.1) or use the non‑SRV MongoDB URI.
- **Image upload fails:** check Appwrite bucket ID and permissions.

## Scripts
Root:
- `npm run dev` — start API with nodemon
- `npm run start` — start API without nodemon

Client (`client/`):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — lint client code

## License
ISC
