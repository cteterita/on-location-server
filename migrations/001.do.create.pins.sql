DROP TYPE IF EXISTS media;
CREATE TYPE media_types AS ENUM (
    'book',
    'movie',
    'tv_show',
    'tv_episode'
);

CREATE TABLE IF NOT EXISTS pins (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title VARCHAR(512) NOT NULL,
    media media_types NOT NULL,
    link VARCHAR(512) NOT NULL,
    lat DECIMAL(8,5) NOT NULL,
    lon DECIMAL(8,5) NOT NULL
);