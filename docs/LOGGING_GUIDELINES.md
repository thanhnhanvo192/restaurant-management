# Logging Guidelines

## Principles

- Do not use ad-hoc `console.log`/`console.error` in controllers or page logic.
- Use structured logging in backend through `backend/src/utils/logger.js`.
- Never log secrets (tokens, passwords, connection strings).

## Backend Logger

Available methods:

- `logger.info(message, context)`
- `logger.warn(message, context)`
- `logger.error(message, context)`
- `logger.debug(message, context)`

Behavior:

- `debug` logs are suppressed in production.
- Logs include timestamp, level, message, and serialized context.

## Frontend Error Handling

- Prefer user-facing toasts/messages over console logging in production flows.
- Route API failures through the service layer and surface concise messages.
