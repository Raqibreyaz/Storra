# Storra – Cloud Storage with Subscription Plans

Storra is a personal cloud storage app that supports directory-style navigation, S3-backed file storage, and Razorpay-powered subscription plans (free, basic, standard, pro). It focuses on correctness of storage limits, subscription lifecycle handling, and a clean UX for file management and billing.

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

### S3 Integration

- **Direct upload to S3 from the frontend**
  - Files are uploaded directly from the browser to S3 using presigned URLs.
  - The presign step encodes constraints such as `Content-Type` and `Content-Length` so users cannot spoof metadata and upload a different file or size than the one requested.

- **Direct streaming from S3 to the frontend**
  - File streaming is done via short-lived presigned URLs served directly from S3.
  - This avoids the extra hop `frontend → backend → S3`, which would increase bandwidth usage and complexity; instead the backend issues a presigned URL and the browser hits S3 directly.

- **Cost‑aware storage tiering**
  - By default, S3 stores objects in the Standard tier, which can be expensive for infrequently accessed data.
  - The app uses Intelligent Tiering so S3 can automatically move objects to the most appropriate tier based on access patterns (read/write frequency).

- **CloudFront cache behavior**
  - When objects are deleted from S3, CloudFront may still serve cached content for some time.
  - Cache invalidation is used to ensure correctness when required, but since invalidations can be expensive, the app generally relies on the UI not requesting deleted files unless explicitly asked.

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
  - Razorpay only allows upgrades/downgrades for certain payment modes:
    - Only card-based subscriptions can be updated; UPI-based subscriptions cannot be upgraded/downgraded.
  - The dashboard clearly shows the payment method used when subscribing so users understand this limitation before attempting a change.

- **Cancellation UX and behavior**
  - Users see an explicit warning that cancellation may not refund money, so the action is clearly at their own responsibility.
  - Cancellation offers:
    - **Schedule cancellation at period end**: everything continues to work until the end of the billing cycle.
    - **Immediate cancellation**: subscription is cancelled right away and user may be demoted to the free plan.
  - The UI checks whether:
    - Cancellation was immediate, or
    - Grace period has expired.
    - If so, the user is allowed to subscribe again to any plan.

- **Storage-aware downgrade protection**
  - Before downgrading, the app checks that the user’s currently used storage is not greater than the target plan’s storage capacity.
  - If usage exceeds the target plan’s quota, the user is asked to delete enough files to fit within the new plan before the downgrade can proceed.

- **Grace period and demotion**
  - A grace period is the extra time after payment failure during which a user still has their current plan limits before being demoted to the free plan.
  - A cron job periodically:
    - Demotes users whose grace period has expired by updating `maxStorageBytes` to free-plan limits and transitioning `in_grace` to `cancelled`.
    - Sends email notifications to users whose grace period will expire within the next 24 hours.

### Security & Reliability

- **Webhook event history and idempotency**
  - Every webhook event payload is stored in the database, including metadata like timestamps and payload content.
  - This makes it possible to:
    - Detect and ignore duplicate events.
    - Retry processing for events that previously failed.
    - Debug subscription issues by inspecting historical events.

- **Webhook as the source of truth**
  - Subscription updates in the app are always driven by webhook events, not by optimistic frontend actions.
  - Even if a request to “update subscription” succeeds on the UI, the app only commits to DB changes when Razorpay sends the corresponding successful webhook event, avoiding inconsistent states when gateway actions fail.

- **Accurate billing cycle dates**
  - Instead of manually computing `current_start` and `current_end`, the app uses the timestamps provided by Razorpay in webhook payloads.
  - This ensures plan billing cycle boundaries match the payment provider exactly.

- **CSRF protection for cross-site setup**
  - Because frontend and backend run on different domains, simple form POSTs can bypass CORS checks.
  - A custom middleware requires a dedicated header on mutating requests; since custom headers trigger CORS preflight, this prevents unwanted cross-site requests from succeeding without the correct header.

### Authentication & Email

- **Secure email sending**
  - App Password-based Gmail sign-in is avoided.
  - Instead, the app uses Gmail via OAuth 2.0:
    - A project is created in Google Cloud Console.
    - Client ID and client secret are configured.
    - A refresh token is generated using a redirect URI like `https://developers.google.com/oauthplayground`.

- **Login/OTP UX**
  - OTP input fields remain visible even after a page refresh on login and signup pages.
  - OTP can be re-entered without having to re-fill all other fields, making the flow more resilient to accidental reloads.

---

## Architecture

### Stack Overview

- **Frontend**
  - React SPA for file management, subscription management, and onboarding.
  - Talks to the backend via HTTP APIs and uses presigned URLs for direct S3 access.

- **Backend**
  - Node.js/Express API.
  - Handles authentication, authorization, subscription logic, and file metadata management.
  - Generates presigned URLs for S3 uploads/downloads and validates all business rules (plan limits, subscription status, etc.).
  - Exposes webhook endpoints for Razorpay to deliver subscription lifecycle events.

- **Database**
  - Stores users, directories, files, subscription metadata, and webhook event history.
  - Directories and files reference a path composed of `ObjectId`s from the root to the current node for efficient tree operations (like recursive counts and bulk deletes).

