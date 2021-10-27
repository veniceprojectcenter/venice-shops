const { json } = require("express");

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

app.post("/addLoc", function(request, response) {
  const infoArray = []
  const infoJSON = {
    parent_id: request.body.parent_id,
    address: request.body.sestiere + " " + request.body.number,
    address_street: request.body.street + " " + request.body.number,
    store_name: request.body.name,
    store_type: request.body.store,
    group_type: "Undefined",
    nace_code: "Undefined",
    year_collected: request.body.year,
    image_url: request.body.image,
    note: request.body.note,
    flagged: request.body.flagged
  }
  infoArray.push(infoJSON)
  const jsonNew = {
    parent_id: request.body.parent_id,
    lat: request.body.lat,
    lng: request.body.lng,
    address_street: request.body.street + " " + request.body.number,
    address_sestiere: request.body.sestiere,
    address_num: request.body.number,
    info: infoArray
  }
  collection.insertOne(jsonNew)
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.post("/add", function(request, response) {
  const newInfo = request.body.info;
  const jsonNew = {
    parent_id: request.body.parent_id,
    address: request.body.address,
    address_street: request.body.address_street,
    store_name: request.body.name,
    store_type: request.body.store,
    group_type: request.body.group,
    nace_code: request.body.nace,
    year_collected: request.body.year,
    image_url: request.body.image,
    note: request.body.note,
    flagged: request.body.flagged
  };
  newInfo.push(jsonNew);
  collection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.post("/edit", function(request, response) {
  const newInfo = request.body.info;
  const jsonNew = {
    parent_id: request.body.parent_id,
    address: request.body.address,
    address_street: request.body.address_street,
    store_name: request.body.name,
    store_type: request.body.store,
    group_type: request.body.group,
    nace_code: request.body.nace,
    year_collected: request.body.year,
    image_url: request.body.image,
    note: request.body.note,
    flagged: request.body.flagged
  };
  newInfo[request.body.index] = jsonNew;
  collection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.post("/delete", function(request, response) {
  if (request.body.info.length === 1){
    collection.deleteOne({ _id: mongodb.ObjectId(request.body._id) })
    .then(collection.find({}).toArray())
    .then(result => response.json(result));
  }
  else{
    const newInfo = request.body.info
    newInfo.splice(request.body.index, 1)
    collection.updateOne(
      { _id: mongodb.ObjectId(request.body._id) },
      { $set: { info: newInfo }}
    )
    .then(collection.find({}).toArray())
    .then(result => response.json(result));
  }
})

app.listen(port);

