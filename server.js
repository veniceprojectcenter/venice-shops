const express = require("express"),
    app = express(),
    fileUpload = require("express-fileupload"),
    fs = require("fs"),
    bodyparser = require("body-parser"),
    favicon = require("serve-favicon"),
    { Pool } = require("pg");

const port = process.env.PORT || 3000;

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // Required for Heroku SSL connection
  },
});

// Middleware
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/assets/gondola.ico"));
app.use(bodyparser.json());
app.use(fileUpload());

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Load all data from mapsfeatures
app.get("/load", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM mapsfeatures");
    res.json(result.rows);
  } catch (error) {
    console.error("Error loading mapsfeatures:", error);
    res.status(500).send("Error loading data");
  }
});

// Load all Airbnb data
app.get("/loadAirbnb", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM airbnb");
    res.json(result.rows);
  } catch (error) {
    console.error("Error loading Airbnb data:", error);
    res.status(500).send("Error loading data");
  }
});

// Load all Types data
app.get("/loadTypes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM types");
    res.json(result.rows);
  } catch (error) {
    console.error("Error loading types:", error);
    res.status(500).send("Error loading data");
  }
});

// Modify the Types table
app.post("/setTypes", async (req, res) => {
  const insertion = req.body.data;

  try {
    await pool.query("DELETE FROM types"); // Clear existing data
    const values = insertion.map((item) => `('${item.id}', '${item.type}', '${item.category}')`).join(",");
    await pool.query(`INSERT INTO types (id, type, category) VALUES ${values}`);

    const result = await pool.query("SELECT * FROM types");
    res.json(result.rows);
  } catch (error) {
    console.error("Error modifying types:", error);
    res.status(500).send("Error modifying data");
  }
});

// Insert a new location into mapsfeatures
app.post("/addLoc", async (req, res) => {
  try {
    const { parent_id, lat, lng, street, number, sestiere, name, store, year, image, note, flagged } = req.body;

    const infoArray = JSON.stringify([
      {
        parent_id,
        address: `${sestiere} ${number}`,
        address_street: `${street} ${number}`,
        store_name: name,
        store_type: store,
        group_type: "Undefined",
        nace_code: "Undefined",
        year_collected: year,
        image_url: image,
        note,
        flagged,
      },
    ]);

    await pool.query(
        `INSERT INTO mapsfeatures (mongo_id, parent_id, lat, lng, address_street, address_sestiere, address_num, info)
       VALUES (DEFAULT, NULL, $1, $2, $3, $4, $5, $6) RETURNING *`,
        [parent_id, lat, lng, `${street} ${number}`, sestiere, number, infoArray]
    );

    const result = await pool.query("SELECT * FROM mapsfeatures");
    res.json(result.rows);
  } catch (error) {
    console.error("Error inserting location:", error);
    res.status(500).send("Error inserting location");
  }
});

// Add a new entry to an existing location
app.post("/add", async (req, res) => {
  try {
    const { mongo_id, info } = req.body;
    const updatedInfo = JSON.stringify(info);  // Ensure it's turned into JSON

    await pool.query("UPDATE mapsfeatures SET info = $1 WHERE mongo_id = $2", [updatedInfo, mongo_id]);

    const result = await pool.query("SELECT * FROM mapsfeatures");
    res.json(result.rows);
  } catch (error) {
    console.error("Error adding entry:", error);
    res.status(500).send("Error adding entry");
  }
});

// Edit an existing entry
app.post("/edit", async (req, res) => {
  try {
    const { mongo_id, info } = req.body;
    const updatedInfo = JSON.stringify(info);  // Ensure it's turned into JSON

    await pool.query("UPDATE mapsfeatures SET info = $1 WHERE mongo_id = $2", [updatedInfo, mongo_id]);

    const result = await pool.query("SELECT * FROM mapsfeatures");
    res.json(result.rows);
  } catch (error) {
    console.error("Error editing entry:", error);
    res.status(500).send("Error editing entry");
  }
});

// Soft-delete an entry
app.post("/delete", async (req, res) => {
  try {
    const { mongo_id, info } = req.body;
    const updatedInfo = info.map((entry) => {
      if (entry.year_collected === req.body.year && !entry.deleted) {
        entry.deleted = true;
      }
      return entry;
    });

    await pool.query("UPDATE mapsfeatures SET info = $1 WHERE mongo_id = $2", [JSON.stringify(updatedInfo), mongo_id]);

    const result = await pool.query("SELECT * FROM mapsfeatures");
    res.json(result.rows);
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).send("Error deleting entry");
  }
});

// Insert Airbnb Data
app.post("/addAirbnb", async (req, res) => {
  try {
    const { mongo_id, lat, lng, address_sestiere, years } = req.body;

    await pool.query(
        `INSERT INTO airbnb (mongo_id, lat, lng, address_sestiere, years) 
       VALUES ($1, $2, $3, $4, $5)`,
        [mongo_id, lat, lng, address_sestiere, JSON.stringify(years)]
    );

    const result = await pool.query("SELECT * FROM airbnb");
    res.json(result.rows);
  } catch (error) {
    console.error("Error inserting Airbnb data:", error);
    res.status(500).send("Error inserting data");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