- **Object Storage**
  - AWS S3 is used for storing file contents.
  - Presigned URLs are generated by the backend so the frontend can upload/download directly without proxying heavy file data through the API server.
  - S3 Intelligent Tiering is used to optimize storage costs based on object access patterns.[web:56][web:62]

- **CDN**
  - CloudFront is used as a CDN in front of S3 for faster file delivery.
  - Cache invalidations are performed selectively when consistency is critical, but the UI is designed to avoid surfacing deleted files by default.

- **Payments**
  - Razorpay Subscriptions API manages recurring billing for Basic, Standard, and Pro plans.
  - The backend creates subscriptions, receives webhooks for events like `subscription.activated`, `subscription.updated`, and `subscription.cancelled`, and updates the database accordingly.[web:52][web:64]

### High-Level Flow

1. **Authentication**
   - User signs up or logs in through the frontend.
   - Backend issues authenticated session (e.g. via cookies or tokens) and exposes current plan, storage usage, and subscription status.

2. **File Upload**
   - User chooses a file in the frontend.
   - Frontend requests an upload presigned URL from the backend, providing file metadata such as content type and size.
   - Backend:
     - Validates subscription status and storage quota.
     - Generates a presigned URL with constraints on `Content-Type`, size, and expiry.
   - Frontend uploads directly to S3 using the presigned URL.
   - Backend records file metadata (including S3 key and directory path) in the database.

3. **File Download/Streaming**
   - User requests to view or download a file.
   - Frontend calls backend for an access URL.
   - Backend checks authorization and subscription status, then returns a short-lived presigned URL.
   - Frontend streams or downloads the file directly from S3 (optionally via CloudFront).

4. **Directory Operations**
   - Directory structure is maintained in the database with a path of ancestor `ObjectId`s from root to leaf.
   - For:
     - **Details view**: Backend uses the path to compute the human-readable location and recursive counts of descendant files and directories.
     - **Bulk delete**: Backend finds all items whose path contains the selected directory and deletes them recursively.

5. **Subscription Creation & Checkout**
   - User selects a paid plan (e.g. `standard_monthly`) in the frontend.
   - Frontend calls backend to create or update a subscription with Razorpay.
   - Backend:
     - Validates whether the user is allowed to create or update a subscription (e.g. payment mode constraints, current state).
     - Uses Razorpay APIs to create the subscription and returns the `subscription_id` and plan details.
   - Frontend opens Razorpay Checkout using the `subscription_id` so the user can authorize payments.[web:54][web:57]

6. **Webhook-Driven Entitlements**
   - Razorpay sends subscription webhooks (activated, charged, pending, halted, paused, resumed, updated, cancelled) to a secure backend endpoint.[web:48][web:52]
   - Backend:
     - Verifies webhook signatures.
     - Stores the full event payload in the database for history and idempotency.
     - Updates user subscription status, plan, `maxStorageBytes`, billing cycle dates, and grace period information.
   - All entitlement decisions (e.g. “can upload?”, “what is the storage limit?”, “is downgrade allowed?”) read from this subscription state.

7. **Grace Period & Cron Jobs**
   - A scheduled job periodically:
     - Transitions users out of grace period to the free plan when needed.
     - Sends reminder emails to users whose grace is about to expire in the next 24 hours.
   - This ensures that the subscription state converges correctly over time even if some webhook deliveries are delayed.

8. **Security & CSRF**
   - Because frontend and backend can live on different origins, a custom header is required on mutating requests.
   - This forces browsers to send CORS preflight requests and prevents simple cross-site form posts from succeeding without the correct header.
   - Payment and webhook endpoints additionally validate signatures and operate with least-privilege credentials (e.g. to generate presigned URLs for S3).[web:65][web:68]

## Known Issues & Design Decisions

This section captures important issues encountered and the final design decisions.

### File Uploads

- **Multer size check limitation**
  - Problem: Multer checks file size only after the entire file is uploaded, which is wasteful for oversized uploads.
  - Solution: Implemented a custom upload pipeline using streams that checks size at the chunk level and aborts if the limit is exceeded.

### CloudFront Caching

- **Deleted files still being served**
  - Problem: CloudFront can continue to serve a cached version of an object even after it has been deleted from S3.
  - Solution:
    - Invalidate CloudFront cache selectively for critical cases.
    - Accept that frequent invalidations are expensive and rely on the UI not surfacing deleted files unless specifically requested.

### Subscription Creation Rules

- **When to create a new subscription**
  - A new subscription is created when:
    - The user has no active plan (on free), or
    - The previous subscription is fully cancelled and the grace period has ended (for immediate cancellations where `cancelAtPeriodEnd = false`).

- **Non-updatable payment modes**
  - For subscriptions where `payment_mode` is UPI, Razorpay does not allow upgrades/downgrades.
  - In this case, the UI disables subscription update actions and displays a tip recommending card payments if the user wants upgrade/downgrade flexibility.

### Enforcing Subscription State on Upload

- **Uploads while inactive subscription**
  - Problem: Users should not be able to upload files when their subscription is in states like `paused`, `in_grace`, or `past_due`.
  - Solution: All uploads are guarded by server-side checks on subscription state. Only valid, active states are allowed to create new files.

---

## Future Improvements

- Add more granular analytics for storage usage, e.g. per-folder size summaries.
- Improve the upgrade/downgrade UX with clearer simulation of “before vs after” storage limits.
- Surface more webhook history in the dashboard so users can self-debug billing issues.