const express = require("express");
const router = express.Router();
const Post = require("../models/Post.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

const adminLayout = "../views/layouts/admin.ejs";



/*
*  check login --- logout if cookie not found
*/

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message : "Unauthorized"});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.UserId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};







/*
*  GET /admin - Login Page
*/

router.get("/admin", async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            message: "Welcome to the Admin Panel",
        };
        res.render("admin/index.ejs", { locals, layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
});


/*
*  POST /admin - Check Login
*/

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username});
    if(!user){
        return res.status(401).json({message : "Invalid username or password"});
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(401).json({message : "Invalid username or password"});
    }
    const token = jwt.sign({UserId : user._id}, jwtSecret, {expiresIn : "1h"});
    res.cookie("token", token, {httpOnly : true});


    res.redirect("/dashboard");

    // res.render("admin/index.ejs", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


/*
*  GET /admin - dashboard
*/

router.get("/dashboard", authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "Admin",
            message: "Welcome to the Admin Panel",
        };

        const data = await Post.find();
        res.render("admin/dashboard", {locals, data, layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
});



/*
*  GET /admin - Create Post
*/

router.get("/add-post", authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "Add Post",
            message: "Welcome to the Add post",
        };

        const data = await Post.find();
        res.render("admin/add-post", {locals, layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
});



/*
*  POST /admin - Create Post
*/

router.post("/add-post", authMiddleware, async (req, res) => {

    try {

        try {
            const newPost = new Post(
                {
                    title : req.body.title,
                    body : req.body.body
                }
            );
            await Post.create(newPost);
            res.redirect("/dashboard");
        } catch (error) {
            console.log(error);
        }

        res.redirect("/dashboard");


    } catch (error) {
        console.log(error);
    }
});




/*
*  GET /admin - EDIT Post
*/

router.get("/edit-post/:id", authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "Edit Post",
            message: "Welcome to the Edit post",
        };


        const data = await Post.findOne({_id: req.params.id});
        res.render("admin/edit-post", {data, locals, layout : adminLayout});

    } catch (error) {
        console.log(error);
    }
});




/*
*  PUT /admin - Edit Post
*/

router.put("/edit-post/:id", authMiddleware, async (req, res) => {

    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title : req.body.title,
            body : req.body.body,
            updatedAt : Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
});













/*
*  POST /admin - register
*/

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({username, password : hashedPassword});
        res.status(201).json({message : "user created", user});
    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({message : "username already exists"});
        }
        res.status(500).json({message : "Internal Server error"});
    }




    res.redirect("/admin");
    // res.render("admin/index.ejs", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});







/*
*  DELETE /admin - delete Post
*/

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {

    try {
        await Post.deleteOne({_id:req.params.id});
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
});


/*
*  GET /admin - logout
*/

router.get("/logout", async (req, res) => {
    res.clearCookie("token");
    res.redirect("/admin");
});



module.exports = router;