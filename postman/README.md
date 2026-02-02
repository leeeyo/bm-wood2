# BM Wood API – Postman

## Import

1. Open Postman.
2. **Import** → drag or select:
   - `BM-Wood-API.postman_collection.json`
   - `BM-Wood-Local.postman_environment.json` (optional)
3. Select the **BM Wood - Local** environment if you imported it.

## Usage

1. **Auth**  
   Run **Auth → Login** with valid credentials. The collection script saves `accessToken` into the collection variable. Other requests use `Authorization: Bearer {{accessToken}}`.

2. **IDs**  
   After **Create Category**, **Create Product**, **Create Devis**, **Create User**, or **Upload File**, the response ID is stored in `categoryId`, `productId`, `devisId`, `userId`, or `mediaId` so **Get/Update/Delete by ID** requests work without editing URLs.

3. **Base URL**  
   Default: `http://localhost:3000`. Change the `baseUrl` collection (or environment) variable to point at another host.

## Endpoints

| Folder     | Endpoints |
|-----------|-----------|
| **Auth**  | Login, Register, Me, Refresh Token, Logout |
| **Categories** | List (no auth), Create, Get by ID, Update, Delete |
| **Products** | List (paginated + filters), Create, Get, Update, Delete |
| **Devis** | List (paginated + filters), Create, Get, Update, Update Status, Get PDF, Delete |
| **Users** | List (admin), Create (admin), Get, Update, Delete (admin) |
| **Uploads** | Upload (form-data `file`), List, Get by ID, Delete |

## Notes

- **Login** must be run first (or use a valid token in `accessToken`) for protected routes.
- **Register** does not set `accessToken`; use **Login** after registering.
- **Refresh Token** can send `refreshToken` in the body; the API also accepts it via cookie after Login.
- **Create Product** requires a valid `categoryId` (24-char hex); run **Create Category** first or set `categoryId` manually.
- **Create Devis** items require `description` and `quantity`; `productId`/`categoryId` are optional (24-char hex).
- **Upload File**: in the request body, set the `file` form-data field to your file.
