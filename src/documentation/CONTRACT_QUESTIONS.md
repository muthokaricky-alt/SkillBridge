# CONTRACT_QUESTIONS.md

## Upstream Contract Review Questions

### 1. Delivery Tracking Error Response

The `GET /deliveries/{id}` endpoint documents the success case, but what should happen if the delivery ID does not exist? Should it return a structured `404` response with an `error` field?

### 2. Payment Method Status

The `gatewayStatus` field appears in the payment methods response. Is it limited to `Online` and `Offline`, or can other values such as `Maintenance` or `Unavailable` be returned?

### 3. Invalid Estate Filter

For `GET /stations?estate={estate}`, what is the expected behavior if the client supplies an unsupported estate name? Should the API return an empty array, a `400 Bad Request`, or a `404` response?
