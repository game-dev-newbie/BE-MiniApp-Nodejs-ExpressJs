# Pagination refactor (services return raw, controllers build pagination)

## What changed
- Services that list/search now return `{ items, total }` only (no `limit/offset` in return payload).
- Controllers call `parsePagination(req.query)` and build pagination using `buildPaginationMeta({ total, limit, offset, page })`.

## Also fixed while touching code
- notification.service: time-range filter for user notifications used undefined variables (`fromTime/toTime`). Now uses `start/end` from `time.buildDayRange()`.
- favoriteRestaurant.controller: fixed `req.params` usage (`restaurantId`) + cast to `Number` when calling service.
- restaurant.controller: fixed `restaurantId` param destructure for miniapp reviews, and now uses pagination util there too.
