

const express   = require('express');
const app       = express();
const dbinterface = require("./../dbInterface/dbPostInterface.js");

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
    app.post('/posthide', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let posthideData  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.posthide(posthideData);
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    })
    
    ///<summary>
    // add post comments into db
    ///</summary>
    app.post('/postreportcomment', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            let postreportcomment  = JSON.parse(JSON.stringify(req.body));
            responseData  = await dbinterface.postreportcomment(postreportcomment);
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    })

    ///<summary>
    //
    ///</summary>
    app.get("/getlstPostcategory", async(req, res)=>{

        //default response data
        let responseData = {"status":400};
        try {
            let user = req.query;
            responseData      = await dbinterface.getlstPostcategory(user);
        } catch (error) {
            //default response data
            responseData = {"status":400};
        }

        res.send(responseData);
    });


    module.exports = app;