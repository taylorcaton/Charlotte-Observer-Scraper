// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

//Model Imports
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");


// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan, body parser, and handlebars with our app
app.use(logger("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/clt-scraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// ======
app.get("/", function(req, res) {
    Article.find({}, function(err, articles){
        console.log(articles);
        res.render("articles", {article: articles});
    })
    
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  var getData = require("./clt-scraper.js");

  var oldArticles = [];
  var newArticles = [];

  var articlesAdded = 0;
  var itemsProcessed = 0;

  getData(function(results) {
    results.forEach(function(ele, i, array) {
      ele.topic = ele.topic.replace("\n", "").trim();
      ele.title = ele.title.replace("\n", "").trim();

      var query = Article.findOne({ title: ele.title });
      query.exec(function(err, exists) {
        if (!exists) {
          var article = new Article(ele);
          article.save(function(err, save) {
            itemsProcessed++;
            console.log(
              `itemsProcessed: ${itemsProcessed} of ${results.length}`
            );
            if (err) {
              throw err;
            } else {
              articlesAdded++;
            }
            if (itemsProcessed == results.length) {
              // Tell the browser that we finished scraping the text
              res.send("There were " + articlesAdded + " articles added");
            }
          });
        } else {
          itemsProcessed++;

          if (itemsProcessed == results.length) {
            // Tell the browser that we finished scraping the text
            res.send("There were " + articlesAdded + " articles added");
          }
        }
      });
    });
  });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Or send the doc to the browser as a json object
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    // now, execute our query
    .exec(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      } else {
        // Otherwise, send the doc to the browser as a json object
        res.json(doc);
      }
    });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Otherwise
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ _id: req.params.id }, { note: doc._id })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          } else {
            // Or send the document to the browser
            res.send(doc);
          }
        });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
