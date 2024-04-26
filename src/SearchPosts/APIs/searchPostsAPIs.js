


const express   = require('express');
const app       = express();
const dbspinterface = require("./../dbSearchPosts/dbSearchPostsInterface.js");

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
    app.get("/getsearchposts", async(req, res)=>{

        //default response data
        let searchpostData = {"status":400};

        try {
            let searchpost      = req.query;
            searchpostData    = await dbspinterface.getsearchposts(searchpost);
        } catch (error) {
            //default response data
            searchpostData = {"status":400, "errormsg": error};
        }

        res.send(searchpostData);
    });

    
    app.get("/getsearchpostitem", async(req, res)=>{

        //default response data
        let searchpostData = {"status":400};

        try {
            let searchpost      = req.query;
            searchpostData    = await dbspinterface.getsearchpostitem(searchpost);
        } catch (error) {
            //default response data
            searchpostData = {"status":400, "errormsg": error};
        }
        searchpostData["status"] = 200;
        res.send(searchpostData);
    });

    module.exports = app;