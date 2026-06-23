# Blaby Westfield POS

A rebranded duplicate of the Nalakath POS system (ordering & billing), restyled
with the **Blaby Westfield Hotel** visual identity. Functionally identical to the
original — only the **logo, colour theme, and app name** changed.

```
blaby-pos/
├── blaby-pos-app/      React Native mobile app (iOS + Android)
└── blaby-pos-server/   NestJS + Sequelize (MySQL) API server
```

> The original projects (`Nalakath/nalakath-pos`, `Nalakath/nalakath-fruits-server`)
> and the **live production database were not modified**. This is a fully separate copy.

---

## ⚠️ Database safety

The original server's `sequelize.sync()` runs on startup and will **alter whatever
database it connects to**. This duplicate is therefore configured to point at a
**brand-new, empty database** — never the production one.

`blaby-pos-server/.env` ships with placeholder DB values you must fill in:

```
DATABASE_NAME=blaby_westfield_pos
DATABASE_HOST=CHANGE_ME_DB_HOST
DATABASE_USER=CHANGE_ME_DB_USER
DATABASE_PASSWORD=CHANGE_ME_DB_PASSWORD
DATABASE_PORT=3306
```

Point these at the fresh database you provide. Do **not** reuse the production
host/db name.

---

## Server setup (`blaby-pos-server`)

1. Create an empty MySQL database (matching `DATABASE_NAME` above), e.g.:
   ```sql
   CREATE DATABASE blaby_westfield_pos CHARACTER SET utf8mb4;
   ```
2. Fill in the `DATABASE_*` values in `blaby-pos-server/.env`.
3. Install & build:
   ```bash
   cd blaby-pos-server
   npm install
   npm run build
   ```
4. Start the server:
   ```bash
   npm run startlocal     # dev (nodemon, ts-node)
   # or
   npm start              # runs the built dist/
   ```
   On first startup, `sequelize.sync()` **creates the full table structure
   automatically** in the empty database — no manual migration needed.

- API base path: `/v1` (e.g. `http://localhost:8101/v1`)
- Swagger docs: `http://localhost:8101/v1/apis`
- Default port: `8101` (set via `PORT` in `.env`)

### Initial data
A freshly synced database has the **structure but no rows** (no users, products,
etc.) — same as the original before it was populated. Create your starting data
through the app's normal onboarding/registration flow, or seed it.
The default admin record in `seeders/user.json` is now `admin@blabywestfield.com`
(password `123` — change it). Note the original `npm run seed` script references a
missing file and the bulk-insert seeders are mostly commented out, exactly as in the
source project; enable them in `seeders/seeder.ts` if you want scripted seeding.

### S3 uploads
Uploads use the existing `bairuha-bucket` but under a **separate** directory
(`S3_DIRECTORY=blaby-westfield`) so they never collide with production assets.
Swap in your own bucket/credentials in `.env` if preferred.

---

## Mobile app setup (`blaby-pos-app`)

1. Point the app at your server — edit `src/config/api.tsx`:
   ```ts
   BASE_URL: 'http://localhost:8101/v1/'   // default; see comments for emulator/device/prod
   ```
   - iOS simulator: `http://localhost:8101/v1/`
   - Android emulator: `http://10.0.2.2:8101/v1/`
   - Physical device: `http://<your-LAN-IP>:8101/v1/`
   - Production: your deployed Blaby server URL
2. Install & run:
   ```bash
   cd blaby-pos-app
   npm install
   cd ios && pod install && cd ..   # iOS only
   npm run android                  # or: npm run ios
   ```

---

## What was rebranded

**Colour theme** — `src/config/color.tsx`
- `primary`: `#18a762` (green) → `#792113` (brand maroon)
- `light`: `#ccffe6` → `#f4e6d8` (sandstone tint)
- added `gold` `#c7a67d` and `darkMaroon` `#4c130d`
- repointed the two stray hardcoded greens (sales report, settings menu)

**Logo & icons** — regenerated from the BWH brand PDF
- `src/assets/images/logo.png` — maroon lockup (square, for the login screen)
- `src/assets/images/splashlogo.png` — maroon lockup (splash)
- Android launcher icons (`mipmap-*/ic_launcher*.png`) — gold porch on maroon
- iOS `AppIcon.appiconset` (all sizes + `Contents.json`)

**App name**
- Android `strings.xml` `app_name` → **Blaby Westfield**
- iOS `CFBundleDisplayName` + `LaunchScreen` → **Blaby Westfield**
- `app.json` `displayName` → **Blaby Westfield**
- `package.json` name → `blaby-westfield-pos`
- local SQLite db name → `blabywestfieldpos`

**Server strings**
- Swagger title → "Blaby Westfield POS Server Apis"
- report caption → "Blaby Westfield Hotel"
- seed admin email → `admin@blabywestfield.com`

> The internal React Native module name stays `"pos"` (wired in `index.js`,
> `MainActivity.kt`, `AppDelegate.swift`) — it's not user-visible and changing it
> risks breaking the native binding.

## Brand palette reference
| Token | Hex |
|-------|-----|
| Brand maroon (primary) | `#792113` |
| Deepest maroon | `#4C130D` |
| Sandstone gold | `#C7A67D` |
| Aged timber | `#8C745A` |
| Pale linen | `#EFD3B4` |

---

## Optional: ship as a separate app
To publish alongside the original (separate store listings / installable together),
change the bundle identifiers — these were **left unchanged** to keep the build
working out of the box:
- Android `applicationId` in `android/app/build.gradle` (currently `com.pos`)
- iOS `PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project
This also requires your own signing config and (if used) Firebase `google-services`
files.
