# 🔌 API Specification – FastAPI Backend

Base URL:
<http://localhost:8000>

---

## Authentication

### POST /auth/login

Login user or admin.

#### Request

```json
{
  "email": "user@test.com",
  "role": "user"
}
