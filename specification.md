# RSS Webhook Service API - Copilot Instructions

Create a REST API service in Deno that manages RSS feed subscriptions and delivers updates via webhooks. The service should use TypeScript and SQLite for data persistence.

## Core Requirements

Build a stateless API with these endpoints:

- **Authentication**: Generate and refresh API tokens for user identification
- **Subscriptions**: Create, list, delete (individual and batch), and manage RSS feed subscriptions
- **Webhooks**: Register webhook URLs to receive feed updates
- **Feed Data**: Retrieve feed content within specified date ranges

## Technical Specifications

- Use Deno 2.x with vanilla TypeScript (no frameworks)
- Implement a SQLite database for persistent storage
- Design stateless architecture with token-based authentication
- Implement proper error handling and status codes
- Ensure webhook delivery is reliable and implements retry logic

## Data Models

Define these core models:

1. **User**: Identified solely by API token
2. **Subscription**: RSS feed URL, update frequency, creation date, ID
3. **Webhook**: Callback URL, associated subscription IDs
4. **FeedItem**: Content, publication date, subscription reference

## API Endpoints

Implement these REST endpoints:

```
POST /api/auth/token        # Generate new API token
PUT /api/auth/token         # Refresh existing API token

GET /api/subscriptions      # List all active subscriptions
POST /api/subscriptions     # Subscribe to new RSS feed
DELETE /api/subscriptions   # Clear all subscriptions
DELETE /api/subscriptions/:id  # Remove specific subscription

GET /api/feeds              # Get feed items with date filtering
POST /api/webhooks          # Register webhook URL for notifications
```

## Database Schema

Design an SQLite schema optimized for:

- Fast subscription lookups by user
- Efficient feed item retrieval by date range
- Proper relationship between subscriptions and webhooks

## Implementation Notes

- Include a background process to periodically check feeds for updates
- Implement webhook delivery with appropriate timeout and retry logic
- Sanitize and validate all input data
- Use appropriate HTTP status codes for various response scenarios
- Implement proper logging for debugging and monitoring

The service should be lightweight, reliable, and require minimal configuration to run.