var express = require("express");
var bodyParser = require("body-parser");
require("dotenv").config();

var app = express();
var PORT = process.env.PORT || 3000;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("./public"));

// Require and set up handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Import routes and give the server access to them.
var routes = require("./controllers/scraper_controller.js");
app.use(routes);



app.listen(PORT, function() {
  console.log("listening on port", PORT);
});

