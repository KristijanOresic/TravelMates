DROP TABLE IF EXISTS attraction_audio CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS attraction_images CASCADE;
DROP TABLE IF EXISTS attractions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DOUBLE PRECISION NOT NULL,
    location_lng DOUBLE PRECISION NOT NULL,
    website VARCHAR(255),
    historical_info TEXT,
    interesting_facts TEXT,
    working_hours VARCHAR(255),
    price_info VARCHAR(255),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE attraction_images (
    id SERIAL PRIMARY KEY,
    attraction_id INT REFERENCES attractions(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    attraction_id INT REFERENCES attractions(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, attraction_id)
);

CREATE TABLE attraction_audio (
    id SERIAL PRIMARY KEY,
    attraction_id INT REFERENCES attractions(id) ON DELETE CASCADE,
    audio_url VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);