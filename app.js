/*
 * Copyright 2020 (c), fijoli CORPORATION.
 * All rights are reserved. Reproduction or transmission in whole or in part,
 * in any form or by any means, electronic, mechanical or otherwise,
 * is prohibited without the prior written consent of the copyright owner.
 * Author(s):
 * File Name: app.js
 * Description: This function is help for keep common code block
 * Date Created : 
 */

//import required modules
var createError = require("http-errors");
var path = require("path");
var app = require("express")();
var express = require("express");

//index all apis
var dbindex = require("./index.js");

//block user apis object
var dbblock = require("./src/BlockAPIs/blockIndex.js");

//post comments api object
var postcmts = require("./src/PostComments/CommentsAPIs/PostCommentsAPIs.js");

// post likes/unlikes apis object
var pluApis = require("./src/PostLikeUnlikeAPIs/PostLikesDislikesAPIs/postLikesUnlikesAPIs.js");

//post comment likes/dislikes apis object
var pcluApis = require("./src/PostComments/LikesDislikesAPIs/postCommentsLikesDislikesAPIs.js");

//post follow apis object
var pfApis   = require("./src/PostFollow/ApIs/PostFollowAPIs.js");

//postApis object
var pApis    = require("./src/Posts/APIs/PostAPIs.js");

//search apis object
var spApis   = require("./src/SearchPosts/APIs/searchPostsAPIs.js");

//users 
var users    = require("./src/Users/APIs/usersAPIs.js");

app.use(express.json({ limit: "10mb" }));
app.use("/", dbblock);
app.use("/", dbindex);
app.use("/", pluApis);
app.use("/", pcluApis);
app.use("/", postcmts);
app.use("/", pfApis);
app.use("/", pApis);
app.use("/", spApis);
app.use("/", users);

app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', function(req, res) {
    res.render('index.html');
});

// const allowedOrigins = ["http://localhost:3000"];
const allowedOrigins = ["http://localhost:3000","https://9a4d-182-72-144-36.ngrok-free.app"];
app.use(express.json());

    app.use(function (req, res, next) {

        if (allowedOrigins.includes(req.headers.origin)) {
            res.header("Access-Control-Allow-Origin", req.headers.origin);
        }
        res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
        );
        next();
    });

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   // utilLogger.Write(
//   //   "==>app.js - app use function for next error api is invoked"
//   // );
//   next(createError(404));
// });


app.listen(3030, () => {
  console.log("listening on port 3030");
});
// console.log("application listening on port : 3030");
//utilLogger.Write("==> app.js - app started listening to 8080");

module.exports = app;
