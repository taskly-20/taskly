const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const databasePath = process.env.VERCEL
  ? path.join("/tmp", "taskly.sqlite")
  : path.join(__dirname, "taskly.sqlite");
const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    school TEXT NOT NULL DEFAULT '',
    field_of_study TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    typing_speed_wpm INTEGER,
    payout_due_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS task_assignments (
    task_id TEXT PRIMARY KEY,
    requester_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS research_claims (
    task_id TEXT PRIMARY KEY,
    typing_speed_wpm INTEGER NOT NULL CHECK (typing_speed_wpm BETWEEN 1 AND 300),
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS research_submissions (
    task_id TEXT PRIMARY KEY REFERENCES research_claims(task_id),
    original_filename TEXT NOT NULL,
    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_blob BLOB NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    phone_number TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);

  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    school TEXT NOT NULL DEFAULT '',
    field_of_study TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    typing_speed_wpm INTEGER,
    payout_due_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_task_claims (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    typing_speed_wpm INTEGER NOT NULL CHECK (typing_speed_wpm BETWEEN 1 AND 300),
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, task_id)
  );

  CREATE TABLE IF NOT EXISTS user_task_submissions (
    user_id INTEGER NOT NULL,
    task_id TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_blob BLOB NOT NULL,
    PRIMARY KEY (user_id, task_id),
    FOREIGN KEY (user_id, task_id) REFERENCES user_task_claims(user_id, task_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_typing_assessments (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    words_per_minute INTEGER NOT NULL CHECK (words_per_minute BETWEEN 0 AND 300),
    accuracy_percent INTEGER NOT NULL CHECK (accuracy_percent BETWEEN 0 AND 100),
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_typing_attempts (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkout_request_id TEXT UNIQUE,
    merchant_request_id TEXT,
    phone_number TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending',
    result_code TEXT,
    result_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS payment_transactions_user_id_idx ON payment_transactions(user_id);
  CREATE INDEX IF NOT EXISTS user_typing_attempts_user_id_idx ON user_typing_attempts(user_id);

  CREATE TABLE IF NOT EXISTS generated_tasks (
    id TEXT PRIMARY KEY,
    normalized_title TEXT NOT NULL UNIQUE,
    task_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS task_generation_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    next_generation_at INTEGER NOT NULL,
    last_generated_at INTEGER,
    last_error TEXT
  );
`);

const payoutDueAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
database.prepare(`
  INSERT OR IGNORE INTO profiles (id, display_name, payout_due_at)
  VALUES (1, 'Demo Member', ?)
`).run(payoutDueAt);

const createAssignment = database.prepare(`
  INSERT OR IGNORE INTO task_assignments (task_id, requester_name)
  VALUES (?, ?)
`);
const fictionalStudents = [
  "Ava Bennett",
  "Noah Carter",
  "Mia Foster",
  "Ethan Brooks",
  "Zoe Parker",
  "Liam Cooper",
  "Nora Hayes",
  "Leo Morgan",
  "Ivy Reed",
  "Owen Bailey"
];

module.exports = {
  database,
  fictionalStudents,
  ensureTaskAssignments(tasks) {
    for (const task of tasks) {
      const requester = fictionalStudents[Math.floor(Math.random() * fictionalStudents.length)];
      createAssignment.run(task.id, requester);
    }
  }
};
