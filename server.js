const express = require("express"),
  app = express(),
  favicon = require("serve-favicon"),
  port = 3003;
  tweakpane = require("tweakpane")

app.use(express.static("public"));
app.use(favicon(__dirname + "/public/assets/WPI.ico"));

app.get("/", function(request, response) {
  response.sendFile("/index.html");
});

app.listen(process.env.PORT || port);

