 PowerXchange 📚
 
A peer-to-peer book exchange platform for college students to buy, sell, and rent second-hand textbooks - with automatic matching, a full transaction system, ratings, and an admin panel.
 
🌐 **Live Site:** [power-xchange.vercel.app](https://power-xchange.vercel.app)
 
---
 

 
## About the Project
 
PowerXchange solves a real problem - college textbooks are expensive. This platform lets students list books they no longer need and find books they want, at a fraction of the original price. The platform supports buying, selling, renting, and exchanging books, with a trending algorithm, wishlist notifications, a review system, and a full admin panel for moderation.
 
---
 
## Features
 
### For Students
- **Real Authentication** — Sign up with college email, upload profile photo and college ID card. Email confirmation required.
- **Browse Books** — Homepage with trending books, new arrivals, genre categories, author slider, condition filters, and kids section.
- **Search** — Search by book title, author, or genre with real-time filtering.
- **Book Listings** — View full book detail pages with seller info, availability, condition, price, related books, and reviews.
- **Sell a Book** — List a book with title, author, genre, condition, price, description, and cover image upload.
- **Buy / Request / Exchange** — Submit a purchase or exchange request with a message to the seller.
- **Cart & Wishlist** — Add books to cart or wishlist, persisted to the database across sessions. Wishlist users are notified when a book becomes available.
- **Orders** — Track all transactions as buyer or seller with full status history.
- **Notifications** — Real-time badge showing unread alerts for purchase requests, order updates, and wishlist availability.
- **Ratings & Reviews** — Rate and review books after a completed transaction.
- **Dark Mode** — Toggle between light and dark theme, preference saved to localStorage.
- **Profile** — View and edit profile info, listed books, wishlist, and transaction history.
- **Report** — Report a book or seller directly from the book detail page.
### For Admins
- **Dashboard** — Overview stats: total users, books, transactions.
- **User Management** — Verify users, block/unblock accounts.
- **Book Management** — Approve or reject book listings before they go live.
- **Author Management** — Add and manage featured author profiles.
- **Transaction Overview** — Monitor all platform transactions.
- **Reports** — Review and resolve user-submitted reports.
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Backend / Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Hosting | Vercel |
 
---
 
## Database Schema
 
The database runs on PostgreSQL via Supabase. Below are the main tables.
 
### `profiles`
Stores user info. Auto-created on signup via a database trigger.
 
| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Links to auth.users |
| full_name | TEXT | User's name |
| email | TEXT | College email |
| college | TEXT | College/university |
| photo_url | TEXT | Profile photo URL |
| id_card_url | TEXT | College ID card URL |
| role | TEXT | `'user'` or `'admin'` |
| status | TEXT | `'pending'`, `'approved'`, `'rejected'` |
| is_blocked | BOOLEAN | Blocked users are signed out immediately |
 
### `books`
Every book listing posted on the platform.
 
| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated listing ID |
| seller_id | UUID (FK) | References profiles.id |
| title | TEXT | Book title |
| author | TEXT | Author name |
| genre | TEXT | Category |
| condition | TEXT | Brand New / Like New / Good / Old |
| price | NUMERIC | Price in rupees |
| image_url | TEXT | Cover image URL |
| is_approved | BOOLEAN | Must be true for book to appear publicly |
| is_available | BOOLEAN | Auto-set to false when quantity = 0 |
| quantity | INTEGER | Copies available |
 
### `transactions`
Every buy/sell/exchange request.
 
| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Transaction ID |
| book_id | UUID (FK) | References books.id |
| buyer_id | UUID (FK) | References profiles.id |
| seller_id | UUID (FK) | References profiles.id |
| price | NUMERIC | Agreed price |
| status | TEXT | `'pending'`, `'completed'`, `'cancelled'` |
| notes | TEXT | Buyer's message |
 
### `wishlist` and `cart`
Both have the same structure — connect users to books. A `UNIQUE(user_id, book_id)` constraint prevents duplicates.
 
### `notifications`
In-app alerts for users.
 
| Column | Type | Description |
|---|---|---|
| user_id | UUID (FK) | Who receives the notification |
| type | TEXT | Notification category |
| title | TEXT | Short heading |
| message | TEXT | Full notification text |
| is_read | BOOLEAN | Has the user seen it? |
 
### `book_statistics`
Tracks views, sales, ratings, and trending score per book.
 
| Column | Type | Description |
|---|---|---|
| book_id | UUID (FK, UNIQUE) | One row per book |
| views_count | INTEGER | Detail page views |
| sales_count | INTEGER | Completed transactions |
| avg_rating | NUMERIC(3,2) | Average star rating |
| trending_score | NUMERIC | `(sales×10) + (views×0.5) + (rating×sales×2) + (reviews×3)` |
 
### `book_reviews`
Star ratings and written reviews. One review per user per book (UNIQUE constraint).
 
### `reports`
User-submitted reports about books or sellers. Reviewed by admins.
 
### `admin_roles`
Tracks admin users as a fallback to the `role` column in profiles.
 
### Database Triggers
- `handle_new_user()` — auto-creates a profiles row after every signup
- `update_book_availability()` — sets `is_available=false` when quantity reaches 0
- `calculate_trending_score()` — recalculates trending score on every stats update
- `update_updated_at_column()` — auto-updates `updated_at` on every row change
---
 
 
## Getting Started
 
### Prerequisites
- Node.js v18 or higher
- npm
- A Supabase account (free tier works)
- Git
### 1. Clone the repository
 
```bash
git clone https://github.com/aakankshakpoojari/PowerXchange.git
cd PowerXchange
```
 
### 2. Install dependencies
 
```bash
cd client
npm install
```
 
### 3. Set up the database
 
Go to your Supabase project → SQL Editor and run the full contents of `DATABASE_SETUP.sql`. This creates all tables, triggers, indexes, and RLS policies.
 
### 4. Set up Supabase Storage
 
Create two storage buckets in Supabase:
- `book-images` — for book cover photos (public)
- `profile-images` — for profile photos and ID cards (public)
### 5. Configure environment variables
 
Create a `.env` file inside the `client/` folder:
 
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
 
Get these from Supabase → Settings → API Keys.
 
> ⚠️ Never commit the `.env` file to GitHub. It is already in `.gitignore`.
 
---
 
## Running the App
 
```bash
cd client
npm run dev
```
 
Open [http://localhost:5173](http://localhost:5173) in your browser.
 
Other commands:
 
```bash
npm run build    # build for production
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```
 
---
 
## Deployment
 
The app is deployed on **Vercel**.
 
### Steps
1. Push code to the `main` branch on GitHub
2. Connect the GitHub repo to Vercel
3. Set these in Vercel project settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in Vercel → Project Settings → Environment Variables
5. Deploy
The `vercel.json` file handles React Router URL rewrites so page refreshes don't 404:
 
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
 
After deploying, add your Vercel URL to Supabase → Authentication → URL Configuration → Allowed Redirect URLs.
 
---
 
## Pages and Routes
 
| Route | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/signup` | Signup | Public |
| `/login` | Login | Public |
| `/reset-password` | ResetPassword | Public |
| `/home` | HomePage | Logged-in users |
| `/browse` | HomePage (search) | Logged-in users |
| `/books/:id` | BookDetail | Logged-in users |
| `/buybook/:id` | Buybook | Logged-in users |
| `/sellbook` | Sellbook | Logged-in users |
| `/profile` | Profile | Logged-in users |
| `/my-books` | MyBooks | Logged-in users |
| `/cart` | CartPage | Logged-in users |
| `/wishlist` | WishlistPage | Logged-in users |
| `/orders` | OrdersPage | Logged-in users |
| `/notifications` | NotificationsPage | Logged-in users |
| `/transaction/:id` | TransactionDetail | Logged-in users |
| `/author/:id` | AuthorPage | Logged-in users |
| `/genre/:name` | GenrePage | Logged-in users |
| `/admin` | AdminDashboard | Admins only |
| `/admin/users` | AdminUsers | Admins only |
| `/admin/books` | AdminBooks | Admins only |
| `/admin/authors` | AdminAuthors | Admins only |
| `/admin/transactions` | AdminTransactions | Admins only |
| `/admin/reports` | AdminReports | Admins only |
| `/blog` | Blog | Public |
| `/faq` | FAQ | Public |
| `/privacy` | Privacy | Public |
| `/terms` | TermsAndConditions | Public |
 
---
 
## Making Someone an Admin
 
Run this in Supabase SQL Editor:
 
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'youremail@example.com';
```
 
---
 
## Git Workflow
 
- `main` — production branch, Vercel deploys from here
- `dev` — active development, all team members push here
```bash
# Before starting work each day
git pull origin dev
 
# After finishing work
git add .
git commit -m "add: describe what you built"
git push origin dev
```
 
---
 
## Team
 
| Name | Role | Responsibilities |
|---|---|---|
| Aakanksha Poojari | Auth & Profiles | Signup, Login, Profile, Supabase auth setup, SMTP email |
| Atmika Nayak | Books | HomePage, BookDetail, Sellbook, Search, Trending algorithm |
| Atharva | Transactions & Admin | Buybook, Cart, Wishlist, Orders, Notifications, Admin panel |
 
---
 
## License
 
This project was built as a college group project. All rights reserved by the team.
 

