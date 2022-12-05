//Establishes all dependencies
const express = require("express"),
  app = express(),
  fileUpload = require('express-fileupload'),
  fs = require('fs'),
  bodyparser = require("body-parser"),
  favicon = require("serve-favicon"),
  mongodb = require("mongodb"),
  {google} = require('googleapis'),
  KEYFILEPATH = __dirname + '/googleKey2.json',
  SCOPES = ['https://www.googleapis.com/auth/drive'],
  port = 3000;

//MongoDB setup
const uri = "mongodb+srv://mapuser:mapuser@cluster0.0k894.mongodb.net/"
const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let shopCollection = null
let airbnbCollection = null
let typesCollection = null
//Connecting each 'collection' variable to a collection in the MongoDB database
client.connect(err => {
  shopCollection = client.db("VeniceShops").collection("MapsFeatures")
  airbnbCollection = client.db("VeniceShops").collection("Airbnb")
  typesCollection = client.db("VeniceShops").collection("Types")
})

//Google Drive authentication
const auth = new google.auth.GoogleAuth({
  keyfile: KEYFILEPATH,
  scopes: SCOPES
})
process.env.GOOGLE_APPLICATION_CREDENTIALS = KEYFILEPATH

//Middlewares
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/assets/gondola.ico"));
app.use(bodyparser.json());
app.use(fileUpload());

//Sends the user to the main html file on startup
app.get("/", function(request, response) {
  response.sendFile("/index.html");
});

//Grabs all data from the Shops collection
app.get("/load", function(request, response) {
  shopCollection
    .find({})
    .toArray()
    .then(result => response.json(result))
})

//Grabs all data from the Airbnb collection
app.get("/loadAirbnb", function(request, response) {
  airbnbCollection
    .find({})
    .toArray()
    .then(result => response.json(result));
})

//Grabs all data from the Types collection
app.get("/loadTypes", function(request, response) {
  typesCollection
    .find({})
    .toArray()
    .then(result => response.json(result))
})

//Modifies the Types collection
app.post("/setTypes", function(request, response) {
  const insertion = request.body.data
  //Deletes all data in the Types collection, inserts the inputted data,
  //and returns the new collection
  typesCollection
    .deleteMany({})
    .then(typesCollection.insertMany(insertion))
    .then(typesCollection.find({})
      .toArray()
      .then(result => response.json(result)))
})

//Inserts a new location into the Shops collection
app.post("/addLoc", function(request, response) {
  //Uses the inputted information to create a new 'info' array with one entry
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
  //Uses the inputted information and the calculated 'info' array to create a new location
  const jsonNew = {
    parent_id: request.body.parent_id,
    lat: request.body.lat,
    lng: request.body.lng,
    address_street: request.body.street + " " + request.body.number,
    address_sestiere: request.body.sestiere,
    address_num: request.body.number,
    info: infoArray
  }
  //Inserts the location into the Shops collection, returns the new collection
  shopCollection.insertOne(jsonNew)
  .then(shopCollection.find({}).toArray())
  .then(result => response.json(result));
})

//Adds a new entry to an existing location
app.post("/add", function(request, response) {
  const newInfo = request.body.info;
  //Uses the inputted information to create a new entry
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
  //Appends the new entry to the inputted 'info' array
  newInfo.push(jsonNew);
  //Updates the 'info' array of the location with the specified id to match the new array,
  //then returns the new collection
  shopCollection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(shopCollection.find({}).toArray())
  .then(result => response.json(result));
})

//Edits an existing entry of an existing location
app.post("/edit", function(request, response) {
  const newInfo = request.body.info;
  //Uses the inputted information to create a new entry
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
  //Iterates over the inputted 'info' array and replaces the corresponding entry
  //with the new, calcualted, updated entry
  for (let i = 0; i < newInfo.length; i++){
    if (newInfo[i].year_collected === request.body.year && !newInfo[i].deleted) {
      newInfo[i] = jsonNew
      break;
    }
  }
  //Updates the 'info' array of the corresponding location in the Shops collection,
  //then returns the new collection
  shopCollection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(shopCollection.find({}).toArray())
  .then(result => response.json(result));
})

//Marks a specificed entry for deletion
app.post("/delete", function(request, response) {
  const newInfo = request.body.info
  //Iterates over the inputted 'info' array, marks the specified entry for deletion
  //Entries are never deleted programmatically, rather the 'deleted' flag is set to
  //true and manual deletion can take place within MongoDB
  for (let i = 0; i < newInfo.length; i++){
    if (newInfo[i].year_collected === request.body.year && !newInfo[i].deleted) {
      newInfo[i].deleted = true
      break
    }
  }
  //Updates the 'info' array of the corresponding location in the Shops collection,
  //then returns the new collection
  shopCollection.updateOne(
    { _id: mongodb.ObjectId(request.body._id) },
    { $set: { info: newInfo }}
  )
  .then(shopCollection.find({}).toArray())
  .then(result => response.json(result));
})

//Downloads a file locally to prepare it for a Google Drive upload
app.post("/uploadLocal", (request, response) => {
  //Establishes the filename and path of the image
  const fileName = request.files.myFile.name
  const path = __dirname + '/images/' + fileName

  //Moves the file to the local 'images' folder, returns the path
  request.files.myFile.mv(path, (error) => {
    //Returns an error if necessary
    if (error) {
      console.error(error)
      response.writeHead(500, {
        'Content-Type': 'application/json'
      })
      response.end(JSON.stringify({ status: 'error', message: error}))
      return
    }
    response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify({status: 'success', path: path}))
  })
})

//Uploads a local image file to Google Drive
app.post("/upload", function(request, response) {
  //Opens a google drive session
  const driveService = google.drive({version: "v3", auth})
  //Specifies the metadata of the upload
  let fileMetaData = {
    name: request.body.imgName,
    parents: ['1UURF6BTn3C6SWS8Yct7XlsHlsIu1lyc6']
  }
  //Specifies the content of the upload
  let media = {
    mimeType: 'image/png, image/jpeg',
    body: fs.createReadStream(request.body.imgsrc)
  }

  let result;

  //Uploads the file to Google Drive, removes the image from local storage,
  //and returns a link to the image on Google Drive
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

//Tells the app which port to listen on
app.listen(process.env.PORT || port);