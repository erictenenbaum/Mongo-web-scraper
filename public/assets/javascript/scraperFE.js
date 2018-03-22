$(function () {
    // User Modal to sign in user (informal, no authentication)
    $("#exampleModal").modal("show");

    $(".user-button").on("click", () => {
        let name = $("#user-name").val().trim();
        let userObj = { name }

        // Post Request to find all user's saved articles
        $.post("/user", userObj).then((data) => {
            console.log(data)
            location.assign("/user/" + data._id)
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
                if (obj) {
                    window.logcation.assign("/articles/" + obj._id)
                }
            }
        });
    });

    let saveObj = {};
    $(".comment-btn").on("click", function () {
        $("#commentModal").modal("show");

        saveObj.link = $(this).attr("data-link");
        saveObj.title = $(this).attr("data-title");
        saveObj.articleId = $(this).attr("data-id");

    });

    $(".comment-button").on("click", function () {
        //Global Save Object
        console.log(saveObj);
        let userComment = $("#comment-text").val().trim();
        saveObj.userComment = userComment;

        // Save object after we add the user comment
        console.log(saveObj)

        $.post("/saved", saveObj).then((data) => {
            console.log(data)
        });
        $("#commentModal").modal("hide");
    });



    $(".delete-btn").on("click", function () {
        console.log($(this).attr("data-id"))
        let toBeDeleted = $(this).attr("data-id");

        $.post("/delete", { _id: toBeDeleted }).then(deleted => {
            console.log(deleted)
        });
    });
});