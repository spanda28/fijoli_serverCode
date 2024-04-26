

const express   = require('express');
const app       = express();
const dbinterface = require('./../dbComments/dbcommentsCURDOperations.js');

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
    app.post('/addpostcomment', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let postreviewinfo  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.addpostcomment(postreviewinfo);
        } catch (error) {
            responseData = {"status": 400};
        }
        res.send(responseData);
    })

    ///<summary>
    // add post comments into db
    ///</summary>
    app.post('/addReplypostcomment', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let postreviewinfo  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.addReplypostcomment(postreviewinfo);
        } catch (error) {
            responseData = {"status": 400};
        }
        res.send(responseData);
    })

    ///<summary>
    // get post comments for the given post id
    ///</summary>
    app.get("/getPostComments", async(req, res)=>{
        //default response data
        let responseData = {"status":400};
        try {
            let postcategory = req.query;
            responseData      = await dbinterface.getPostComments(postcategory);
        } catch (error) {
            //default response data
            responseData = {"status":400, "result": []};
        }
        res.send(responseData);
    });

    ///<summary>
    // get reply post comments for the given post id
    ///</summary>
    app.get("/getReplyPostComments", async(req, res)=>{
        //default response data
        let responseData = {"status":400};
        try {
            let postids = req.query;
            responseData      = await dbinterface.getReplyPostComments(postids);
        } catch (error) {
            //default response data
            responseData = {"status":400, "result": []};
        }
        res.send(responseData);
    });

    ///<summary>
    // edit post comments for the given postid
    ///</summary>
    app.post('/editpostcomment', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let editpostcomment  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.editpostcomment(editpostcomment);
        } catch (error) {
            responseData = {"status": 400};
        }
        res.send(responseData);
    })
    
    ///<summary>
    // delete post comments
    ///</summary>
    app.post('/deletepostcomment', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let deletepostcomment  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.deletepostcomment(deletepostcomment);
        } catch (error) {
            responseData = {"status": 400};
        }
        res.send(responseData);
    })

    module.exports = app;
