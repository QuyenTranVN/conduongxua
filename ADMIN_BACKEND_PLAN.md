# Con Đường Xưa Admin Backend Plan

## Scope and current operating model

There is no admin API or admin UI in V1. Content remains public and read-only
through the Hono API. Authorized maintainers use the Supabase Dashboard as the
manual CMS for:

- teachers;
- content sources, attribution, and permission records;
- meditation method taxonomy;
- playable meditation sessions;
- Dhamma talks;
- YouTube video metadata;
- support practices;
- publishing and unpublishing content.

Dashboard access must be limited to project maintainers, protected with MFA,
and removed promptly when no longer needed. Permission notes and contact details
are internal records and must not be copied into public descriptions or API
responses.

## Manual publishing workflow

1. Create or verify the teacher and content source.
2. Record the source attribution and internal permission status. Store contact
   information only when it is necessary to document permission.
3. Create the content as inactive or unpublished while metadata and media are
   checked.
4. Confirm the source permission permits the intended distribution method.
5. Confirm required media is playable and titles, duration, language, and
   attribution are correct.
6. Set `is_active = true`, then publish the item. When the table has
   `published_at`, set it to the actual publication time.
7. To withdraw content, set `is_published = false` or `is_active = false`.
   Removing public access is preferred over deleting an audit-relevant record.

Meditation methods are taxonomy only. Activating a method does not make it
public unless it has at least one active, published, playable session.

## Planned admin routes

These routes are design targets only. They must not be registered until admin
authentication, authorization, validation, rate limiting, and audit logging are
implemented.

```text
GET    /v1/admin/teachers
POST   /v1/admin/teachers
GET    /v1/admin/teachers/:id
PATCH  /v1/admin/teachers/:id

GET    /v1/admin/sources
POST   /v1/admin/sources
GET    /v1/admin/sources/:id
PATCH  /v1/admin/sources/:id

GET    /v1/admin/meditation/methods
POST   /v1/admin/meditation/methods
PATCH  /v1/admin/meditation/methods/:id

GET    /v1/admin/meditation/sessions
POST   /v1/admin/meditation/sessions
GET    /v1/admin/meditation/sessions/:id
PATCH  /v1/admin/meditation/sessions/:id

GET    /v1/admin/talks
POST   /v1/admin/talks
GET    /v1/admin/talks/:id
PATCH  /v1/admin/talks/:id

GET    /v1/admin/videos
POST   /v1/admin/videos
PATCH  /v1/admin/videos/:id

GET    /v1/admin/support-practices
POST   /v1/admin/support-practices
GET    /v1/admin/support-practices/:id
PATCH  /v1/admin/support-practices/:id

POST   /v1/admin/:contentType/:id/publish
POST   /v1/admin/:contentType/:id/unpublish
```

Publish/unpublish routes should be explicit commands rather than accepting
arbitrary status changes. They should revalidate playability, required metadata,
permission status, and attribution before publishing. Permanent DELETE routes
are not planned initially; archival or deactivation is safer.

Media upload endpoints may be added separately after upload validation is
designed. They must use the `R2_BUCKET` Worker binding and must never send R2
credentials to a browser or mobile client.

## Authorization strategy

Future admin access should use Supabase Auth or an equivalent trusted identity
provider. The Worker must verify the access token, issuer, audience, expiry, and
signature before performing any admin operation.

Authorization must be role-based and deny by default. Suggested roles are:

- `content_editor`: edit drafts and public metadata;
- `publisher`: publish and unpublish validated content;
- `permission_manager`: access internal permission notes and contact details;
- `admin`: manage administrative role assignments and exceptional corrections.

Authentication alone is not enough. Every route must check the specific role
required for the operation. Permission notes and contact fields require the
`permission_manager` role even when other content fields are editable.

Admin roles must come from trusted server-validated claims or a protected
authorization table. They must never be accepted from request bodies, query
parameters, or unsigned client state. Public routes must remain separate from
the `/v1/admin` router.

## Service-role usage rules

The Supabase service-role key may be introduced only when secure admin routes
are implemented. Until then, the API continues using the publishable key and
RLS for public reads.

When service-role access is introduced:

1. Store the key only as a Cloudflare Worker secret.
2. Never place it in web/mobile code, public environment variables, responses,
   source control, fixtures, screenshots, or logs.
3. Verify the administrator identity and authorization before creating a
   service-role client.
4. Use a separate admin-only client factory and data-access module. Public
   handlers must never import it.
5. Restrict each operation to the intended table, columns, and record. Do not
   expose generic SQL, arbitrary table names, or unrestricted update payloads.
6. Validate all input server-side and use allowlists for writable fields.
7. Remember that service-role access bypasses RLS. Application authorization
   and audit logging are mandatory, not optional substitutes.
8. Rotate the key immediately if exposure is suspected.

R2 access should use the Worker binding. Do not create R2 access keys merely to
support normal Worker operations.

## Audit considerations

Before admin write endpoints launch, add an append-only audit mechanism. Each
admin mutation should record:

- a generated audit ID and request/correlation ID;
- verified actor ID and effective role;
- action such as create, update, publish, unpublish, or permission change;
- entity type and entity ID;
- timestamp;
- changed field names;
- safe before/after values where appropriate;
- outcome and a short failure category when unsuccessful.

Do not copy access tokens, service keys, full request headers, raw audio, or
unnecessary contact data into audit logs. Permission-note changes may record
that a field changed without duplicating the sensitive text. Audit records must
not be publicly selectable and should have a defined retention and backup
policy.

Publishing actions deserve explicit audit events. A later publishing service
should also record validation results for media playability, attribution, and
permission status. Corrections should create a new audit event rather than
rewriting history.

## Work required before an admin CMS

- Choose and configure the admin identity provider.
- Define protected role storage and role-assignment procedures.
- Add server-side request schemas and writable-field allowlists.
- Add the admin-only Supabase client factory and Cloudflare secret.
- Add an append-only audit table and write service.
- Implement permission-aware publishing validation.
- Add CSRF protections if cookie-based admin sessions are used.
- Add rate limits, request IDs, security logging, and alerting.
- Add integration tests proving public users cannot reach admin operations.
- Build the admin UI only after the secured backend contract exists.

Until these controls are complete, Supabase Dashboard remains the only manual
administration tool and the public Hono API remains read-only.
