# API Response Contract

## Success Envelope

All API success responses use:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {},
  "timestamp": "2026-04-19T09:00:00.000Z"
}
```

## Error Envelope

All API error responses use:

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2026-04-19T09:00:00.000Z"
}
```

## Backend Helpers

- `ok(res, data, message)` for HTTP 200
- `created(res, data, message)` for HTTP 201
- `fail(res, statusCode, message, code, details)` for errors

Location: `backend/src/utils/response.js`.

## Frontend Compatibility Layer

`frontend/src/services/api/client.js` automatically unwraps the backend envelope so existing page code can keep reading:

- `response.data.<payloadField>` (for example `response.data.tables`)
- `response.data.message`

Error payloads are normalized into `error.response.data.message` and `_meta.error`.
