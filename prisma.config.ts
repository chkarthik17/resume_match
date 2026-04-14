import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { getDatabaseUrl } from './backend/config/database-url';

const url = getDatabaseUrl();

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  datasource: {
    url: url || 'postgresql://user:password@localhost:5432/database',
  },
});
