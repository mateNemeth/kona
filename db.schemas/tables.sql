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
    alerts INT NOT NULL,
    password CHAR(60) NOT NULL
);

CREATE TABLE user_alerts (
    id SERIAL NOT NULL PRIMARY KEY,
    zipcodes INT[],
    treshold INT
);