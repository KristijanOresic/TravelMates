DROP TABLE IF EXISTS "attractionAudio" CASCADE;
DROP TABLE IF EXISTS "userFavorites" CASCADE;
DROP TABLE IF EXISTS "attractionImages" CASCADE;
DROP TABLE IF EXISTS attractions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    "idUser" SERIAL PRIMARY KEY,
    "firstName" VARCHAR(20),
    "lastName" VARCHAR(20),
    email VARCHAR(30) UNIQUE NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'admin', 'editor'))
);

CREATE TABLE attractions (
    "idAttraction" SERIAL PRIMARY KEY,
    "nameAttraction" VARCHAR(50) NOT NULL,
    "descriptionAttraction" VARCHAR(500),
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLng" DOUBLE PRECISION NOT NULL,
    website VARCHAR(100),
    "historicalInfo" VARCHAR(1000),
    "interestingFacts" VARCHAR(1000),
    "workingHours" VARCHAR(100),
    "priceInfo" VARCHAR(50),
    "imageUrl" VARCHAR(200),
    "idUser" INT REFERENCES users("idUser") ON DELETE SET NULL
);

CREATE TABLE "userFavorites" (
    "idFavorite" SERIAL PRIMARY KEY,
    "idUser" INT REFERENCES users("idUser") ON DELETE CASCADE,
    "idAttraction" INT REFERENCES attractions("idAttraction") ON DELETE CASCADE,
    UNIQUE("idUser", "idAttraction")
);

INSERT INTO attractions ("nameAttraction", "descriptionAttraction", "locationLat", "locationLng", "workingHours", "imageUrl") VALUES 
('Zagrebačka katedrala', 'Gotička katedrala posvećena Uznesenju Marije, simbol Zagreba i najznačajnije vjersko zdanje u gradu.', 45.81449, 15.9772731, 'Privremeno zatvoreno', 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Zagreb_Cathedral_01.jpg'),
('Tkalčićeva ulica', 'Čarobna starogradska ulica sa starim kućicama, kavanama, restoranima i antikvarijatima.', 45.8174906, 15.9736894, 'Cijeli dan', 'https://www.visitzagreb.hr/wp-content/uploads/2016/06/Tkalciceva-Street-800x500-morning.jpg'),
('Muzej Mimara', 'Jedan od najvećih muzeja u Zagrebu sa bogatom kolekcijom od egipatskih predmeta do djela europskih master-a.', 45.8082241, 15.9646662, 'Privremeno zatvoreno', 'https://www.visitzagreb.hr/wp-content/uploads/2018/01/Zagrab-Museum-Mimara.jpg'),
('Nacionalni park Plitvička jezera', 'UNESCO svjetska baština - spektakularan nacionalni park sa 16 jezera povezanih vodopada. Udaljenost od Zagreba: ~130 km.', 44.8802209, 15.6034148, '07:00 - 14:00', 'https://maslenica.hr/wp-content/uploads/2025/08/C_Bzed9mzuSZ5K2jmsj08_29dedc38f9904305bfdd8be493cd29cb.jpg'),
('Gradski park Maksimir', 'Park namijenjen obiteljima koji nudi sjenovite staze, jezera, bogatu floru i faunu, igrališta i zoološki vrt.', 45.8243596, 16.015051, 'Cijeli dan', 'https://image.dnevnik.hr/media/images/920x695/Mar2025/63043761-maksimir.jpg'),
('Planina Medvednica', 'Prirodni park sa planinskim stazama, Tuškanac toboganom i vrhom Sljeme na 1035 m. Odličan za planinarenje i izlete.', 45.9166657, 15.956367, 'Cijeli dan', 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Jarun_Lake_-_view_of_Medvednica.jpg'),
('Mirogoj groblje', 'Jedno od najljepših groblja u Europi sa arhitektonskim remek-djelima i zelenim površinama.', 45.8358759, 15.9843298, '06:00 - 20:00', 'https://www.visitzagreb.hr/wp-content/uploads/2017/12/Mirogoj-cemetery-Main-Entrance-800x500.jpg'),
('Muzej grada Zagreba', 'Muzej koji predstavlja povijest i razvoj Zagreba od prošlosti do modernog vremena.', 45.8184122, 15.9725093, '10:00 - 18:00', 'https://www.visitzagreb.hr/wp-content/uploads/2018/02/Zagreb-City-Museum-Archeology.jpg'),
('Zrinjevac park', 'Javni park u centru Zagreba sa spomenicima, vezenim puteljcima i ugođajnom atmosferom.', 45.8102943, 15.9757356, 'Cijeli dan', 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zrinjevac_Park%2C_Zagreb%2C_Croatia_-_July_2022.jpg');