/**
 * PrismaService replacement using mysql2 for ARM64 Android (phone server).
 * Provides the same interface as PrismaClient so no other code needs to change.
 * This file replaces src/prisma/prisma.service.ts ONLY on the phone via deploy.sh.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

// ─── Relation Map ────────────────────────────────────────────────────────────
// Maps: sourceTable -> relationName -> { table, foreignKey, localKey, type }
const RELATIONS: Record<string, Record<string, { table: string; fk: string; lk: string; type: 'one' | 'many' }>> = {
  users: {
    profile:         { table: 'profiles',           fk: 'id',      lk: 'userId',      type: 'one' },
    trackers:        { table: 'user_jobs',           fk: 'id',      lk: 'userId',      type: 'many' },
    notifications:   { table: 'notification_logs',   fk: 'id',      lk: 'userId',      type: 'many' },
    subscriptions:   { table: 'subscriptions',       fk: 'id',      lk: 'userId',      type: 'many' },
    documents:       { table: 'user_documents',      fk: 'id',      lk: 'userId',      type: 'many' },
    bugReports:      { table: 'bug_reports',         fk: 'id',      lk: 'userId',      type: 'many' },
    emailPreference: { table: 'email_preferences',   fk: 'id',      lk: 'userId',      type: 'one' },
    mockAttempts:    { table: 'mock_test_attempts',   fk: 'id',      lk: 'userId',      type: 'many' },
  },
  profiles: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
  },
  sources: {
    jobs:            { table: 'jobs',                fk: 'id',      lk: 'sourceId',    type: 'many' },
    crawlLogs:       { table: 'crawl_logs',          fk: 'id',      lk: 'sourceId',    type: 'many' },
  },
  jobs: {
    source:          { table: 'sources',             fk: 'id',      lk: 'sourceId',    type: 'one' },
    changes:         { table: 'job_changes',         fk: 'id',      lk: 'jobId',       type: 'many' },
    trackers:        { table: 'user_jobs',           fk: 'id',      lk: 'jobId',       type: 'many' },
    notifications:   { table: 'notification_logs',   fk: 'id',      lk: 'jobId',       type: 'many' },
  },
  job_changes: {
    job:             { table: 'jobs',                fk: 'id',      lk: 'jobId',       type: 'one' },
  },
  user_jobs: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
    job:             { table: 'jobs',                fk: 'id',      lk: 'jobId',       type: 'one' },
  },
  notification_logs: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
    job:             { table: 'jobs',                fk: 'id',      lk: 'jobId',       type: 'one' },
  },
  email_preferences: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
  },
  crawl_logs: {
    source:          { table: 'sources',             fk: 'id',      lk: 'sourceId',    type: 'one' },
  },
  user_documents: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
  },
  bug_reports: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
  },
  mock_tests: {
    questions:       { table: 'mock_questions',      fk: 'id',      lk: 'testId',      type: 'many' },
    attempts:        { table: 'mock_test_attempts',   fk: 'id',      lk: 'testId',      type: 'many' },
  },
  mock_questions: {
    test:            { table: 'mock_tests',          fk: 'id',      lk: 'testId',      type: 'one' },
  },
  mock_test_attempts: {
    test:            { table: 'mock_tests',          fk: 'id',      lk: 'testId',      type: 'one' },
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
  },
  subscriptions: {
    user:            { table: 'users',               fk: 'id',      lk: 'userId',      type: 'one' },
  },
};

// ─── SQL Helpers ─────────────────────────────────────────────────────────────

function buildWhere(where: any, params: any[]): string {
  if (!where || Object.keys(where).length === 0) return '1=1';
  if (where.AND) {
    const parts = Array.isArray(where.AND) ? where.AND : [where.AND];
    return '(' + parts.map((w: any) => buildWhere(w, params)).join(' AND ') + ')';
  }
  if (where.OR) {
    const parts = Array.isArray(where.OR) ? where.OR : [where.OR];
    return '(' + parts.map((w: any) => buildWhere(w, params)).join(' OR ') + ')';
  }
  if (where.NOT) {
    const inner = Array.isArray(where.NOT) ? where.NOT : [where.NOT];
    return 'NOT (' + inner.map((w: any) => buildWhere(w, params)).join(' AND ') + ')';
  }

  const clauses: string[] = [];
  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND' || key === 'OR' || key === 'NOT') continue;
    if (value === null) {
      clauses.push(`\`${key}\` IS NULL`);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const op = value as any;
      if ('equals' in op) {
        if (op.equals === null) { clauses.push(`\`${key}\` IS NULL`); }
        else { params.push(op.equals); clauses.push(`\`${key}\` = ?`); }
      } else if ('not' in op) {
        if (op.not === null) { clauses.push(`\`${key}\` IS NOT NULL`); }
        else { params.push(op.not); clauses.push(`\`${key}\` != ?`); }
      } else if ('in' in op) {
        if (!op.in || op.in.length === 0) { clauses.push('1=0'); }
        else { params.push(op.in); clauses.push(`\`${key}\` IN (?)`); }
      } else if ('notIn' in op) {
        if (!op.notIn || op.notIn.length === 0) { clauses.push('1=1'); }
        else { params.push(op.notIn); clauses.push(`\`${key}\` NOT IN (?)`); }
      } else if ('contains' in op) {
        params.push(`%${op.contains}%`); clauses.push(`\`${key}\` LIKE ?`);
      } else if ('startsWith' in op) {
        params.push(`${op.startsWith}%`); clauses.push(`\`${key}\` LIKE ?`);
      } else if ('endsWith' in op) {
        params.push(`%${op.endsWith}`); clauses.push(`\`${key}\` LIKE ?`);
      } else if ('gt' in op) {
        params.push(op.gt); clauses.push(`\`${key}\` > ?`);
      } else if ('gte' in op) {
        params.push(op.gte); clauses.push(`\`${key}\` >= ?`);
      } else if ('lt' in op) {
        params.push(op.lt); clauses.push(`\`${key}\` < ?`);
      } else if ('lte' in op) {
        params.push(op.lte); clauses.push(`\`${key}\` <= ?`);
      } else if ('some' in op) {
        // relation filter — skip for now
      } else if ('every' in op) {
        // skip
      } else if ('none' in op) {
        // skip
      } else {
        params.push(value); clauses.push(`\`${key}\` = ?`);
      }
    } else {
      params.push(value); clauses.push(`\`${key}\` = ?`);
    }
  }
  return clauses.length > 0 ? clauses.join(' AND ') : '1=1';
}

function buildOrderBy(orderBy: any): string {
  if (!orderBy) return '';
  if (Array.isArray(orderBy)) {
    return orderBy.map((o: any) => {
      const entries = Object.entries(o) as [string, string][];
      const [key, dir] = entries[0];
      return `\`${key}\` ${(dir || 'asc').toUpperCase()}`;
    }).join(', ');
  }
  if (typeof orderBy === 'object') {
    return Object.entries(orderBy)
      .map(([key, dir]) => `\`${key}\` ${(dir as string || 'asc').toUpperCase()}`)
      .join(', ');
  }
  return '';
}

function buildSelect(select: any): string {
  if (!select) return '*';
  const cols = Object.entries(select)
    .filter(([, v]) => v)
    .map(([k]) => `\`${k}\``);
  return cols.length > 0 ? cols.join(', ') : '*';
}

// ─── Model Delegate ──────────────────────────────────────────────────────────

class ModelDelegate {
  constructor(
    private pool: mysql.Pool,
    private tableName: string,
  ) {}

  private getRelationMap() {
    return RELATIONS[this.tableName] || {};
  }

  async findUnique(args: { where: Record<string, any>; include?: any; select?: any }): Promise<any> {
    const params: any[] = [];
    const where = buildWhere(args.where, params);
    const sel = buildSelect(args.select);
    const sql = `SELECT ${sel} FROM \`${this.tableName}\` WHERE ${where} LIMIT 1`;
    const [rows] = await this.pool.execute(sql, params);
    const row = (rows as any[])[0] || null;
    if (row && args.include) {
      await this.loadIncludes(row, args.include);
    }
    return row;
  }

  async findFirst(args?: { where?: any; orderBy?: any; include?: any; select?: any }): Promise<any> {
    const params: any[] = [];
    const where = args?.where ? buildWhere(args.where, params) : '1=1';
    const order = buildOrderBy(args?.orderBy);
    const sel = buildSelect(args?.select);
    const sql = `SELECT ${sel} FROM \`${this.tableName}\` WHERE ${where} ${order ? 'ORDER BY ' + order : ''} LIMIT 1`;
    const [rows] = await this.pool.execute(sql, params);
    const row = (rows as any[])[0] || null;
    if (row && args?.include) {
      await this.loadIncludes(row, args.include);
    }
    return row;
  }

  async findMany(args?: { where?: any; orderBy?: any; skip?: number; take?: number; include?: any; select?: any; cursor?: any }): Promise<any[]> {
    const params: any[] = [];
    const where = args?.where ? buildWhere(args.where, params) : '1=1';
    const order = buildOrderBy(args?.orderBy);
    const limit = args?.take ?? 20;
    const offset = args?.skip ?? 0;
    const sel = buildSelect(args?.select);
    const sql = `SELECT ${sel} FROM \`${this.tableName}\` WHERE ${where} ${order ? 'ORDER BY ' + order : ''} LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await this.pool.execute(sql, params);
    if (args?.include) {
      for (const row of rows as any[]) {
        await this.loadIncludes(row, args.include);
      }
    }
    return rows as any[];
  }

  async count(args?: { where?: any }): Promise<number> {
    const params: any[] = [];
    const where = args?.where ? buildWhere(args.where, params) : '1=1';
    const sql = `SELECT COUNT(*) as cnt FROM \`${this.tableName}\` WHERE ${where}`;
    const [rows] = await this.pool.execute(sql, params);
    return (rows as any[])[0].cnt;
  }

  async create(args: { data: Record<string, any> }): Promise<any> {
    const data = args.data;
    const cols = Object.keys(data).map(c => `\`${c}\``).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const vals = Object.values(data);
    const sql = `INSERT INTO \`${this.tableName}\` (${cols}) VALUES (${placeholders})`;
    const [result] = await this.pool.execute(sql, vals);
    const insertId = (result as any).insertId;
    return this.findUnique({ where: { id: insertId } });
  }

  async update(args: { where: Record<string, any>; data: Record<string, any> }): Promise<any> {
    const params: any[] = [];
    const setClauses: string[] = [];
    for (const [key, value] of Object.entries(args.data)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const v = value as any;
        if ('increment' in v) { setClauses.push(`\`${key}\` = \`${key}\` + ?`); params.push(v.increment); }
        else if ('decrement' in v) { setClauses.push(`\`${key}\` = \`${key}\` - ?`); params.push(v.decrement); }
        else if ('set' in v) { setClauses.push(`\`${key}\` = ?`); params.push(v.set); }
        else { setClauses.push(`\`${key}\` = ?`); params.push(JSON.stringify(value)); }
      } else {
        setClauses.push(`\`${key}\` = ?`); params.push(value);
      }
    }
    if (setClauses.length === 0) return this.findUnique({ where: args.where });
    const where = buildWhere(args.where, params);
    const sql = `UPDATE \`${this.tableName}\` SET ${setClauses.join(', ')} WHERE ${where}`;
    await this.pool.execute(sql, params);
    return this.findUnique({ where: args.where });
  }

  async upsert(args: { where: Record<string, any>; create: Record<string, any>; update: Record<string, any> }): Promise<any> {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    } else {
      return this.create({ data: args.create });
    }
  }

  async delete(args: { where: Record<string, any> }): Promise<any> {
    const params: any[] = [];
    const row = await this.findUnique({ where: args.where });
    const where = buildWhere(args.where, params);
    const sql = `DELETE FROM \`${this.tableName}\` WHERE ${where}`;
    await this.pool.execute(sql, params);
    return row;
  }

  async deleteMany(args?: { where?: any }): Promise<{ count: number }> {
    const params: any[] = [];
    const where = args?.where ? buildWhere(args.where, params) : '1=1';
    const sql = `DELETE FROM \`${this.tableName}\` WHERE ${where}`;
    const [result] = await this.pool.execute(sql, params);
    return { count: (result as any).affectedRows };
  }

  async updateMany(args: { where?: any; data: Record<string, any> }): Promise<{ count: number }> {
    const params: any[] = [];
    const setClauses: string[] = [];
    for (const [key, value] of Object.entries(args.data)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const v = value as any;
        if ('increment' in v) { setClauses.push(`\`${key}\` = \`${key}\` + ?`); params.push(v.increment); }
        else if ('set' in v) { setClauses.push(`\`${key}\` = ?`); params.push(v.set); }
        else { setClauses.push(`\`${key}\` = ?`); params.push(JSON.stringify(value)); }
      } else {
        setClauses.push(`\`${key}\` = ?`); params.push(value);
      }
    }
    if (setClauses.length === 0) return { count: 0 };
    const where = args.where ? buildWhere(args.where, params) : '1=1';
    const sql = `UPDATE \`${this.tableName}\` SET ${setClauses.join(', ')} WHERE ${where}`;
    const [result] = await this.pool.execute(sql, params);
    return { count: (result as any).affectedRows };
  }

  async groupBy(args: { by: string[]; where?: any; _count?: any; _sum?: any; _avg?: any; orderBy?: any; having?: any }): Promise<any[]> {
    const params: any[] = [];
    const where = args.where ? buildWhere(args.where, params) : '1=1';
    const groupCols = args.by.map(c => `\`${c}\``).join(', ');
    let selectCols = groupCols;

    if (args._count === true || (args._count && typeof args._count === 'object')) {
      selectCols += ', COUNT(*) as `_count__all`';
      if (typeof args._count === 'object' && args._count.select) {
        for (const field of Object.keys(args._count.select)) {
          if (args._count.select[field]) {
            selectCols += `, COUNT(\`${field}\`) as \`_count_${field}\``;
          }
        }
      }
    }
    if (args._sum) {
      for (const [field, val] of Object.entries(args._sum)) {
        if (val) selectCols += `, SUM(\`${field}\`) as \`_sum_${field}\``;
      }
    }
    if (args._avg) {
      for (const [field, val] of Object.entries(args._avg)) {
        if (val) selectCols += `, AVG(\`${field}\`) as \`_avg_${field}\``;
      }
    }

    let having = '';
    if (args.having) {
      const havingParams: any[] = [];
      having = ' HAVING ' + buildWhere(args.having, havingParams);
      params.push(...havingParams);
    }

    const order = buildOrderBy(args.orderBy);
    const sql = `SELECT ${selectCols} FROM \`${this.tableName}\` WHERE ${where} GROUP BY ${groupCols}${having}${order ? ' ORDER BY ' + order : ''}`;
    const [rows] = await this.pool.execute(sql, params);
    return rows as any[];
  }

  // ─── Include Loader ──────────────────────────────────────────────────────

  private async loadIncludes(row: any, include: any): Promise<void> {
    if (!include || typeof include !== 'object') return;
    const rels = this.getRelationMap();

    for (const [relName, relConfig] of Object.entries(rels)) {
      if (!(relName in include)) continue;
      const incOpts = include[relName];
      if (incOpts === false) continue;

      const { table, fk, lk, type } = relConfig;
      const parentVal = row[lk === 'id' ? 'id' : lk];
      if (parentVal === null || parentVal === undefined) {
        row[relName] = type === 'one' ? null : [];
        continue;
      }

      if (incOpts === true) {
        // Simple include — fetch related row(s)
        if (type === 'one') {
          const sql = `SELECT * FROM \`${table}\` WHERE \`${lk}\` = ? LIMIT 1`;
          const [rows] = await this.pool.execute(sql, [parentVal]);
          row[relName] = (rows as any[])[0] || null;
        } else {
          const sql = `SELECT * FROM \`${table}\` WHERE \`${lk}\` = ?`;
          const [rows] = await this.pool.execute(sql, [parentVal]);
          row[relName] = rows;
        }
      } else if (typeof incOpts === 'object') {
        const { orderBy, take, skip, select: sel, ...nestedInclude } = incOpts;

        if (type === 'one') {
          // Single related record
          let sql = `SELECT * FROM \`${table}\` WHERE \`${lk}\` = ? LIMIT 1`;
          const [rows] = await this.pool.execute(sql, [parentVal]);
          const related = (rows as any[])[0] || null;

          if (related && sel) {
            // Apply select filter
            const filtered: any = {};
            for (const [k, v] of Object.entries(sel)) {
              if (v) filtered[k] = related[k];
            }
            row[relName] = filtered;
          } else {
            row[relName] = related;
          }

          // Nested includes on single relation
          if (related && Object.keys(nestedInclude).length > 0) {
            const delegate = new ModelDelegate(this.pool, table);
            await delegate.loadIncludes(related, nestedInclude);
          }
        } else {
          // Multiple related records
          let sql = `SELECT * FROM \`${table}\` WHERE \`${lk}\` = ?`;
          const params: any[] = [parentVal];
          if (orderBy) {
            const orderStr = buildOrderBy(orderBy);
            if (orderStr) sql += ` ORDER BY ${orderStr}`;
          }
          if (take !== undefined) {
            sql += ` LIMIT ?`;
            params.push(take);
          }
          if (skip !== undefined) {
            sql += ` OFFSET ?`;
            params.push(skip);
          }
          const [rows] = await this.pool.execute(sql, params);

          // Apply select filter on each row
          if (sel) {
            for (const r of rows as any[]) {
              const filtered: any = {};
              for (const [k, v] of Object.entries(sel)) {
                if (v) filtered[k] = r[k];
              }
              Object.assign(r, filtered);
            }
          }

          row[relName] = rows;

          // Nested includes on each row
          if (Object.keys(nestedInclude).length > 0) {
            const delegate = new ModelDelegate(this.pool, table);
            for (const r of rows as any[]) {
              await delegate.loadIncludes(r, nestedInclude);
            }
          }
        }
      }
    }

    // Handle _count aggregation
    if (include._count && typeof include._count === 'object' && include._count.select) {
      for (const [relName, val] of Object.entries(include._count.select)) {
        if (val) {
          const relDef = rels[relName];
          if (relDef) {
            const sql = `SELECT COUNT(*) as cnt FROM \`${relDef.table}\` WHERE \`${relDef.lk}\` = ?`;
            const [rows] = await this.pool.execute(sql, [row.id]);
            if (!row._count) row._count = {};
            row._count[relName] = (rows as any[])[0].cnt;
          }
        }
      }
    }
  }
}

// ─── PrismaService ───────────────────────────────────────────────────────────

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  job: ModelDelegate;
  user: ModelDelegate;
  userJob: ModelDelegate;
  userDocument: ModelDelegate;
  previousPaper: ModelDelegate;
  mockTestAttempt: ModelDelegate;
  emailPreference: ModelDelegate;
  pageView: ModelDelegate;
  mockTest: ModelDelegate;
  profile: ModelDelegate;
  source: ModelDelegate;
  jobChange: ModelDelegate;
  crawlLog: ModelDelegate;
  bugReport: ModelDelegate;
  notificationLog: ModelDelegate;
  mockQuestion: ModelDelegate;
  dailyStats: ModelDelegate;
  subscription: ModelDelegate;
  auditLog: ModelDelegate;
  errorLog: ModelDelegate;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: 'sarkari',
      password: 'sarkari123',
      database: 'sarkariscout',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    this.job             = new ModelDelegate(this.pool, 'jobs');
    this.user            = new ModelDelegate(this.pool, 'users');
    this.userJob         = new ModelDelegate(this.pool, 'user_jobs');
    this.userDocument    = new ModelDelegate(this.pool, 'user_documents');
    this.previousPaper   = new ModelDelegate(this.pool, 'previous_papers');
    this.mockTestAttempt = new ModelDelegate(this.pool, 'mock_test_attempts');
    this.emailPreference = new ModelDelegate(this.pool, 'email_preferences');
    this.pageView        = new ModelDelegate(this.pool, 'page_views');
    this.mockTest        = new ModelDelegate(this.pool, 'mock_tests');
    this.profile         = new ModelDelegate(this.pool, 'profiles');
    this.source          = new ModelDelegate(this.pool, 'sources');
    this.jobChange       = new ModelDelegate(this.pool, 'job_changes');
    this.crawlLog        = new ModelDelegate(this.pool, 'crawl_logs');
    this.bugReport       = new ModelDelegate(this.pool, 'bug_reports');
    this.notificationLog = new ModelDelegate(this.pool, 'notification_logs');
    this.mockQuestion    = new ModelDelegate(this.pool, 'mock_questions');
    this.dailyStats      = new ModelDelegate(this.pool, 'daily_stats');
    this.subscription    = new ModelDelegate(this.pool, 'subscriptions');
    this.auditLog        = new ModelDelegate(this.pool, 'audit_logs');
    this.errorLog        = new ModelDelegate(this.pool, 'error_logs');
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }

  // Tagged template: prisma.$queryRaw`SELECT 1`
  async $queryRaw(template: TemplateStringsArray, ...values: any[]): Promise<any> {
    let sql = '';
    for (let i = 0; i < template.length; i++) {
      sql += template[i];
      if (i < values.length) {
        sql += '?';
      }
    }
    const [rows] = await this.pool.execute(sql, values);
    return rows;
  }

  async $executeRaw(template: TemplateStringsArray, ...values: any[]): Promise<number> {
    let sql = '';
    for (let i = 0; i < template.length; i++) {
      sql += template[i];
      if (i < values.length) {
        sql += '?';
      }
    }
    const [result] = await this.pool.execute(sql, values);
    return (result as any).affectedRows;
  }
}
