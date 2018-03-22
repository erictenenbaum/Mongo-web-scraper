var mongoose = require("mongoose");
const findOrCreate = require('mongoose-find-or-create')

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new ArticleSchema object
var ArticleSchema = new Schema({
 // title of article
  title: {
    type: String    
  }, 
  link: {
    type: String
  },

  // `notes` is an array that stores ObjectIds
  // The ref property links these ObjectIds to the Note model
  // This allows us to populate the User with any associated Notes
  comments: [
    {
      // Store ObjectIds in the array
      type: Schema.Types.ObjectId,
      // The ObjectIds will refer to the ids in the Note model
      ref: "Comment"
    }
  ]
});

ArticleSchema.plugin(findOrCreate)

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the User model
module.exports = Article;