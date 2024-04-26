


const express   = require('express');
const app       = express();

const dbpcldinterface = require("./../dbLikesDislikes/dbpostCommentsLikesDisLikesInterface.js");

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
    app.post("/postCommentsLikesDislikes", async(req, res)=>{

        //default response data
        let responseData = {"status":400};

        try {
            let likedislikeinfo      = req.body;
            responseData    = await dbpcldinterface.postcommentsldinfo(likedislikeinfo);
        } catch (error) {
            //default response data
            responseData = {"status":400};
        }

        res.send(responseData);
    });


    
    //api which updates block user information 
    app.get("/getpostcommentslikeDislikeCount", async(req, res)=>{

        //default response data
        let responseData = {"status":400};

        try {
            const comment     = JSON.parse(JSON.stringify(req.query));
            responseData    = await dbpcldinterface.getpostcommentikesANDdislikesCount(comment);
        } catch (error) {
            //default response data
            responseData = {"status":400};
        }

        res.send(responseData);
    });


    module.exports = app;