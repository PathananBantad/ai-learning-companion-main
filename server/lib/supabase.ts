import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "MY_SUPABASE_URL" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "MY_SUPABASE_ANON_KEY";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "FOUND" : "MISSING");
console.log(
  "Supabase Service Role Key:",
  supabaseServiceRoleKey ? "FOUND" : "MISSING",
);
console.log("Is Supabase Configured:", isSupabaseConfigured);

// --- IN-MEMORY DATABASE FALLBACK ---
const inMemoryDB: Record<string, any[]> = {
  classes: [],
  student_sessions: [],
  enrollments: [],
  profiles: [],
  quiz_results: [],
  lesson_materials: [],
  lessons: [],
  course_feedback: [],
};

class MockQueryBuilder {
  private tableName: string;
  private data: any[];
  private currentQuery: any[];

  constructor(tableName: string) {
    this.tableName = tableName;
    if (!inMemoryDB[tableName]) {
      inMemoryDB[tableName] = [];
    }
    this.data = inMemoryDB[tableName];
    this.currentQuery = [...this.data];
  }

  select(fields: string = "*") {
    // If we're selecting quiz_results, join profiles in-memory
    if (this.tableName === "quiz_results" && fields.includes("profiles")) {
      this.currentQuery = this.currentQuery.map((item) => {
        const profile = inMemoryDB.profiles.find(
          (p) => p.id === item.student_id,
        );
        return {
          ...item,
          profiles: profile ? { student_code: profile.student_code } : null,
        };
      });
    }
    return this;
  }

  insert(values: any | any[]) {
    const rows = Array.isArray(values) ? values : [values];
    const insertedRows = rows.map((row) => {
      const newRow = {
        id:
          row.id || `mock-id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        ...row,
      };
      this.data.push(newRow);
      return newRow;
    });
    this.currentQuery = insertedRows;
    return this;
  }

  upsert(values: any | any[], options?: { onConflict?: string }) {
    const rows = Array.isArray(values) ? values : [values];
    const onConflictKey = options?.onConflict;

    const upsertedRows = rows.map((row) => {
      let existingIndex = -1;
      if (onConflictKey && row[onConflictKey]) {
        existingIndex = this.data.findIndex(
          (item) => item[onConflictKey] === row[onConflictKey],
        );
      }

      if (existingIndex >= 0) {
        this.data[existingIndex] = {
          ...this.data[existingIndex],
          ...row,
        };
        return this.data[existingIndex];
      } else {
        const newRow = {
          id:
            row.id ||
            `mock-id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          created_at: new Date().toISOString(),
          ...row,
        };
        this.data.push(newRow);
        return newRow;
      }
    });

    this.currentQuery = upsertedRows;
    return this;
  }

  eq(column: string, value: any) {
    this.currentQuery = this.currentQuery.filter(
      (item) => item[column] === value,
    );
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending ?? true;
    this.currentQuery.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      if (typeof valA === "string" && typeof valB === "string") {
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return asc ? (valA < valB ? -1 : 1) : valA < valB ? 1 : -1;
    });
    return this;
  }

  limit(n: number) {
    this.currentQuery = this.currentQuery.slice(0, n);
    return this;
  }

  single() {
    return Promise.resolve({
      data: this.currentQuery[0] || null,
      error: null,
    });
  }

  maybeSingle() {
    return Promise.resolve({
      data: this.currentQuery[0] || null,
      error: null,
    });
  }

  // Allow direct awaiting of the query chain
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve({
      data: this.currentQuery,
      error: null,
    }).then(onfulfilled, onrejected);
  }
}

const mockSupabaseClient = {
  from: (tableName: string) => new MockQueryBuilder(tableName),
};

// Export actual Supabase if configured, otherwise export the mock fallback!
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockSupabaseClient as any);

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : (mockSupabaseClient as any);
