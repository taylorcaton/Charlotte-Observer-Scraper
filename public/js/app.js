$(document).ready(function() {
  $(".save-article").on("click", function(event) {
    event.preventDefault();
    let id = $(this).attr("data-id");

    console.log(`ID of article to be changed in DB ${id}`);

    $.ajax({
      method: "POST",
      url: "api/saveArticle",
      data: { id: id }
    }).done(function(msg) {
      $("#" + id)
        .text("Saved!")
        .removeClass("btn-outline-dark")
        .addClass("btn-success disabled");
      console.log(`Article has been saved: ${msg}`);
    });
  });

  $(".unsave-article").on("click", function(event) {
    event.preventDefault();
    let id = $(this).attr("data-id");

    console.log(`ID of article to be changed in DB ${id}`);

    $.ajax({
      method: "POST",
      url: "api/unsaveArticle",
      data: { id: id }
    }).done(function(msg) {
      window.location = "/savedArticles";
    });
  });

  $("#scrapeButton").on("click", function(event) {
    event.preventDefault();

    console.log("Time to scrape NEW articles!");

    $.ajax({
      method: "GET",
      url: "api/scrape"
    }).done(function(numArticles) {
      swal(`Scraped ${numArticles} new articles!`).then(function() {
        window.location = "/";
      });
    });
  });

  $(".view-notes").on("click", function(event) {
    event.preventDefault();
    let id = $(this).attr("data-id");
    console.log(`Viewing the notes for id: ${id}`);

    $.ajax({
      method: "POST",
      url: "api/getNotes",
      data: { id: id }
    }).done(function(notes) {
      let div;
      if (notes) {
        notes.forEach(function(note) {
          div += `<div class="card">
                      <div class="card-block">
                        <div class='card-body'>
                           <p class='card-text'>
                            ${note.text}
                           <button class='btn btn-danger float-right delete-note' data-id=${note._id} id='${note._id}'>X</button>
                           </p> 
                        </div>
                      </div>
                </div>`;
        });
      } else {
        div += `<div>
            Be the first to comment!
          </div>`;
      }

      swal({
        title: "Notes",
        html: div,
        input: "text",
        inputPlaceholder: "New Note",
        confirmButtonText: "Submit Note",
        showCancelButton: true
      })
        .catch(swal.noop)
        .then(function(note) {
          if (note) {
            $.ajax({
              method: "POST",
              url: "api/saveNote",
              data: { text: note, articleID: id }
            }).done(function(msg) {
              console.log(`After note msg: ${msg}`);
              swal({
                title: "Note has been saved!"
              }).then(function() {
                window.location = "/savedArticles";
              });
            });
          }
        });
    });
  });
});

$("body").on("click", ".delete-note", function(event) {
  console.log("Deleting A Note");

  event.preventDefault();

  let noteID = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "api/deleteNote",
    data: { id: noteID }
  }).done(function(msg) {
    console.log(msg);
    $("#" + noteID)
      .parent()
      .parent()
      .remove();
  });
});
