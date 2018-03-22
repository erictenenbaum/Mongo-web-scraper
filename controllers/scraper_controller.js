var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var db = require("../models/");
var cheerio = require("cheerio");
var request = require("request");
var rp = require('request-promise');

var User = require("../models/Users.js");
var Article = require("../models/Articles.js");
var Comment = require("../models/Comments.js")

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});


router.get("/", (req, res) => {
    res.render("index")
});

router.get("/user/:id?", function (req, res) {
    console.log(req.params.id);

    db.User.find({ "_id": req.params.id }).then((dbUser) => {
        console.log(dbUser)
        let name = dbUser[0].name
        console.log(name)
        res.render("noart", { user: name })
    });
});

router.post("/user", (req, res) => {
    console.log(req.body)
    db.User.find({ "name": req.body.name }).then((dbUser) => {
        console.log(dbUser)

        if (dbUser.length === 0) {
            console.log("new user")

            var user = new User(req.body)
            User.create(user).then((dbNewUser) => {  
                // Send the new user to the front end
                res.json(dbNewUser)
            }).catch((err) => {
                console.log(err)
            })
        } else {
            console.log("returning user")
            res.json(dbUser[0])            
        }
    });
});

// Need to retrieve saved articles here
router.get("/myarticles", function (req, res) {
    db.Article.find({}).populate("comments").then(function (dbMyArticles) {       
        let frontEndArray = []
        dbMyArticles.forEach(obj => {
            if (obj.comments.length > 0) {
                frontEndArray.push(obj)
            }
        });
        res.render("saved", { artArray: frontEndArray })
    })
})

router.post("/delete", function (req, res) {
    console.log(req.body)
    db.Article.findOneAndRemove({ _id: req.body._id }, function (removed) {
        console.log(removed)
    })
})

router.post("/saved", function (req, res) {    
    db.Comment.create({ title: req.body.title, body: req.body.userComment })
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.body.articleId }, { comments: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            console.log(dbArticle)
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.get("/scraper", function (req, res) {

    // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
    request("https://www.reddit.com/r/webdev", function (error, response, html) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);       

        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $("p.title").each(function (i, element) {

            // Save the text of the element in a "title" variable
            var title = $(element).text();

            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");          

            Article.findOrCreate({ title: title }, { title: title, link: "https://www.reddit.com" + link },
                (err, fOrCResults) => {
                    // New Article:
                    console.log(fOrCResults);
                });
        });     

        db.Article.find({}).then((dbFindAll) => {
            let HBObj = { artArray: dbFindAll }
            res.render("articles", HBObj)
        });
    });
});

router.get("/articles/:id?", (req, res) => {
    userFEObj = {
        name: "",
        saved_articles: [],
        all_articles: []
    }
    db.Article.find({}).populate("comments").then((dbFoundArt) => {
        console.log(dbFoundArt);
    });

    res.render("articles")


});

module.exports = router;




















// router.post("/scrape", (req, res) => {
//     // console.log("*********", req.body);

//     // db.User.find({"_id": req.body._id}).then((dbScrapeUser) => {

//     // })

//     let url = "http://www.espn.com/"
//     request(url, function(error, response, html) {

//         // Load the HTML into cheerio and save it to a variable
//         // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//         var $ = cheerio.load(html);



//         // An empty array to save the data that we'll scrape
//         // var results = [];

//         // Select each element in the HTML body from which you want information.
//         // NOTE: Cheerio selectors function similarly to jQuery's selectors,
//         // but be sure to visit the package's npm page to see how it works
//         $(".headlineStack__list").each(function(i, element) {



//             var link = $(element).find("a").attr("href");
//             var title = $(element).children().text();

//             db.Article.find({ "title": title }).then((dbCheckArticle) => {
//                 if (dbCheckArticle.length === 0) { // results.push({
//                     //     title: title,
//                     //     link: link
//                     // });
//                     console.log("not found");

//                     let artObj = {
//                         title,
//                         link
//                     }

//                     var article = new Article(artObj);

//                     Article.create(article).then((dbNewArticle) => {
//                         // console.log(dbNewArticle)
//                         db.User.findOne({ "_id": req.body._id }).populate("articles").then((dbCheckUserArt) => {

//                             User.update({ "_id": req.body._id }, { $push: { saved_articles: dbNewArticle._id } },
//                                 () => {
//                                     console.log("SUCCESS");
//                                     // ********
//                                     // Need a function here to res.render user and articles
//                                 })

//                  // REALLY NOT SURE IF ANY OF THE CODE BELOW IS NECESSARY

//                             // console.log(dbNewArticle)

//                             // console.log("***********************")

//                             // console.log("YOLO", dbCheckUserArt.saved_articles)
//                             // console.log("BOLO", dbNewArticle._id);

//                             // if (dbCheckUserArt.saved_articles.length === 0) {
//                             //  console.log("YESSEIR")
//                             //     User.update({ "_id": req.body._id }, { $push: { saved_articles: dbNewArticle._id } },
//                             //      () => {
//                             //          console.log("SUCCESS");
//                             //      })
//                             // } else {
//                             //     if (dbCheckUserArt.saved_articles.includes(dbNewArticle._id)) {
//                             //         console.log("Already in user database")
//                             //     } else {
//                             //         User.update({ " _id": req.body._id }, { $push: { saved_articles: dbNewArticle._id } })
//                             //         // .then((dbAddArticle) => {
//                             //         //   console.log(dbAddArticle);
//                             //         // })
//                             //     }
//                             // }

//              // END NOT SURE PART



//                         })

//                     })


//                 } else {
//                     console.log("article already in database");

//                     db.User.findOne({ "_id": req.body._id }).populate("articles").then((dbArtInDB) => {
//                         // console.log(dbArtInDB);
//                         // console.log(dbCheckArticle);

//                         if(dbArtInDB.saved_articles.includes(dbCheckArticle[0]._id)) {
//                             console.log("In There")
//                         }
//                         else {
//                             User.update({ "_id": req.body._id }, { $push: { saved_articles: dbCheckArticle[0]._id } },
//                                 () => {
//                                     console.log("SUCCESS FROM THE INSIDE");
//                                     // ********
//                                     // Need a function here to res.render user and articles
//                                 })
//                         }


//                     })

//                     // NEED to check if article id exists in this users saved_articles array



//                     // if (dbCheckUserArt.saved_articles.includes(dbNewArticle._id)) {
//                     //     console.log("Already in user database")
//                     // } else {
//                     //     User.update({ _id: req.body._id }, { $push: { saved_articles: dbNewArticle._id } }, (dbAddArticle) => {
//                     //         console.log(dbAddArticle);
//                     //     })
//                     // }
//                 }
//             })









//             // Save these results in an object that we'll push into the results array we defined earlier

//         });

//         // Log the results once you've looped through each of the elements found with cheerio
//         // console.log(results);
//     });
// })