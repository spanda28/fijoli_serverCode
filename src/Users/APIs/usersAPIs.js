

const express           = require('express');
const app               = express();
const dbusersinterface  = require('./../dbUsersInterface/dbusersInterface.js');

// const allowedOrigins = ["http://localhost:3000"];
// app.use(express.json());

//     app.use(function (req, res, next) {

//         if (allowedOrigins.includes(req.headers.origin)) {
//             res.header("Access-Control-Allow-Origin", req.headers.origin);
//         }
//         res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept"
//         );
//         next();
//     });


    ///<summary>
    // add post comments into db
    ///</summary>
    app.get('/getlstofUsers', async(req, res) =>{

        let responseData = {"status": 400};
        try {
            responseData  = await dbusersinterface.getlstofUsers();
        } catch (error) {
            responseData = {"status": 400};
        }
        
        res.send(responseData);
    });
    

    module.exports = app;