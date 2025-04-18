DROP TABLE IF EXISTS Shipwrecks;

-- Create the Shipwrecks table
CREATE TABLE Shipwrecks (
    wreck_id INT PRIMARY KEY NOT NULL,
    wreck_name VARCHAR,
    vessel_type VARCHAR,
    flag VARCHAR,
    obstruction_type VARCHAR,
    lat NUMERIC(10,6) NOT NULL,
    lon NUMERIC(10,6) NOT NULL,
    cargo VARCHAR,
    water_depth NUMERIC(5,1),
    year_sunk DATE
);