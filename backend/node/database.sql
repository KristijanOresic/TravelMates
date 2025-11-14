DROP TABLE IF EXISTS attractionAudio CASCADE;
DROP TABLE IF EXISTS userFavorites CASCADE;
DROP TABLE IF EXISTS attractionImages CASCADE;
DROP TABLE IF EXISTS attractions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    idUser SERIAL PRIMARY KEY,
    firstName VARCHAR(20),
    lastName VARCHAR(20),
    email VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'admin'))
);

CREATE TABLE attractions (
    idAttraction SERIAL PRIMARY KEY,
    nameAttraction VARCHAR(50) NOT NULL,
    descriptionAttraction VARCHAR(500),
    locationLat DOUBLE PRECISION NOT NULL,
    locationLng DOUBLE PRECISION NOT NULL,
    website VARCHAR(100),
    historicalInfo VARCHAR(1000),
    interestingFacts VARCHAR(1000),
    workingHours VARCHAR(100),
    priceInfo VARCHAR(50),
    idUser INT REFERENCES users(idUser) ON DELETE SET NULL
);

CREATE TABLE attractionImages (
    idImage SERIAL PRIMARY KEY,
    idAttraction INT REFERENCES attractions(idAttraction) ON DELETE CASCADE,
    imageUrl VARCHAR(200) NOT NULL,
    descriptionImage VARCHAR(500)
);

CREATE TABLE userFavorites (
    idFavorite SERIAL PRIMARY KEY,
    idUser INT REFERENCES users(idUser) ON DELETE CASCADE,
    idAttraction INT REFERENCES attractions(idAttraction) ON DELETE CASCADE,
    UNIQUE(idUser, idAttraction)
);

CREATE TABLE attractionAudio (
    idAudio SERIAL PRIMARY KEY,
    idAttraction INT REFERENCES attractions(idAttraction) ON DELETE CASCADE,
    audioUrl VARCHAR(200) NOT NULL
);
