# SwitchIT - NestJS Template

Template for building monolithic applications with NestJS.

## Technologies

- **Database:** PostgreSQL
- **Language:** Node.js
  - **Framework:** NestJS
  - **ORM:** MikroORM

## Usage

### Building

Make sure you have `pnpm` installed, preferrably via [`corepack enable`](https://github.com/nodejs/corepack?tab=readme-ov-file#how-to-install).

```bash
pnpm install
pnpm build
```

### Configuration

Copy the `.env.example` file to `.env` and update variables as needed. Documentation for each configuration variable is included within the file.

### Database Schema

Run the following command to check if the ORM has a proper connection to the database instance.

```bash
pnpm mikro-orm debug
```

If everything looks good, run the following command to generate the necessary database schema.

```bash
pnpm mikro-orm schema:update --safe --run
```

### Running

Run the following command to start the production server.

```bash
pnpm start:prod
```

Or the following command to run the interactive development server.

```bash
pnpm start:dev
```
