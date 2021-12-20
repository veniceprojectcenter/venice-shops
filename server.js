const express = require("express"),
  app = express(),
  fileUpload = require('express-fileupload'),
  fs = require('fs'),
  bodyparser = require("body-parser"),
  favicon = require("serve-favicon"),
  mongodb = require("mongodb"),
  {google} = require('googleapis'),
  KEYFILEPATH = __dirname + '/googleKey.json',
  SCOPES = ['https://www.googleapis.com/auth/drive'],
  port = 3003;

const uri = "mongodb+srv://mapuser:mapuser@cluster0.0k894.mongodb.net/"

const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let collection = null
let collection2 = null
let collection3 = null

client.connect(err => {
  collection = client.db("VeniceShops").collection("MapsFeatures")
  collection2 = client.db("VeniceShops").collection("Airbnb")
  collection3 = client.db("VeniceShops").collection("Types")
})

const auth = new google.auth.GoogleAuth({
  keyfile: KEYFILEPATH,
  scopes: SCOPES
})

process.env.GOOGLE_APPLICATION_CREDENTIALS = KEYFILEPATH

app.use(express.static("public"));
app.use(favicon(__dirname + "/public/assets/gondola.ico"));
app.use(bodyparser.json());
app.use(fileUpload());

app.get("/", function(request, response) {
  response.sendFile("/index.html");
});

app.get("/load", function(request, response) {
  collection
    .find({})
    .toArray()
    .then(result => response.json(result))
})

app.get("/loadairbnb", function(request, response) {
  collection2
    .find({})
    .toArray()
    .then(result => response.json(result));
})

app.get("/loadtypes", function(request, response) {
  collection3
    .find({})
    .toArray()
    .then(result => response.json(result))
})

app.post("/settypes", function(request, response) {
  const insertion = request.body.data
  collection3
    .deleteMany({})
    .then(collection3.insertMany(insertion))
    .then(collection3.find({})
      .toArray()
      .then(result => response.json(result)))
})

app.post("/addLoc", function(request, response) {
  const infoArray = [{
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
  }]
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
  for (let i = 0; i < newInfo.length; i++){
    if (newInfo[i].year_collected === request.body.year && !newInfo[i].deleted) {
      newInfo[i] = jsonNew
      break;
    }
  }
  collection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.post("/delete", function(request, response) {
  const newInfo = request.body.info
  for (let i = 0; i < newInfo.length; i++){
    if (newInfo[i].year_collected === request.body.year && !newInfo[i].deleted) {
      newInfo[i].deleted = true
      break
    }
  }
  collection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(collection.find({}).toArray())
  .then(result => response.json(result));
})

app.post("/uploadLocal", (req, res) => {
  const fileName = req.files.myFile.name
  const path = __dirname + '/images/' + fileName

  req.files.myFile.mv(path, (error) => {
    if (error) {
      console.error(error)
      res.writeHead(500, {
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({ status: 'error', message: error}))
      return
    }
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({status: 'success', path: path}))
  })
})

app.post("/upload", function(request, response) {

  const driveService = google.drive({version: "v3", auth})
  
  let fileMetaData = {
    name: request.body.imgName,
    parents: ['1UURF6BTn3C6SWS8Yct7XlsHlsIu1lyc6']
  }

  let media = {
    mimeType: 'image/png, image/jpeg',
    body: fs.createReadStream(request.body.imgsrc)
  }

  let result;

  driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: 'webContentLink'
  })
  .then(function (resultlink) {
    result = resultlink
    return 0;
  })
  .then(function () {
    fs.unlinkSync(request.body.imgsrc)
  })
  .then(function () {
    response.json(result)
  })
})

app.listen(process.env.PORT || port);

