


const express   = require('express');
const app       = express();
const dbblockinterface = require("./dbblockInterface.js");

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
    app.post("/blockuser", async(req, res)=>{

        //default response data
        let responseData = {"status":400};

        try {
            let blockinfo      = req.body;
            responseData    = await dbblockinterface.blockuser(blockinfo);
        } catch (error) {
            //default response data
            responseData = {"status":400};
        }
        responseData["state"] = true;
        res.send(responseData);
    });

        //api which updates unblock user information 
        app.post("/unblockuser", async(req, res)=>{

            //default response data
            let responseData = {"status":400};
    
            try {
                let unblockinfo      = req.body;
                responseData    = await dbblockinterface.unblockuser(unblockinfo);
            } catch (error) {
                //default response data
                responseData = {"status":400};
            }
            responseData["state"] = false;
            res.send(responseData);
        });
    
        app.get("/getBlockUserlist", async(req, res)=>{
            //default response data
            let responseData = {"status":400};
            try {
                let blockuserinfo = req.query;
                responseData      = await dbblockinterface.getBlockUserlist(blockuserinfo);
            } catch (error) {
                //default response data
                responseData = {"status":400, "result": []};
            }
            res.send(responseData);
        });
    

    module.exports = app;