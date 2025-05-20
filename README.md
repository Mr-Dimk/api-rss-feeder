# RSS Webhook Service API

A lightweight, stateless REST API for managing RSS feed subscriptions and delivering updates via webhooks. Built with Node.js, Express, and lowdb, this service is designed for reliability, simplicity, and easy integration.

## Features

- **Token-based Authentication**: Generate and refresh API tokens for user identification
- **Subscription Management**: Create, list, and delete RSS feed subscriptions
- **Webhook Registration**: Register webhook URLs to receive feed updates
- **Feed Polling**: Background service periodically checks feeds for updates
- **Reliable Webhook Delivery**: Webhook notifications with retry logic
- **Input Validation & Logging**: Robust validation (Joi) and logging (Winston)

## Technology Stack
- Node.js (ESM)
- Express
- lowdb (JSON file database)
- node-fetch, uuid, joi, winston, xml2js

## Getting Started

### Prerequisites
- Node.js v18+ (ESM support required)

### Installation
```sh
git clone https://github.com/Mr-Dimk/api-rss-feeder.git
cd api-rss-feeder
npm install
```

### Running the Server
```sh
npm start
```
The server will start on `http://localhost:3000` by default.

### API Endpoints

#### Authentication
- `POST   /api/auth/token`         – Generate new API token
- `PUT    /api/auth/token`         – Refresh existing API token

#### Subscriptions
- `GET    /api/subscriptions`      – List all subscriptions
- `POST   /api/subscriptions`      – Subscribe to new RSS feed
- `DELETE /api/subscriptions`      – Clear all subscriptions
- `DELETE /api/subscriptions/:id`  – Remove specific subscription

#### Feeds
- `GET    /api/feeds`              – Get feed items (with date filtering)

#### Webhooks
- `POST   /api/webhooks`           – Register webhook URL

#### Health Check
- `GET    /api/ping`               – Service health check

## Usage Example

1. **Generate API Token**
   ```sh
   curl -X POST http://localhost:3000/api/auth/token
   ```
2. **Subscribe to a Feed**
   ```sh
   curl -X POST http://localhost:3000/api/subscriptions \
     -H "Authorization: Bearer <API_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com/rss", "frequency": 15}'
   ```
3. **Register a Webhook**
   ```sh
   curl -X POST http://localhost:3000/api/webhooks \
     -H "Authorization: Bearer <API_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourapp.com/webhook", "subscriptionIds": ["sub-id"]}'
   ```

## Testing

- Integration tests are provided in the `tests/` directory.
- To run all tests:
  ```sh
  npm test
  ```
- Note: In-memory Supertest/Mocha tests are not supported in ESM; use integration tests with a running server.

## Project Structure

- `src/` – Source code (models, routes, services)
- `tests/` – Integration and manual tests
- `db.json` – lowdb database file
- `todo.md` – Implementation plan and progress

## Configuration
- Minimal configuration required. All data is stored in `db.json` in the project root.
- Logging is handled by Winston (console output by default).

## Troubleshooting
- If you encounter issues with tests, ensure the server is running for integration tests.
- For ESM/Supertest issues, see project notes in `todo.md`.

## License
ISC

---
For more details, see `specification.md` and `todo.md`.
