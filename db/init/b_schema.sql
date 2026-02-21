CREATE TABLE IF NOT EXISTS spots (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  category   VARCHAR(100),
  lat        DOUBLE PRECISION NOT NULL,
  long       DOUBLE PRECISION NOT NULL,
  address    TEXT,
  location   GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 半径検索を高速化するインデックス
CREATE INDEX IF NOT EXISTS idx_spots_location
  ON spots USING GIST (location);