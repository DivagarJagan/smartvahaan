# 🗄 Database Design (Current & Future)

## Current State

- Mock in-memory storage
- No persistent DB required for prototype

---

## Entities

### User

- email
- role (user/admin)

### Vehicle

- model
- fuel_type
- city
- distance

### MaintenanceLog

- severity
- message
- timestamp (future)

---

## Relationships

- One user → many vehicles
- One vehicle → many maintenance logs

---

## Future Upgrade

Recommended DB:

- PostgreSQL / MySQL
- SQLAlchemy ORM
- Alembic migrations

---

## Scalability

Design supports:

- Fleet management
- Historical maintenance tracking
- Predictive analytics
