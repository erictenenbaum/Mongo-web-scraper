    $(function() {        
        // User Modal to sign in user (informal, no authentication)
        $("#exampleModal").modal("show");
        
        $(".user-button").on("click", () => {
            let name = $("#user-name").val().trim();
            let userObj = { name }

            // Post Request to find all user's saved articles
            $.post("/user", userObj).then((data) => {
                console.log(data) 
                          
                location.assign("/user/"+data._id)
        });

            // End of modal
            $("#exampleModal").modal("hide");
        });

        // This code is not in use anymore

        $(".scrape-btn").on("click", () => {

            var location = window.location.href;

            var idIndex = location.split("").lastIndexOf("/");

            var idArray = location.slice(idIndex + 1);

            console.log(idArray);

            
            let scrapeObj = {
                _id: idArray
            }

            console.log(scrapeObj);
            $.post("/scraper", scrapeObj).then((data) => {
                console.log(data);

                function checkForData(obj) {
                    if(obj){
                        window.logcation.assign("/articles/" + obj._id)
                    }
                }

                // window.location.assign("/articles/" + data._id)
            })
        })


        $(".save-btn").on("click", function(){
         

            console.log($(this).attr("data-title"))


            let saveObj = {link: $(this).attr("data-link"), title: $(this).attr("data-title")}

            console.log(saveObj)

            $.post("/saved", saveObj).then((saved) =>{
                console.log(saved)
            })
            
        })


        $(".comment-btn").on("click", function(){
            $("#commentModal").modal("show")

            $(".comment-button").on("click", function(){
                
            })
        })




    });