const express = require('express');
const router = express.Router();
const Post = require("../models/Post.js");  



// Routes
router.get("/", async (req, res) => {
      try {
      const locals = {
          title: "Blogsite",
          message: "Welcome to the Blogsite",
        };
        let perPage = 10;
        let page = req.query.page || 1;
        const data = await Post.aggregate([{ $sort : {createdAt : -1}}])
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage =  nextPage <=Math.ceil(count/perPage);   
        res.render("index.ejs", { locals, data, current : page, nextPage : hasNextPage? nextPage : null, currentRoute : "/" });


      } catch (error) {
        console.log(error);
      }  
});


router.get("/about", (req, res) => {
  res.render("about.ejs", {currentRoute : "/about"});
});



router.get("/post/:id", async (req, res) => {
  try{


    let slug = req.params.id;
    const data = await Post.findById({_id: slug});
    const locals = {
      title: data.title,
      message: "Welcome to the Blogsite",
      currentRoute : `/post/${slug}`
    };  
    res.render("post.ejs", { locals, data });
  }
  catch(error){
    console.log(error);
  }
});

router.post("/search", async (req, res) => {
  try{

    const locals = {
      title :"Search",
      description : "Blogging site",
    }
    // const {searchTerm} = req.body;

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, '');
    // console.log(searchTerm);

    const data = await Post.find({
      $or : [
        {title : {$regex: new RegExp(searchNoSpecialChar, "i")}},
        {body : {$regex: new RegExp(searchNoSpecialChar, "i")}}
      ]
    });


    res.render("search.ejs",{
      data,
      locals
    });
  }
  catch(error){
    console.log(error);
  }
});

module.exports = router;






























// function insertPostData(){
//   Post.insertMany([
//     {
//       title : "Building a Blogsite",
//       body : "This is a blog post about building a blogsite",
//     },
//     {
//       title : "Using EJS with Express",
//       body : "This is a blog post about using EJS with Express",
//     },
//     {
//       title : "Using Mongoose with Express",
//       body : "This is a blog post about using Mongoose with Express",
//     },
//     {
//       title : "Building a Blogsite",
//       body : "This is a blog post about building",
//     }
//   ])
// }

// insertPostData();