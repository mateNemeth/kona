CREATE TABLE carlist (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    platform_id TEXT NOT NULL,
    link TEXT NOT NULL,
    date_of_scan DATE DEFAULT NOW(),
    crawled BOOLEAN
);

CREATE TABLE carspec (
    id BIGINT NOT NULL PRIMARY KEY, 
    ccm INT NOT NULL,  
    cartype BIGINT NOT NULL,
    fuel VARCHAR(20),    
    transmission VARCHAR(20),
    price INT NOT NULL,
    kw INT,
    km INT,
    city VARCHAR(20),
    zipcode INT
);

CREATE TABLE cartype (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    age INT NOT NULL
);

CREATE TABLE average_prices (
    id BIGINT NOT NULL PRIMARY KEY,
    avg BIGINT NOT NULL,
    median BIGINT NOT NULL
);

CREATE TABLE working_queue (
    id BIGINT NOT NULL PRIMARY KEY,
    working BOOLEAN DEFAULT FALSE
);

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password CHAR(60) NOT NULL,
    cheap_alert INT,
    specific_alert INT []
);

CREATE TABLE cheap_alerts (
    id INT NOT NULL PRIMARY KEY,
    zipcodes INT [],
    treshold INT
);

CREATE TABLE specific_alerts (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    zipcodes INT [],
    make VARCHAR(50),
    model VARCHAR(50),
    ageMax INT,
    ageMin INT,
    ccm INT,
    km INT,
    kw INT,
    fuel VARCHAR(20),
    transmission VARCHAR(20),
    priceMax INT,
    priceMin INT,
    treshold INT
);

INSERT INTO users (first_name, last_name, email, password, cheap_alert, specific_alert)
VALUES ('Vajk', 'Kiskos', 'kiskosvajk@gmail.com', 'asdasdasdasdasdsadsaasdasdasdasdasdsadsaasdasdasdasdasdsadsa', 1, '{1}');

INSERT INTO users (first_name, last_name, email, password, cheap_alert)
VALUES ('Mate', 'Nemeth', 'mate.nemeth@outlook.hu', 'asdasdasdasdasdsadsaasdasdasdasdasdsadsaasdasdasdasdasdsadsa', 2);

INSERT INTO cheap_alerts (id, zipcodes, treshold)
VALUES (1, '{10, 11, 12, 22, 24, 71}', 25);

INSERT INTO cheap_alerts (id, treshold)
VALUES (2, 25);