DROP TABLE IF EXISTS ip_addresses;

CREATE TABLE ip_addresses (
    id TEXT DEFAULT (lower(hex(randomblob(16)))),
    ip_address TEXT,
    country TEXT,
    created_at DEFAULT CURRENT_TIMESTAMP
);