# TODO - Candidate API error surfacing (frontend)

- [x] Inspect existing Axios error handling in `frontend/src/config/apiClient.js`.
- [x] Update Axios interceptor to:
  - [x] Only show generic "Unable to reach the server..." when `error.response` is undefined (network/server unreachable).
  - [x] Prefer backend payloads: `response.data.detail` / `response.data.message`.
  - [x] Parse FastAPI/Pydantic validation errors array `{ detail: [{ msg, ...}, ...] }` into readable messages.
- [x] Run frontend lint/build (optional) and manually verify candidate creation shows backend validation/business errors in red alert.



