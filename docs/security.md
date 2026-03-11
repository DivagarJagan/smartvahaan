# 🔐 Security Design

## Authentication

- JWT-based authentication
- Token expiration enforced
- Stateless backend security

---

## Authorization (RBAC)

Roles:

- User
- Admin

### Access Rules

| Feature | User | Admin |
| ------ | ------ | ------ |
| Add Vehicle | ✅ | ✅ |
| View AI Suggestions | ✅ | ✅ |
| View All Vehicles | ❌ | ✅ |
| Admin Dashboard | ❌ | ✅ |

---

## Backend Enforcement

- Admin-only routes protected at API level
- Role checks done via JWT payload
- No frontend-only security reliance

---

## Frontend Security

- Protected routes
- Token stored securely
- Unauthorized users redirected

---

## Best Practices

- Secrets stored in `.env`
- No hardcoded credentials
- Strict admin-only constraints
