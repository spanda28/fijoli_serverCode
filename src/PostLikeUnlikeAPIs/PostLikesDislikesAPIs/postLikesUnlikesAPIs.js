


const express   = require('express');
const app       = express();
const dbpostslikesDislikes = require("../dbPostLikesDislikes/dbpostLikesDislikesInterface.js");

const allowedOrigins = ["http://localhost:3000"];
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



    //api which updates block user information 
    app.post("/postlikeDislikeState", async(req, res)=>{

        //default response data
        let responseData = {"status":400};

        try {
            let likeunlikeinfo      = req.body;
            responseData    = await dbpostslikesDislikes.postlikesDislikesinfo(likeunlikeinfo);
        } catch (error) {
            //default response data
            responseData = {"status":400};
        }
        responseData["status"] = 200;
        res.send(responseData);
    });

    //api which updates block user information 
    app.get("/getpostlikeDislikeCount", async(req, res)=>{

        //default response data
        let responseData = {"status":400};

        try {
            const postIDInfo     = JSON.parse(JSON.stringify(req.query));
            responseData    = await dbpostslikesDislikes.getpostlikesANDdislikesCount(postIDInfo);
        } catch (error) {
            //default response data
            responseData = {"status":400};
        }

        res.send(responseData);
    });

    module.exports = app;