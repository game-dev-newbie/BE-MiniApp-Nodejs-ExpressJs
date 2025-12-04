# Project Directory Structure

## Root
- `package.json`, `package-lock.json`: Node.js dependencies and scripts.
- `README.md`: Project overview.
- `schema/`: Database schema SQL.
- `scripts/`: Utility scripts for database management.
- `src/`: Application source code (Express server, configuration, models, routes, etc.).
- `public/`: Static assets and upload placeholders.
- `node_modules/`: Installed dependencies (excluded from repo structure details).

## `scripts/`
- `create-db.js`: Helper to create the database.
- `drop-db.js`: Helper to drop the database.
- `reset-db.js`: Helper to reset the database.

## `schema/`
- `schema.sql`: SQL schema definition.

## `src/`
- `server.js`: Entry point; initializes and starts the server.
- `app.js`: Express app configuration and route mounting.
- `constants/`: Shared constants (`index.js`, `status.js`).
- `config/`: Environment and database configuration plus Sequelize CLI settings.
  - `env.js`
  - `database.js`
  - `model_generate.json`
  - `sequelize-cli.cjs`
- `controllers/`: Route controllers (e.g., `demo.controller.js`).
- `services/`: Business logic services (e.g., `demo.service.js`).
- `middlewares/`: Express middlewares (e.g., `demo.js`).
- `routes/`: Express routing.
  - `appRoutes.js`: Main router mounting API versions and namespaces.
  - `api/v1/`: Placeholder for versioned API routes.
- `models/`: Sequelize models and associations.
  - Core models: `user.js`, `user_auth_provider.js`, `restaurant.js`, `restaurant_account.js`, `restaurant_table.js`, `restaurant_image.js`, `booking.js`, `review.js`, `favorite_restaurant.js`, `payment.js`, `notification.js`.
  - `index.js`: Model initialization and associations.
- `migrations/`: Sequelize migration files for database tables and fields.
- `seeders/`: Seed data scripts (e.g., `demo.js`).
- `dtos/`: Data transfer objects.
  - `requests/` and `responses/` examples (e.g., `demo.js`).
- `utils/`: Utility helpers (e.g., `demo.js`).
- `tests/`: Testing scaffolding.
  - `unit/test.js`
  - `integration/test.js`
  - `e2e/test.js`

## `public/`
- `assets/`: Static assets placeholder (e.g., `demo.js`).
- `uploads/`: Uploads placeholder (e.g., `demo.js`).
