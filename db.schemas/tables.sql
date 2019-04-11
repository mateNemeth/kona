CREATE TABLE carspec (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    engine INT NOT NULL,
    age INT,
    transmission VARCHAR(10),
    city VARCHAR(20),
    link VARCHAR(200)
)

CREATE TABLE carlist (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    platform VARCHAR(20) NOT NULL,
    platform_id INT NOT NULL,
    price INT NOT NULL,
    date_of_scan DATE DEFAULT NOW()
)