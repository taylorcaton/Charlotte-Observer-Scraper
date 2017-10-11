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
  Article.find({}, function(err, articles) {
    console.log(articles);
    articles.reverse();
    res.render("articles", { article: articles });
  });
});

app.get("/savedArticles", function(req, res) {
  Article.find({ saved: true }, function(err, articles) {
    console.log(articles);
    res.render("savedarticles", { article: articles });
  });
});

app.post("/api/saveArticle", function(req, res) {
  console.log(req.body.id);
  Article.findByIdAndUpdate(
    req.body.id,
    { $set: { saved: true } },
    { new: true },
    function(err, msg) {
      res.send(`updated`);
    }
  );
});

app.post("/api/unsaveArticle", function(req, res) {
  console.log(req.body.id);
  Article.findByIdAndUpdate(
    req.body.id,
    { $set: { saved: false } },
    { new: true },
    function(err, msg) {
      if (err) {
        console.log(err);
      } else {
        console.log(msg);
      }
      res.send(`updated`);
    }
  );
});

app.post("/api/saveNote", function(req, res) {
  console.log(req.body);
  let note = new Note(req.body);
  note.save((err, doc) => {
    if (err) {
      res.json(err);
    } else {
      res.json(doc);
    }
  });
});

app.post("/api/getNotes", function(req, res) {
  console.log(req.body);
  Note.find({articleID:req.body.id}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.json(docs);
    }
  });
});

app.post("/api/deleteNote", function(req, res) {
    console.log(req.body.id);
    Note.findByIdAndRemove(req.body.id, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        res.json(docs);
      }
    });
  });

// A GET request to scrape the echojs website
app.get("/api/scrape", function(req, res) {
  var getData = require("./clt-scraper.js");

  var oldArticles = [];
  var newArticles = [];

  var articlesAdded = 0;
  var itemsProcessed = 0;

  getData(function(results) {
    results.forEach(function(ele, i, array) {
      ele.topic = ele.topic.replace("\n", "").trim();
      ele.title = ele.title.replace("\n", "").trim();
      ele.teaser = ele.teaser.replace("\n", "").trim();

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
              res.json(articlesAdded);
            }
          });
        } else {
          itemsProcessed++;

          if (itemsProcessed == results.length) {
            // Tell the browser that we finished scraping the text
            res.json(articlesAdded);
          }
        }
      });
    });
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
