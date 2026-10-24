# 🏭 Job Queue System

A production-grade distributed job processing platform built with Node.js, Bull, Redis, and MongoDB. Features priority queues, automatic retries with exponential backoff, dead-letter queues, real-time monitoring, and horizontally scalable workers — fully containerized with Docker.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Express API                          │
│              POST /api/jobs/:type                           │
└────────────────────────┬────────────────────────────────────┘
                         │ enqueue
          ┌──────────────▼──────────────┐
          │        Redis (Bull)          │
          │  ┌─────────────────────┐    │
          │  │  high-priority Q    │    │
          │  │  medium-priority Q  │    │
          │  │  low-priority Q     │    │
          │  └─────────────────────┘    │
          └──────────┬──────────────────┘
                     │ consume
        ┌────────────▼────────────┐
        │      Worker Pool        │
        │  ┌──────────────────┐   │
        │  │   worker-1       │   │
        │  │   worker-2       │   │  ← horizontally scalable
        │  │   worker-N       │   │
        │  └──────────────────┘   │
        └────────────┬────────────┘
                     │ log
          ┌──────────▼──────────┐
          │      MongoDB        │
          │   JobLog collection │
          └─────────────────────┘
```

---

## ✨ Features

- **Priority Queues** — High, medium, and low priority tiers with configurable per-queue concurrency
- **3 Job Types** — Email sending, image processing (with progress tracking), and push notifications
- **Exponential Backoff** — Automatic retries with delays of 2s → 4s → 8s → 16s... per job type
- **Dead-Letter Queue** — Permanently failed jobs captured and logged in MongoDB after all retries exhausted
- **Job Monitoring API** — 7 REST endpoints for queue stats, job status, retry, and cancel controls
- **Bull Board Dashboard** — Real-time visual UI for all queues at `/admin/queues`
- **Horizontal Worker Scaling** — Docker Compose replicas; scale workers independently of the API server
- **Graceful Shutdown** — Workers drain active jobs before exiting on SIGTERM/SIGINT
- **Health Checks** — Deep health endpoint reporting Redis, MongoDB, and per-queue stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js 5 |
| Queue Engine | Bull 4 |
| Cache / Queue Store | Redis 7 |
| Database | MongoDB 6 + Mongoose 9 |
| Dashboard | Bull Board 6 |
| Containerization | Docker + Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/job-queue-system.git
cd job-queue-system
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Default `.env` values work out of the box for local development.

### 3. Start all services

```bash
docker compose up --build
```

This starts Redis, MongoDB, the Express API, and 2 worker replicas.

### 4. Verify everything is running

```bash
curl http://localhost:3000/health | jq
```

Expected:
```json
{
  "status": "ok",
  "redis": "connected",
  "mongo": "connected",
  "queues": [...]
}
```

### 5. Open the dashboard

```
http://localhost:3000/admin/queues
```

---

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Express server port |
| `REDIS_HOST` | `redis` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `MONGO_URI` | `mongodb://mongo:27017/jobqueue` | MongoDB connection string |
| `HIGH_CONCURRENCY` | `5` | Max concurrent high-priority jobs per worker |
| `MEDIUM_CONCURRENCY` | `3` | Max concurrent medium-priority jobs per worker |
| `LOW_CONCURRENCY` | `1` | Max concurrent low-priority jobs per worker |

---

## 📡 API Reference

### Submit Jobs

#### `POST /api/jobs/email`
```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "body": "Hello there"
}
```

#### `POST /api/jobs/image`
```json
{
  "imageUrl": "https://example.com/photo.jpg",
  "operations": ["resize", "compress"]
}
```

#### `POST /api/jobs/notification`
```json
{
  "userId": "123",
  "message": "Your order shipped!",
  "channel": "push"
}
```

**Response:**
```json
{
  "jobId": "42",
  "type": "email",
  "status": "queued"
}
```

---

