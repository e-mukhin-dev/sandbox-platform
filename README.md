# Sandbox Platform

Mini platform for creating isolated development environments using Docker.

---

## Quick Start

```bash
docker compose up -d --build
```

## API

### GET /api/services
Returns available services

### GET /api/sandboxes
Returns created sandboxes

### POST /api/sandboxes
Create a new sandbox