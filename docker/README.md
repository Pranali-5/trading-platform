Docker Orchestration

Usage
- Build: `docker compose -f docker/docker-compose.yml build`
- Up: `docker compose -f docker/docker-compose.yml up -d`
- Down: `docker compose -f docker/docker-compose.yml down`

Services
- mysql: MySQL 8.0 with default credentials (dev only)
- kafka: Single-node Kafka (KRaft mode)
- backend: Node.js API + WebSocket gateway (to be added)
- frontend: Next.js app (to be added)

Notes
- Ensure `frontend/` and `backend/` contain Dockerfiles and `.env.example` before running.


