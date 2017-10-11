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
      
      $("#"+id)
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

  $('#scrapeButton').on('click', function(event) {
      event.preventDefault();

      console.log('Time to scrape NEW articles!');

      $.ajax({
          method: 'GET',
          url: 'api/scrape',
      }).done(function(numArticles){
          swal(`Scraped ${numArticles} new articles!`)
          .then(function(){
            window.location = "/";
          })
      })
  })

  $('#view-notes').on('click', function(event){
      event.preventDefault();
      let id = $(this).attr('data-id');
      console.log(`Viewing the notes for id: ${id}`);

      $.ajax({
          method: 'GET',
          url: 'api/getNotes',
          data: id,
      }).done(function(notes){
          let div;
          notes.forEach(function(note){
            div += $(`
            <div class="card">
          
                  <div class="card-block">
                    <div class='card-body'>
                    
                       <p class='card-text'>
                        ${note.text}
                       <button class='btn btn-danger float-right delete-note' data-id=${note._id} >X</button>
                       </p> 
                       
                    </div>
                  </div>
    
            </div>  
          `)
          })
          swal({
            title: 'Notes for: ',
            html: div,
            input: 'text',
            inputPlaceholder: 'New Note',
            confirmButtonText: 'Submit Note',
            showCancelButton: true,
          }).then({
              
          })
      })
  })
});
