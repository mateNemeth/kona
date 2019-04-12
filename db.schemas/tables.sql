CREATE TABLE carlist (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    platform_id TEXT NOT NULL,
    link TEXT NOT NULL,
    date_of_scan DATE DEFAULT NOW()
);

CREATE TABLE carspec (
    id BIGINT NOT NULL PRIMARY KEY,   
    make VARCHAR(50) NOT NULL,
    cartype BIGINT NOT NULL,
    fuel VARCHAR(8) NOT NULL,    
    transmission VARCHAR(10),
    price INT NOT NULL,
    city VARCHAR(20)
);

CREATE TABLE cartypes (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    age INT NOT NULL
);
