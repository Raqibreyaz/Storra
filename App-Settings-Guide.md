I have conducted a deep, codebase-aware analysis of your **Personal Google Drive (Storra)** application. As a senior staff engineer, I have focused on identifying cost-leakage points, abuse vectors, and missing administrative controls necessary to move from a risky "Test Mode" to a production-grade managed environment.

---

## 1) Executive Summary

The application's current architecture relies heavily on **environment variables** for configuration, meaning the "Owner" has zero runtime control over costs without a code redeploy. While basic rate limiting is in place, the system is highly vulnerable to "slow-burn" costs and "spike" abuse in several areas.

- **Critical Risk: Unmanaged S3/CloudFront Egress.** The `setAllowAnyone` feature combined with CloudFront delivery can lead to thousands of dollars in egress bills if a public file goes viral. There is no global toggle or per-file bandwidth cap.
- **High Risk: Storage Pollution.** Malicious users can initiate thousands of `initiateFileUpload` calls. While the DB entries are tracked, there is no cleanup mechanism for "zombie" S3 objects if the `cancelFileUpload` isn't called by the client.
- **High Risk: Email Provider Bottleneck.** Using Gmail via Nodemailer for critical OTPs and subscription alerts is a significant scaling risk. Gmail limits will be hit quickly during a surge, leading to service disruption.
- **Medium Risk: Subscription Bypass.** The "Test Mode" reliance on Razorpay's test environment allows anyone to upgrade to "PRO" plans with dummy cards, consuming real S3 storage costs.

---

## 2) Cost Surface Map

| Area               | Exact Code Location(s)     | Why it costs money               | Trigger path                         | Current protection                  | Risk if abused                         | Recommended owner setting     |
| :----------------- | :------------------------- | :------------------------------- | :----------------------------------- | :---------------------------------- | :------------------------------------- | :---------------------------- |
| **Storage**        | `aws.service.js:42`        | S3 Storage (GB/mo)               | `initiateFileUpload`                 | Quota check in `file.controller:94` | Storage exhaustion / high AWS bill     | `MAX_TOTAL_STORAGE_GB`        |
| **Bandwidth**      | `file.controller:48`       | CloudFront Data Transfer OUT     | `getFileContents` (preview/download) | Signed URLs (expiry in env)         | Massive egress bill (viral files)      | `GLOBAL_BANDWIDTH_LIMIT_MBPS` |
| **Public Sharing** | `file.controller:255`      | Uncapped egress for public files | `setAllowAnyone`                     | None (Anyone can access)            | Financial ruin from viral public links | `ALLOW_PUBLIC_LINKS_TOGGLE`   |
| **Email**          | `email.service.js:14`      | API/Provider limits (Gmail)      | `sendOtp`, `taskScheduler`           | None                                | Account suspension / blocked OTPs      | `EMAIL_DAILY_QUOTA`           |
| **S3 API Ops**     | `aws.service.js:106`       | CopyObject / PutObject costs     | `renameFile`, `initiateFileUpload`   | None                                | "DDoS by API calls" bill               | `S3_API_RATE_LIMIT`           |
| **Processing**     | `taskScheduler.service:18` | Compute/DB time                  | Daily cron job                       | None (Unbounded loop)               | DB locks / Timeout on large userbase   | `CRON_BATCH_SIZE`             |

---

## 3) Recommended Owner Dashboard Settings

### Global Emergency Controls

| Setting Name              | Purpose                      | Type    | Scope  | Default |
| :------------------------ | :--------------------------- | :------ | :----- | :------ |
| `SYSTEM_MAINTENANCE_MODE` | Kill all traffic immediately | Boolean | Global | `false` |
| `BLOCK_NEW_SIGNUPS`       | Stop new user acquisition    | Boolean | Global | `false` |
| `KILL_SWITCH_S3_UPLOADS`  | Stop all new file writes     | Boolean | Global | `false` |

### Usage & Budget Quotas

| Setting Name               | Purpose                | Type    | Scope  | Default |
| :------------------------- | :--------------------- | :------ | :----- | :------ |
| `MAX_FILE_SIZE_MB`         | Hard limit per file    | Integer | Global | `50`    |
| `FREE_TIER_STORAGE_MB`     | Storage for new users  | Integer | Global | `100`   |
| `DAILY_EGRESS_CAP_GB`      | Global bandwidth limit | Integer | Global | `500`   |
| `MAX_SHARE_LINKS_PER_USER` | Limit public exposure  | Integer | User   | `10`    |

---

## 4) Critical Kill Switches

| Switch Name                     | Code Path Affected                    | Blast Radius                           | Failure Behavior                   |
| :------------------------------ | :------------------------------------ | :------------------------------------- | :--------------------------------- |
| **Public Access Switch**        | `file.controller.js:25` (check logic) | Disables all `allowAnyoneAccess` links | **Fail Closed** (Links return 403) |
| **OTP Generation Switch**       | `auth.controller.js:230`              | Stops all signup/login OTPs            | **Fail Closed** (Auth blocked)     |
| **Subscription Upgrade Switch** | `subscription.controller.js:17`       | Prevents moving from Free to Paid      | **Fail Open** (Stay on Free)       |
| **S3 Invalidation Switch**      | `aws.service.js` (all S3 calls)       | Prevents S3 API calls                  | **Fail Closed** (File ops error)   |

