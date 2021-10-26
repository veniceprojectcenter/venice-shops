const express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  favicon = require("serve-favicon"),
  mongodb = require("mongodb"),
  port = 3003;

const uri = "mongodb+srv://mapuser:mapuser@cluster0.0k894.mongodb.net/"

const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let collection = null;

client.connect(err => {
  collection = client.db("VeniceShops").collection("MapsFeatures")
})

app.use(express.static("public"));
app.use(favicon(__dirname + "/public/assets/gondola.ico"));
app.use(bodyparser.json());

app.get("/", function(request, response) {
  response.sendFile("/index.html");
});

app.get("/load", function(request, response) {
  collection
    .find({})
    .toArray()
    .then(result => response.json(result));
})

app.post("/add", function(request, response) {
  const newInfo = request.body.info;
  const json = {
    store_name: request.body.name,
    store_type: request.body.store,
    group_type: request.body.group,
    year_collected: request.body.year,
    image_url: request.body.image
  };
  newInfo.push(json);
  collection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.post("/edit", function(request, response) {
  const newInfo = request.body.info;
  const json = {
    store_name: request.body.name,
    store_type: request.body.store,
    group_type: request.body.group,
    year_collected: request.body.year,
    image_url: request.body.image
  };
  newInfo[request.body.index] = json;
  collection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.listen(port);

