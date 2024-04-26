

const express   = require('express');
const app       = express();
const dbinterface = require("./../dbInterface/dbPostFollowInterface.js");

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


    ///<summary>
    // add post comments into db
    ///</summary>
    app.post('/postFollow', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let followinfo  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.postFollow(followinfo);
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    })

    
    ///<summary>
    // add post comments into db
    ///</summary>
    app.get('/getfollowcount', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let followinfo  = req.query;
            responseData  = await dbinterface.getfollowerfollowingData(followinfo);
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    })

    ///<summary>
    // returns followers list
    ///</summary>
    app.get('/getfollowerslist', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let userinfo  = req.query;
            responseData  = await dbinterface.getfollowerslist(userinfo);
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    })

    ///<summary>
    // returns following list
    ///</summary>
    app.get('/getfollowingslist', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let followinfo  = req.query;
            responseData  = await dbinterface.getfollowingslist(followinfo);
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    })

    module.exports = app;