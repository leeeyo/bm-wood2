# Prompt for AI Dev Assistant: Dashboard “Recent activity”

## Context
BM Wood is a Next.js 16 app (React 19, TypeScript, Tailwind) with a CMS under the `(cms)` layout (protected). The **dashboard** at `app/(cms)/dashboard/page.tsx` shows:
- A greeting and stats (products, categories, pending devis, active users).
- A “Quick actions” card with links to products, devis, categories.
- An **“Activité récente”** card that currently shows a **placeholder**: `EmptyState` with “Aucune activité récente” and “Les dernières actions apparaîtront ici”.

All main entities use Mongoose with **timestamps** (`createdAt`, `updatedAt`): **Devis**, **Product**, **Category**, **User**, **Media**. There is no existing “activity” or “audit” collection.

## Goal
Replace the placeholder with a **real recent activity feed** so the team sees what’s happening without opening each section. The feed should show recent changes to devis, products, and categories (and optionally other entities), with a clear label, relative time, and link to the resource.

## Requirements

### 1. Data source (preferred: no new collection)
- **Preferred:** Build the feed by querying **existing collections** (Devis, Product, Category) sorted by `updatedAt` (desc). No new database collection.
  - For each entity type, fetch the last N documents (e.g. 5–10) with `updatedAt`, then **merge** into a single list and **sort by date** (most recent first). Return a limited list (e.g. 15–20 items).
  - Each item should include: **type** (e.g. `"devis"` | `"product"` | `"category"`), **id** (string), **title** (for display: devis reference, product name, category name), **updatedAt** (ISO string or Date). Optionally **createdAt** if you want to show “created” vs “updated” later (e.g. treat `createdAt === updatedAt` as “créé”).
- **Optional alternative:** If you prefer a dedicated audit trail and “created” vs “updated” labels, add a simple **Activity** collection (e.g. `entityType`, `entityId`, `action`: created|updated, `userId?`, `createdAt`) and write to it from create/update routes. Then the dashboard reads only from Activity. This is more work (touch all relevant API routes) but gives clearer semantics. The prompt below assumes the **no-new-collection** approach unless you explicitly implement Activity.

### 2. New API route
- Add a **protected** endpoint for the dashboard, e.g. **GET /api/dashboard/activity** (or **GET /api/activity**).
- **Auth:** Require CMS authentication (same as other CMS APIs: use `authenticateRequest` from `@/lib/auth/middleware`). Return 401 if not authenticated.
- **Logic:**
  - Query Devis, Product, Category (each with `.sort({ updatedAt: -1 }).limit(10)` or similar), selecting only `_id`, `updatedAt`, and the field used as title (`reference` for Devis, `name` for Product and Category). Optionally `createdAt`.
  - Map each doc to a common shape, e.g. `{ type: 'devis' | 'product' | 'category', id: string, title: string, updatedAt: string }`.
  - Merge the three arrays, sort by `updatedAt` descending, take the first 15–20, return as JSON.
- **Response:** e.g. `{ success: true, data: ActivityItem[] }` where `ActivityItem` has `type`, `id`, `title`, `updatedAt` (and optionally `createdAt`). Use the project’s `successResponse` / `errorResponse` helpers if present.

### 3. Dashboard UI
- In **`app/(cms)/dashboard/page.tsx`**, replace the **“Activité récente”** card content:
  - Remove the current `<EmptyState … />` used for the activity card.
  - **Fetch** activity from the new endpoint (e.g. on mount, same pattern as the existing stats `useEffect`). Use the same auth as other CMS requests (cookies/credentials so the request is authenticated).
  - **Loading:** While loading, show a loading state (e.g. skeleton list or “Chargement…”).
  - **List:** Display a list of activity items. Each row (or line):
    - An **icon** by type (e.g. FileText for devis, Package for product, FolderTree for category – reuse icons from the same file or `lucide-react`).
    - A **label** in French, e.g. “Devis DEV-202502-0001”, “Produit Cuisine sur mesure”, “Catégorie Portes”. Use the `title` from the API; for devis use the reference.
    - **Relative time** (e.g. “il y a 2 h”, “hier”) using `date-fns` if already in the project (e.g. `formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: fr })`).
    - A **link** to the corresponding CMS page: devis → `/cms/devis/[id]`, product → `/cms/products/[id]`, category → `/cms/categories/[id]`.
  - **Empty:** If the API returns an empty array (no devis, products, or categories yet), show the existing `EmptyState` (“Aucune activité récente”, “Les dernières actions apparaîtront ici”) so the card is never broken.
  - Keep the card’s **title** and **description** (“Activité récente”, “Les dernières actions sur la plateforme”).

### 4. Optional enhancements (only if time)
- **“Créé” vs “Modifié”:** If you include `createdAt` in the API and treat `createdAt.getTime() === updatedAt.getTime()` as “créé”, show “Nouveau devis …” vs “Devis … modifié”. Otherwise a single “Devis …” with date is enough.
- **Last login:** The User model does not have a `lastLoginAt` field. If you want “last login” in the feed, you would need to add a field (e.g. `lastLoginAt`) and update it on login; then either include it in the activity aggregation or add a separate “Dernière connexion” line. This is **out of scope** unless explicitly requested.

### 5. Consistency
- Use existing UI components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, list styles, `Link`) and the project’s design system.
- Keep all user-facing text in **French**.
- Ensure the activity endpoint is only used by the dashboard (or other CMS views); do not expose it publicly.

## Out of scope
- No change to how devis, products, or categories are created/updated (no new Activity writes unless you choose the Activity-collection approach).
- No “last login” unless you add and maintain `lastLoginAt` (or equivalent) and decide to show it in the feed.

## References in codebase
- **Dashboard:** `app/(cms)/dashboard/page.tsx` – stats fetch pattern, “Activité récente” card and EmptyState to replace.
- **Auth:** `lib/auth/middleware.ts` – `authenticateRequest` for protecting the new route.
- **Models:** `lib/db/models/` – Devis, Product, Category (all have `updatedAt`, `createdAt`); `types/models.types.ts` for types.
- **EmptyState:** `components/cms/empty-state.tsx` – reuse for empty activity list.
- **Icons:** `lucide-react` (e.g. FileText, Package, FolderTree, Clock) – already used on the dashboard.

## Success criteria
- The “Activité récente” card shows a real list of recent devis, products, and categories.
- Each item has icon, title, relative time, and link to the CMS detail page.
- Empty state when there is no data; loading state while fetching.
- New endpoint is protected; dashboard remains behind CMS auth.