### Monitoring Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health + queue summary |
| `GET` | `/api/monitor/stats` | Per-queue waiting/active/completed/failed counts |
| `GET` | `/api/monitor/jobs` | All jobs from MongoDB (supports `?status=` and `?type=` filters) |
| `GET` | `/api/monitor/jobs/:jobId` | Single job details and status |
| `POST` | `/api/monitor/jobs/:jobId/retry` | Retry a failed job |
| `DELETE` | `/api/monitor/jobs/:jobId` | Cancel and remove a job |
| `GET` | `/api/monitor/dead` | All dead-letter (permanently failed) jobs |
| `GET` | `/api/monitor/queues/:name/failed` | Failed jobs in a specific queue (`high`/`medium`/`low`) |

---

## 🔁 Retry Logic

Each job type has its own retry policy using exponential backoff:

| Job Type | Max Attempts | Initial Delay | Backoff |
|----------|-------------|---------------|---------|
| Email | 5 | 2s | Exponential |
| Notification | 4 | 3s | Exponential |
| Image | 3 | 5s | Exponential |

After all attempts are exhausted, the job is marked `dead` in MongoDB and captured by the dead-letter queue monitor.

---

## 📦 Project Structure

```
job-queue-system/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── redis.js         # Redis/ioredis config
│   ├── queues/
│   │   └── index.js         # Bull queue definitions (high/medium/low)
│   ├── jobs/
│   │   ├── jobTypes.js      # Job type constants + default options
│   │   └── producer.js      # Job producer functions
│   ├── workers/
│   │   ├── emailWorker.js        # Email job processor
│   │   ├── imageWorker.js        # Image processing job processor
│   │   ├── notificationWorker.js # Notification job processor
│   │   └── deadLetterWorker.js   # Dead-letter queue monitor
│   ├── models/
│   │   └── JobLog.js        # MongoDB job lifecycle schema
│   ├── routes/
│   │   ├── jobs.js          # Job submission endpoints
│   │   ├── monitor.js       # Monitoring + control endpoints
│   │   └── health.js        # Deep health check
│   └── utils/
│       └── queueStats.js    # Queue stats aggregation utility
├── workers/
│   └── worker.js            # Worker entry point (runs all processors)
├── docker/
│   ├── Dockerfile.app       # App server image
│   └── Dockerfile.worker    # Worker image
├── docker-compose.yml       # Full stack + 2 worker replicas
├── server.js                # Express app entry point
└── .env                     # Environment config
```

---

## 🔧 Worker Scaling

Scale workers up or down without touching the API server:

```bash
# Scale to 4 worker replicas
docker compose up --scale worker=4

# Scale back down
docker compose up --scale worker=1
```

Workers compete for jobs via Redis — Bull handles distributed locking automatically so no job is processed twice.

---

## 🧪 Testing the Full Flow

```bash
# Submit 10 email jobs in a batch
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/jobs/email \
    -H "Content-Type: application/json" \
    -d "{\"to\":\"user$i@example.com\",\"subject\":\"Batch $i\"}" | jq .jobId
done

# Check queue stats
curl -s http://localhost:3000/api/monitor/stats | jq

# Check all completed jobs
curl -s "http://localhost:3000/api/monitor/jobs?status=completed" | jq '.total'

# Test retry logic (simulateFail forces a failure on attempt 1)
curl -s -X POST http://localhost:3000/api/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Retry Test","simulateFail":true}' | jq
```

---

## 📊 Bull Board Dashboard

Live visual monitoring at `http://localhost:3000/admin/queues`

- View all 3 queues with job counts by status
- Inspect individual job data and results
- Manually retry or remove failed jobs
- Monitor active, waiting, delayed, and completed jobs in real time

---

## 🗂️ Related Projects

- [Advanced URL Shortener](https://github.com/YOUR_USERNAME/url-shortener) — Redis caching, analytics, QR codes, Docker

---

## 📄 License

MIT
