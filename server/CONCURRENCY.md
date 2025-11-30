## Booking timestamp-based concurrency control

This project uses timestamp-based optimistic concurrency control for critical booking updates. The approach is intentionally lightweight and relies on Mongoose's `updatedAt` timestamp.

Rules
- For any API that updates a booking, include `lastKnownUpdatedAt` in the request body which must be the `updatedAt` value received earlier from the server.
- The server will perform an atomic `findOneAndUpdate` where it matches the booking `_id` and `updatedAt` value. If the booking was modified by another process and `updatedAt` does not match, the server responds with 409 Conflict and returns the latest booking data.
- Background or non-conflicting operations (like cron expiry job) may continue to use unconditional updates.

Endpoints affected (not exhaustive)
- PATCH /api/bookings/:id — requires `lastKnownUpdatedAt`
- POST /api/bookings/cancel/:id — requires `lastKnownUpdatedAt`
- POST /api/bookings/approve/:id — requires `lastKnownUpdatedAt`
- POST /api/bookings/reject/:id — requires `lastKnownUpdatedAt`
- POST /api/bookings/complete/:id — requires `lastKnownUpdatedAt`
- PATCH /api/bookings/:id/suppliers — requires `lastKnownUpdatedAt`
- PayPal flows: POST /api/bookings/:id/paypal/create-order — requires `lastKnownUpdatedAt`
- PayPal flows: POST /api/bookings/:id/paypal/capture — requires `lastKnownUpdatedAt`
- Reviews: POST /api/reviews — requires `lastKnownUpdatedAt` when associating a review to a booking
 - Reviews: POST /api/reviews — does NOT require `lastKnownUpdatedAt`. Reviews are stored and attached to bookings unconditionally.
 - Users: PUT /api/users/me — supports `lastKnownUpdatedAt` for optimistic concurrency when updating own profile
 - Users: PUT /api/users/:id — supports `lastKnownUpdatedAt` for optimistic concurrency when admin updates a user
 - Booking edits: Only allowed when booking.status === 'pending'. These updates require `lastKnownUpdatedAt` and will return 409 when stale.
 - Supplier assignment: Admins can assign suppliers when booking.status === 'pending' or 'accepted' (still requires `lastKnownUpdatedAt`).

Conflict scenario: user and admin update same booking
--------------------------------------------------

Example:

1. Client A fetches booking with `updatedAt = A` and opens edit modal.
2. Admin B fetches the same booking with `updatedAt = A` and assigns supplier X (PATCH /api/bookings/:id/suppliers with lastKnownUpdatedAt = A) — this succeeds and `updatedAt` becomes `B`.
3. Client A tries to save a booking edit with `lastKnownUpdatedAt = A` (PATCH /api/bookings/:id) — the server rejects the update with 409 Conflict and returns the fresh booking (with `updatedAt = B`) in the response `booking` field.
4. Client A should refresh their UI (we recommend prompt to the user) and reapply their changes if needed, using the new `lastKnownUpdatedAt = B`.

Implementation details:
- Both server-side endpoints (`updateBooking` and `assignSuppliersToBooking`) use `updateByUpdatedAt(Model, filter, clientUpdatedAt, updateObj)` which matches the `updatedAt` timestamp atomically when performing updates.
- Client code should always attach `lastKnownUpdatedAt` (the `updatedAt` value) when posting updates.
- On 409 Conflict, the server returns the latest document under `booking` so the client can refresh the UI and let the user reapply changes if needed.

UX/merge options (optional):
- If you want non-overlapping fields to be merged automatically (e.g., admin assigns suppliers while user edits title), you could implement a server-side merge policy or use per-field versioning. The simplest route for safety is to require clients to reapply changes after a conflict.

Example: Update profile (Client)

```http
PUT /api/users/me
Content-Type: multipart/form-data

FormData:
- fullName: "Jane Smith"
- email: "jane@example.com"
- profilePic: (file)
- lastKnownUpdatedAt: "2023-10-11T15:44:00.123Z"
```

If the `updatedAt` timestamp on the server doesn't match the provided `lastKnownUpdatedAt`, the server responds with 409 conflict and returns the fresh user record to help the client resolve the conflict.

Client-side
- It's recommended to store and send the latest `updatedAt` returned from the server in the requests.

This change ensures updates that are sensitive to race conditions only proceed when the client is operating on a fresh copy of the booking, preventing accidental overwrites.
