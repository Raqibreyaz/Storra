# Storra – Cloud Storage with Subscription Plans

Storra is a personal cloud storage app that supports directory-style navigation, Cloudflare R2-backed file storage, and Razorpay-powered subscription plans (free, basic, standard, pro). It focuses on correctness of storage limits, subscription lifecycle handling, and a clean UX for file management and billing.

---

## Features

### File & Directory Management

- **Path-aware directory details**
  - Each directory stores a path composed of `ObjectId`s from the root directory down to that directory.
  - Details popups can show the full path from the root, making it easy to understand where a directory lives in the tree.

- **Recursive children count on demand**
  - When the user opens the details popup for a directory, the app computes the total number of child directories and files.
  - For fast lookup, the stored path field is used: any directory/file whose path contains the current directory is treated as a descendant, so the counts are computed only when needed instead of eagerly.

- **Bulk delete for files and folders**
  - The UI supports selecting multiple files and directories for deletion.
  - The frontend sends selected file IDs and directory IDs separately to the backend, which recursively deletes all nested content for the selected directories.

### Object Storage (Cloudflare R2 Integration)

- **Direct upload to R2 from the frontend**
  - Files are uploaded directly from the browser to Cloudflare R2 using S3-compatible presigned URLs.
  - The presign step encodes constraints such as `Content-Type` and `Content-Length` so users cannot spoof metadata and upload a different file or size than requested.

- **Direct streaming from R2 to the frontend**
  - File streaming is done via short-lived presigned URLs served directly from Cloudflare R2.
  - This avoids the extra hop `frontend → backend → R2`, reducing bandwidth usage and server load.

- **Cost-effective storage & caching**
  - Uses Cloudflare R2 for S3-compatible storage with zero egress fees.
  - Leverages built-in Cloudflare edge caching for optimized file delivery without needing separate CDN services.

### Subscription & Plans

- **Plan catalog**
  - Free plan: 100 MB storage.
  - Paid plans:
    - `basic` – 2 TB
    - `standard` – 5 TB
    - `pro` – 10 TB
  - Each paid plan has two billing intervals: `monthly` and `yearly`.
  - Plan metadata and Razorpay plan IDs are stored in a JavaScript configuration object, with sensitive plan IDs loaded from environment variables rather than the database.

- **Subscription states & storage limits**
  - When a user has no active paid plan, they fall back to the free plan with 100 MB storage quota.
  - `maxStorageBytes` is updated based on the active plan and is used to enforce upload limits across the app.

- **Webhook-driven billing lifecycle**
  - Razorpay webhooks are used as the single source of truth for subscription lifecycle events such as:
    - `subscription.activated` – set `subscriptionId` and update `maxStorageBytes`.
    - `subscription.charged` – update `current_start` and `current_end` for the current billing cycle.
    - `subscription.pending` – payment failed and is retrying; the app sets status to `past_due` and blocks uploads.
    - `subscription.halted` – payment completely failed; the subscription enters a grace period, status `in_grace`, uploads blocked.
    - `subscription.paused` – temporarily pause subscription and block uploads.
    - `subscription.resumed` – resume a paused subscription and re-enable uploads.
    - `subscription.updated` – upgrade or downgrade the plan.
    - `subscription.cancelled` – cancel the subscription either immediately or at period end, with optional demotion to the free plan.
  - Only successful, relevant webhook events are used to update subscription data; failed or irrelevant statuses are ignored.

- **Upgrade/Downgrade rules**
  - Upgrades/downgrades are modeled as:
    - “Which subscription is being updated?”
    - “To which plan should it be updated?”
  - Razorpay only allows upgrades/downgrades for card-based payment methods; UPI-based subscriptions cannot be upgraded/downgraded directly.
  - The dashboard clearly shows the payment method used when subscribing so users understand this limitation before attempting a change.

- **Cancellation UX and behavior**
  - Users see an explicit warning that cancellation may not refund money, making the action clearly at their own responsibility.
  - Cancellation offers:
    - **Schedule cancellation at period end**: everything continues to work until the end of the billing cycle.
    - **Immediate cancellation**: subscription is cancelled right away and user may be demoted to the free plan.
  - The UI checks whether cancellation was immediate or the grace period has expired before allowing users to re-subscribe.

- **Storage-aware downgrade protection**
  - Before downgrading, the app checks that the user’s currently used storage is not greater than the target plan’s storage capacity.
  - If usage exceeds the target plan’s quota, the user is asked to delete enough files to fit within the new plan before the downgrade can proceed.

- **Grace period and demotion**
  - A grace period is the extra time after payment failure during which a user still has their current plan limits before being demoted to the free plan.
  - A cron job periodically:
    - Demotes users whose grace period has expired by updating `maxStorageBytes` to free-plan limits and transitioning `in_grace` to `cancelled`.
    - Sends email notifications via Resend to users whose grace period will expire within the next 24 hours.

### Security & Reliability

- **Webhook event history and idempotency**
  - Every webhook event payload is stored in the database, including metadata like timestamps and payload content.
  - Enables detecting duplicate events, retrying unprocessed events, and inspecting billing history.

- **Webhook as the source of truth**
  - Subscription updates in the app are always driven by webhook events, not optimistic frontend actions, preventing state desynchronization.

- **Accurate billing cycle dates**
  - Uses exact timestamps provided by Razorpay in webhook payloads rather than manually calculating cycle boundaries.

