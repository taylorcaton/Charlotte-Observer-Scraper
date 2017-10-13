var request = require("request");
var cheerio = require("cheerio");

module.exports = function(cb) {
  request(
    "http://www.charlotteobserver.com/latest-news/#storylink=latest_side",
    function(error, response, html) {
      // Load the HTML into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(html);

      // An empty array to save the data that we'll scrape
      var results = [];

      // Select each element in the HTML body from which you want information.
      // NOTE: Cheerio selectors function similarly to jQuery's selectors,
      // but be sure to visit the package's npm page to see how it works
      $("div.teaser").each(function(i, element) {
        var topic = $(element)
          .children(".kicker")
          .text();

        var title = $(element)
          .children(".title")
          .text();

        var link = $(element)
          .children(".title")
          .children()
          .attr("href");

        var teaser = $(element)
          .contents()
          .eq(6)
          .text();

        var photo = $(element)
          .children()
          .children()
          .children()
          .children()
          .attr("src");

        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
          topic: topic,
          title: title,
          link: link,
          teaser: teaser,
          photo: photo
        });
      });

      return cb(results);
    }
  );
};
