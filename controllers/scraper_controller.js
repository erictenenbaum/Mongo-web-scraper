var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var db = require("../models/");
var cheerio = require("cheerio");
var request = require("request");
var rp = require('request-promise');

var User = require("../models/Users.js");
var Article = require("../models/Articles.js");

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

router.get("/user/:id?", function(req, res) {
    console.log(req.params.id);

    db.User.find({ "_id": req.params.id }).then((dbUser) => {
        console.log(dbUser)
        // if (dbUser[0].saved_articles.length === 0) {
        let name = dbUser[0].name
        console.log(name)
        res.render("noart", { user: name })
        // } 
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
                // console.log(dbNewUser)
                // let name = dbNewUser.name
                // res.render("noart", {user: name})

                res.json(dbNewUser)
            }).catch((err) => {
                console.log(err)
            })
        } else {
            console.log("returning user")

            // if (dbUser[0].saved_articles.length === 0) {
            // let name = dbUser.name
            res.json(dbUser[0])
            // }
        }
    });
});

// Need to retrieve saved articles here
router.get("/myarticles", function(req, res){
    db.Article.find({}).then(function(dbMyArticles){
        console.log(dbMyArticles)
    })
})

router.post("/saved", function(req, res){
    console.log(req.body)

    Article.create(req.body).then(createdArticle =>{
        console.log(createdArticle)
    })
})

router.get("/scraper", function(req, res) {

    // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
    request("https://www.reddit.com/r/webdev", function(error, response, html) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // An empty array to save the data that we'll scrape
        var results = [];

        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $("p.title").each(function(i, element) {

            // Save the text of the element in a "title" variable
            var title = $(element).text();

            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");

            // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
                title: title,
                link: "https://www.reddit.com" + link
            });
        });

        // Log the results once you've looped through each of the elements found with cheerio
        // console.log(results);
        // console.log(req.body)

        let HBObj = {
            id: req.body._id,
            artArray: results
        }

        // res.render("articles", HBObj)

        res.render("articles", HBObj)


    });
})


// Not in use, I need to go back and figure all of this out. 
router.post("/scrape", (req, res) => {


    // let url = "http://www.espn.com/"
    let url = "http://bleacherreport.com/nfl"
    rp(url, function(error, response, html) {
        console.log("hello")

        var $ = cheerio.load(html);

        // Create something with iteration counting to check if increment equals the number of articles checked
        var results = [];

        // $(".headlineStack__list").each(function(i, element) {



        $(".organism, .contentStream, .selected").find("li, .cell, .articleSummary").each((i, element) => {


            // var link = $(element).find("a").attr("href");
            // var title = $(element).children().text();

            var title = $(element).find(".atom, .commentary").children().first().text();
            var link = $(element).find(".articleMedia").children().first().attr("href");



            if (title == "" || link == undefined) {
                // console.log("empty")

            } else {
                results.push({ title, link });
                // console.log("*************", title)
                // console.log(link)
            }



            // db.Article.find({ "title": title }).then((dbCheckArticle) => {
            //     if (dbCheckArticle.length === 0) {
            //         console.log("not found");

            //         let artObj = {
            //             title,
            //             link
            //         }

            //         var article = new Article(artObj);

            //         Article.create(article).then((dbNewArticle) => {

            //         })

            //     } else {
            //         console.log("article already in database");
            //     }
            // })

        })

        // console.log(results);

        // function checkAgainstDB(resArray, cb) {



        //     var counter = 0


        //     for (let i = 0; i < resArray.length; i++) {

        //         db.Article.find({ "link": resArray[i].link }).then((dbCheckArticle) => {
        //             if (dbCheckArticle.length === 0) {
        //                 console.log("not found");

        //                 let artObj = {
        //                     title: resArray[i].title,
        //                     link: resArray[i].link
        //                 }

        //                 var article = new Article(artObj);

        //                 Article.create(article).then((dbNewArticle) => {
        //                         // console.log(dbNewArticle)
        //                 })

        //             } else {
        //                 console.log("article already in database");
        //             }
        //         })
        //         // console.log(i);

        //         setTimeout(function(){counter++}, 0)

        //         if(counter + 1 == resArray.length) {
        //             console.log("continue", counter)
        //         }
        //         else {
        //             console.log("move on")
        //             setTimeout(cb, 0)
        //         }
        //     }




        // }

        // checkAgainstDB(results, function(){
        //     db.Article.find({}).then(function(cbResult){
        //         console.log(cbResult)
        //     })
        // });


        function checkAgainstDB(resArray, cb) {
            // console.log(resArray)

            db.Article.find({}).then(function(dbResults) {
                cb(resArray, dbResults)
            })


        }

        function sendToHandleBars(feArray) {
            console.log("@@@@@@@@@@@@@", feArray.length);
            // console.log(feArray)
            // console.log(req.params.id)



            res.render("articles", feArray)
        }

        checkAgainstDB(results, function(scrape, db) {

            var displayForFE = [];
            console.log("*******", scrape.length);
            console.log("88888888", db.length);

            // db.includes(scrape[i].link)

            let dbTitleArray = []

            db.forEach(function(element) {
                dbTitleArray.push(element.link)
            })

            for (let i = 0; i < scrape.length; i++) {

                if (dbTitleArray.includes(scrape[i].link)) {
                    console.log("includes");
                    displayForFE.push(db[i])

                } else {

                    var article = new Article(scrape[i]);

                    Article.create(article).then(function(dbCreateArt) {
                        console.log("added to database")
                    })
                    displayForFE.push(scrape[i]);
                }
            }

            if (db.length !== displayForFE.length) {
                console.log("missing some")

                // Need to add remaining database articles that were not included in the scrape       

            } else {
                console.log("got everything")
            }

            sendToHandleBars(displayForFE);


        });


    }).then(() => {

        // console.log(results)
        res.json(req.body)


    })
})

router.get("/articles/:id?", (req, res) => {
    userFEObj = {
        name: "",
        saved_articles: [],
        all_articles: []
    }
    db.Article.find({}).populate("comments").then((dbFoundArt) => {
        // console.log(dbFoundArt);
    })

    res.render("articles")


})




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