- **CSRF protection & Strict Cookie policy**
  - Session cookies use `SameSite: Strict` scoped to the parent domain for strong cross-site request protection.
  - A custom header requirement middleware forces CORS preflight requests on mutating operations, preventing cross-site form post exploits.

### Authentication, Email & Legal Compliance

- **Resend Integration for Transactional Emails**
  - Uses Resend with a custom domain (`mail.raquibreyaz.in`) for OTP verification and automated notifications.
  - Replaced legacy Gmail OAuth 2.0 flow, eliminating rate limits and manual refresh token maintenance.

- **Login / Signup & Legal Agreement UX**
  - OTP verification flow is state-resilient and handles page refreshes smoothly without losing form inputs.
  - Account creation explicitly incorporates links to the Terms of Service and Privacy Policy.

- **Privacy Policy & Terms of Service**
  - Dedicated `/privacy` and `/terms` pages styled to match the app's design system.
  - Outlines data handling (presigned transfers, S3/R2 storage, Razorpay billing metadata), user rights, acceptable use, and support contacts (`support@mail.raquibreyaz.in`).

---

## Architecture

### Stack Overview

- **Frontend**
  - React SPA for file management, subscription management, legal compliance pages (`/privacy`, `/terms`), and onboarding.
  - Interacts with backend APIs and uses S3-compatible presigned URLs for direct Cloudflare R2 access.

- **Backend**
  - Node.js / Express API.
  - Handles authentication, authorization, subscription logic, and file metadata.
  - Generates presigned URLs for R2 uploads/downloads and validates all business rules (plan limits, subscription status, input sanitization).
  - Exposes webhook endpoints for Razorpay subscription events.

- **Database**
  - MongoDB storing users, directories, files, subscription metadata, and webhook event history.
  - Directories and files reference a path composed of `ObjectId`s from root to leaf node for efficient tree operations.

- **Object Storage**
  - Cloudflare R2 (S3-compatible API) for file content storage.
  - Presigned URLs generated by backend allow direct browser uploads and downloads with zero egress charges.

- **Transactional Email**
  - Resend service integrated with custom domain (`mail.raquibreyaz.in`) for sending OTP authentication codes and grace period expiration warnings.

- **Payments**
  - Razorpay Subscriptions API for recurring billing (Basic, Standard, Pro plans).
  - Webhook-driven entitlements synchronize user limits with billing events.

### High-Level Flow

1. **Authentication**
   - User signs up or logs in through the frontend with email/OTP or OAuth (Google/GitHub).
   - Backend issues session cookies configured with `SameSite: Strict` on parent domain.

2. **File Upload**
   - User selects a file in the frontend.
   - Frontend requests an upload presigned URL from the backend with file metadata (type, size).
   - Backend checks subscription status and storage quota, then generates a constrained presigned URL for Cloudflare R2.
   - Frontend uploads directly to R2.
   - Backend records file metadata in MongoDB upon completion.

3. **File Download / Streaming**
   - User requests to view or download a file.
   - Frontend calls backend for access.
   - Backend validates permissions and returns a short-lived presigned URL for Cloudflare R2.
   - Frontend streams or downloads the file directly from R2.

4. **Directory Operations**
   - Ancestor `ObjectId` path maintains folder hierarchy.
   - Details view calculates location and descendant counts dynamically.
   - Bulk deletion recursively deletes nested child items and corresponding R2 objects.

5. **Subscription Checkout & Webhooks**
   - User selects a plan on `/plans`.
   - Frontend triggers backend to create subscription via Razorpay API and launches Checkout.
   - Razorpay delivers webhooks (`subscription.activated`, `subscription.charged`, etc.) to backend.
   - Backend verifies webhook signatures, records event history, and updates `maxStorageBytes`.

6. **Grace Period & Scheduled Tasks**
   - Cron job checks for expired grace periods, demotes users to Free plan quota, and sends email alerts via Resend 24 hours prior to expiration.

---

## Known Issues & Design Decisions

### File Uploads

- **Multer size check limitation**
  - Problem: Multer checks file size only after receiving the whole file stream.
  - Solution: Custom upload stream pipeline checking chunk sizes in real time and aborting oversized uploads immediately.

### Migration to Cloudflare R2

- **S3 to R2 Migration**
  - Migrated object storage from AWS S3 to Cloudflare R2 using short-scoped provider migration credentials.
  - Leveraged R2's zero egress fee structure and built-in edge caching, avoiding separate CloudFront CDN management.

### Email Delivery Transition

- **Gmail OAuth 2.0 to Resend**
  - Replaced Gmail OAuth 2.0 due to weekly refresh token expirations for unverified test apps and restrictive rate limits.
  - Integrated Resend API with custom domain `mail.raquibreyaz.in` for scalable, maintenance-free email delivery.

### Subscription Rules

- **When to create a new subscription**
  - Created when user has no active plan (Free plan) or when previous subscription is fully cancelled and grace period has ended.

- **Non-updatable payment modes**
  - UPI subscriptions cannot be upgraded/downgraded due to gateway constraints. The UI detects UPI payment methods and advises users accordingly.

- **Upload enforcement while inactive**
  - Uploads are blocked when subscription status is `paused`, `in_grace`, or `past_due`.

---

## Future Improvements

- Add per-folder size summaries and storage breakdown analytics.
- Enhance upgrade/downgrade UI with interactive storage simulation.
- Surface webhook delivery history in user dashboard for self-service billing inspection.