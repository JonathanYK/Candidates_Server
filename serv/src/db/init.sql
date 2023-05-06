CREATE USER compose;
CREATE DATABASE apitests;
GRANT ALL PRIVILEGES ON DATABASE apitests TO compose;

\c apitests compose;

CREATE TABLE users (
    candId INTEGER,
    candName character varying(255) NOT NULL,
    candEmail character varying(255) NOT NULL UNIQUE
);