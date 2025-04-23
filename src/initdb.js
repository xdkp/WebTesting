const pool = require("./db"); // Adjust the path as necessary

const retryInterval = 5000; // 5 seconds
const maxRetries = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resetAndInitializeDb = async (retryCount = 0) => {
  const dropTablesQuery = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS attractions CASCADE;
	DROP TABLE IF EXISTS items CASCADE;
  `;

  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firstname VARCHAR(50) NOT NULL,
      lastname VARCHAR(50) NOT NULL,
      password VARCHAR(100) NOT NULL,
      email VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attractions (
      id SERIAL PRIMARY KEY,
      attraction VARCHAR(50) UNIQUE NOT NULL,
      status VARCHAR(50) NOT NULL,
      image VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

	CREATE TABLE IF NOT EXISTS items (
		id SERIAL PRIMARY KEY,
		item VARCHAR(50) UNIQUE NOT NULL,
		price decimal(12,2) NOT NULL,
		image VARCHAR(50) NOT NULL,
		description TEXT NOT NULL,
		type VARCHAR(50) NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	  );
  `;

  const insertQueries = `
    INSERT INTO attractions (attraction, status, image, description, type) VALUES
    ('T-Rex Encounter', 'Active', 'images/1.png', 'Experience the mighty Tyrannosaurus in its natural habitat.', 'Dinosaur Experience'),
    ('Raptor Run', 'Active', 'images/2.png', 'Get up close with the fastest dinosaurs on the island.', 'Dinosaur Experience'),
    ('Triceratops Trail', 'Active', 'images/3.png', 'Walk among gentle giants in the Triceratops Trail.', 'Dinosaur Experience'),
    ('Brachiosaurus Journey', 'Active', 'images/4.png', 'Gaze upon the majestic Brachiosaurus as they graze.', 'Dinosaur Experience'),
    ('Stegosaurus Safari', 'Active', 'images/1.png', 'Discover the Stegosaurus in this unique safari experience.', 'Dinosaur Experience'),
    ('Pterosaur Flight', 'Active', 'images/2.png', 'Soar the skies with Pterosaurs!', 'Dinosaur Experience'),
    ('Velociraptor Valley', 'Active', 'images/3.png', 'Enter the world of the swift and cunning Velociraptor.', 'Dinosaur Experience'),
    ('Jurassic Coaster', 'Active', 'images/4.png', 'An exhilarating roller-coaster ride through the Jurassic.', 'Ride'),
    ('Dino Carousel', 'Active', 'images/1.png', 'A fun ride for all ages on our Dinosaur-themed carousel.', 'Ride'),
    ('The Cretaceous Cruise', 'Active', 'images/2.png', 'Embark on a relaxing river cruise through the Cretaceous period.', 'Ride')
    ON CONFLICT DO NOTHING;

	INSERT INTO items (item, price, image, description, type) VALUES
    ('Tshirt1', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt2', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt3', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt4', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt5', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt6', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt7', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt8', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt9', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt10', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt11', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt12', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt13', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt14', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
	('Tshirt15', 19.99, 'images/1.png', 'A tshirt.', 'Clothing'),
    ('Mug', 9.99, 'images/2.png', 'A mug.', 'Clothing')
    ON CONFLICT DO NOTHING;
  `;

  try {
    await pool.query(dropTablesQuery);
    await pool.query(createTablesQuery);
    await pool.query(insertQueries);
    console.log("Database reset, tables created, and attractions added successfully.");
  } catch (error) {
    if (error.code === "57P03") {
      if (retryCount < maxRetries) {
        console.log(
          `Database is starting up, retrying in ${
            retryInterval / 1000
          } seconds... (Attempt ${retryCount + 1}/${maxRetries})`
        );
        await sleep(retryInterval);
        await resetAndInitializeDb(retryCount + 1);
      } else {
        console.error(
          `Failed to reset database after ${maxRetries} attempts:`,
          error
        );
      }
    } else {
      console.error(
        "Error resetting database and creating tables:",
        error
      );
    }
  }
};

module.exports = resetAndInitializeDb;
