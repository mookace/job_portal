

CREATE TABLE users(
id SERIAL PRIMARY KEY NOT NULL,
email TEXT NOT NULL,
google_id TEXT,
password TEXT,
role text default('users') not null,
is_active boolean default('false'),
fullname TEXT ,
cv text,
created_at TIMESTAMPTZ not null,
updated_at TIMESTAMPTZ,
deleted_at TIMESTAMPTZ,
is_deleted boolean default('false')
);