---

## 5) Quotas and Rate Limits (Code-Inferred)

1.  **Requests per Minute (RPM):**
    - `WRITE` operations (Upload/Rename): **10 RPM** per user.
    - `READ` operations (List/Download): **100 RPM** per user.
2.  **Expensive Actions:**
    - `initiateFileUpload`: Max **20 per hour** to prevent "Zombie Upload" spam.
3.  **Storage Enforcement:**
    - Hard stop at `maxStorageInBytes`. Current code at `file.controller.js:99` is good but relies on a non-atomic `rootDir.size` which can be raced.

---

## 6) Budget Controls

We need a `SpendMonitor` service (missing in code) to track:

- **Daily S3 Burn:** Track `PutObject` calls.
- **Daily CF Egress:** Sum of `file.size` on every successful `getFileContents` redirect.
- **Alert Threshold:** Notify owner if daily spend exceeds **80% of budget**.
- **Auto-Disable:** If daily budget is hit, automatically set `KILL_SWITCH_S3_UPLOADS = true`.

---

## 7) Enforcement Architecture

Current code relies too much on **Frontend-only** or **soft** checks.

- **Safety Gap:** `file.controller.js:65` uses `req.body.fileSize` for quota validation. A user can lie about the size to pass the check.
- **Safe Fix:** Always re-validate against S3 `HeadObject` in `completeFileUpload` (already partially done at line 188) but also check `maxStorageInBytes` **inside the transaction**.

---

## 8) Config and Data Model Proposal

**New Model: `OwnerSetting`**

```javascript
{
  key: { type: String, unique: true }, // e.g., "GLOBAL_MAX_FILE_SIZE"
  value: mongoose.Schema.Types.Mixed,
  description: String,
  category: String, // "Storage", "Auth", "Email"
  updatedBy: { type: ObjectId, ref: 'User' }
}
```

**New Model: `AuditLog`**

```javascript
{
  userId: ObjectId,
  action: String, // "FILE_UPLOAD", "LINK_SHARED", "ADMIN_SETTING_CHANGE"
  resourceId: ObjectId,
  metadata: Object, // { size: 1024, ip: "1.1.1.1" }
  timestamp: Date
}
```

---

## 9) Code Smells and Hidden Risks

1.  **Zombie S3 Objects:** `initiateFileUpload` creates a DB record and grants a signed URL. If the user uploads but never calls `completeFileUpload`, the file stays in S3 forever.
    - _Solution:_ Need a daily cron to delete `File` docs where `isUploading: true` and `createdAt < 24h ago`, and call `deleteObject`.
2.  **S3 Renames (`aws.service.js:106`):** Uses `CopyObject` + `DeleteObject`. For a 10GB file, this is an expensive and slow operation. S3 renames are NOT metadata-only.
3.  **Unbounded Cron Loop (`taskScheduler.service.js:18`):** `Subscription.find(...)` fetches ALL expired users. If you have 100k users, this will crash the node process.
    - _Solution:_ Use a cursor or pagination with `limit(100)`.

---

## 10) Prioritized Implementation Plan

### Phase 0: Emergency Protections (This Week)

- Implement `AuditLog` for `setAllowAnyone` and `initiateFileUpload`.
- Hard-code a `GLOBAL_MAX_FILE_SIZE` in the backend (currently env-only).
- Add IP-based rate limiting to `sendOtp` endpoint.

### Phase 1: Managed Settings & Kill Switches

- Create the `OwnerSetting` model and a middleware that caches these in Redis.
- Replace `.env` lookups with the `Setting` service.

### Phase 2: Owner Dashboard UI

- Build a UI for the `Owner` role to toggle signups, uploads, and public links.
- View "Daily Burn Rate" (Egress + Storage).

---

## 11) Final Recommended Settings List

| Setting Key             | Label                | Default | Severity | Description                                      |
| :---------------------- | :------------------- | :------ | :------- | :----------------------------------------------- |
| `auth_disable_signup`   | Disable New Signups  | `false` | Critical | Prevents all new user registrations.             |
| `storage_global_cap_gb` | Total AWS Bucket Cap | `50`    | High     | Hard limit for the entire app storage.           |
| `storage_max_file_mb`   | Max File Upload Size | `50`    | Medium   | Limits individual file sizes.                    |
| `links_allow_public`    | Allow Public Sharing | `true`  | Critical | Toggle to disable all "Anyone with link" access. |
| `email_daily_limit`     | Daily OTP Limit      | `1000`  | High     | Protects the Gmail account from suspension.      |

### Summary for immediate action

1.  **Highest priority:** Implement a cleanup job for orphaned S3 uploads (`isUploading: true` docs).
2.  **Highest priority:** Move `MAX_FILE_SIZE_LIMIT` from `.env` to a dynamic setting to stop abuse instantly.
3.  **Wait for paid launch:** Analytics dashboard, per-workspace custom branding, and SLA monitoring.
4.  **Unknowns:** Need to verify if CloudFront caching is disabled for private files to prevent data leakage between users (inspect CloudFront behaviors).
