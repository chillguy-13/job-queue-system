# Distributed Job Queue System

A containerized background job processing system built with Node.js, Express, Bull, Redis, and MongoDB. It demonstrates asynchronous job processing, priority-based queues, retry handling with exponential backoff, worker concurrency, and job monitoring.

## Features

- **Priority-based queues:** Separate high-, medium-, and low-priority queues.
- **Background workers:** Independent worker processes handle email, image-processing, and notification job types.
- **Retry handling:** Configurable retry attempts and exponential backoff.
- **Job monitoring:** Bull Board dashboard and REST endpoints for queue statistics and job status.
- **Job logs:** MongoDB stores job status, attempts, results, and errors.
- **Docker Compose:** Run the API, Redis, MongoDB, and multiple workers together.
- **Health endpoint:** Check API, Redis, and MongoDB connectivity.

## Tech Stack

- Node.js 20
- Express.js
- Bull 4
- Redis 7
- MongoDB and Mongoose
- Bull Board
- Docker and Docker Compose

## Architecture

```text
Client
  |
  v
Express API -----> Redis / Bull Queues
                         |
                 +-------+-------+
                 |       |       |
              Worker 1 Worker 2 ...
                 |
                 v
              MongoDB
              Job Logs
```

## Prerequisites

- Docker Desktop
- Git

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/chillguy-13/job-queue-system.git
   cd job-queue-system
   ```

2. Create a `.env` file using the environment-variable names and connection settings expected by the application. Do not commit secrets.

3. Start the services:

   ```bash
   docker compose up -d --build
   ```

4. Check the containers:

   ```bash
   docker compose ps
   ```

5. Check API health:

   Open `http://localhost:3000/health`

6. Open the queue dashboard:

   `http://localhost:3000/admin/queues`

   The dashboard and monitoring endpoints are intended for local development; secure them before exposing the application publicly.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/jobs/email` | Enqueue an email job |
| POST | `/api/jobs/image` | Enqueue an image-processing job |
| POST | `/api/jobs/notification` | Enqueue a notification job |
| GET | `/api/monitor/stats` | View queue statistics |
| GET | `/api/monitor/jobs` | List recorded jobs |
| GET | `/api/monitor/jobs/:jobId` | Inspect a job log |
| GET | `/api/monitor/dead` | List jobs recorded as dead |
| GET | `/health` | Check service connectivity |

## Current Limitations

- Email sending, image processing, and notification delivery use simulated implementations; external services are not integrated.
- Permanently failed jobs are recorded as dead in MongoDB. A separate Bull dead-letter queue has not yet been verified as implemented.
- Automated test coverage and production security hardening remain future improvements.

## Development Notes

- Docker Compose maps Redis to host port `6380` to avoid conflicts with other local projects.
- MongoDB is mapped to host port `27017`.
- The API is mapped to host port `3000`.

## Future Improvements

- Add automated tests for job processing and retries.
- Implement a dedicated dead-letter queue.
- Add request validation and authentication for monitoring endpoints.
- Improve graceful worker shutdown and error recovery.
- Integrate real email, image-processing, and notification providers.

## License

No license has been specified yet. Add a license before explicitly permitting reuse or redistribution.
