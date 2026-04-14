import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getDatabaseUrl } from '../config/database-url';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly enabled: boolean;

  constructor() {
    const url = getDatabaseUrl();

    super(url ? { adapter: new PrismaPg({ connectionString: url }) } : undefined);

    this.enabled = Boolean(url);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async onModuleInit() {
    if (this.enabled) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    if (this.enabled) {
      await this.$disconnect();
    }
  }
}
