CREATE TEMP TABLE spots_import (
  name      VARCHAR(255),
  category  VARCHAR(100),
  lat       DOUBLE PRECISION,
  long      DOUBLE PRECISION,
  address   TEXT
);

COPY spots_import(name, category, lat, long, address)
FROM '/tmp/seed.csv'
WITH (FORMAT csv, HEADER true);

INSERT INTO spots (name, category, lat, long, address, location)
SELECT
  name,
  category,
  lat,
  long,
  address,
  ST_MakePoint(long, lat)::GEOGRAPHY
FROM spots_import;