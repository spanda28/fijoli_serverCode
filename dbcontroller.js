    var Pool = require('pg').Pool

    const pool = new Pool({
        user: 'fijoliadmin',
        host: 'localhost',
        database: 'fijoli',
        password: 'fijoli',
        port: 5432,
    })

    // const pool = new Pool({
    //     user: 'testdb',
    //     host: 'database-3.cloxd0rlgbxq.us-east-1.rds.amazonaws.com',
    //     database: 'test_db1',
    //     password: 'TestDB123',
    //     port: 5432,
    //     ssl:false
    // })

    // pool.connect().then(client => {
    //     client.query('select $1::text as name', ['pg-pool']).then(res => {
    //       client.release()
    //       console.log('hello from', res.rows[0].name)
    //     })
    //     .catch(e => {
    //       client.release()
    //       console.error('query error', e.message, e.stack)
    //     })
    //   })

    const config = {
        user:'testdb',
        password:'TestDB123',
        host: 'database-3.cloxd0rlgbxq.us-east-1.rds.amazonaws.com',
        port: '5432',
        database: 'test_db1',
        ssl: {
          rejectUnauthorized: false,
        }
      };
      
    //   const pool = new Pool(config);
      pool.connect().then(client => {
          console.log(client)
      }).catch(error=>{
          console.log(error)
      })
      
    //   pool.query('select * from public.md_user_table').then(res => {
              
    //       console.log('hello from', res.rows[0].name)
    //   });
    ///<summary>
    // returns select statement result
    ///</summary>
    async function Select(fetchQuery){
        //executes query to get list of sys configuration
        return new Promise((resolve, reject)=>{
            pool.query(fetchQuery, (err, result) =>{
                if(err){
                    return reject({"status": 400})
                }
                // if(undefined === result){
                //     result["rows"] = [];
                // }
                return resolve({"status": 200, "result" : result.rows});
            });
        });
    }

    ///<summary>
    // returns insert statement result
    ///</summary>
    async function Insert(insertQuery){
        //post the user info into user info table
        return new Promise((resolve, reject)=>{
                pool.query(insertQuery,(err, result) =>{
                    if(err){
                        reject({"status": 400});
                    }else{
                        resolve({"status": 200});
                    }
                });
            });
    }

    ///<summary>
    // returns update statement result
    ///</summary>
    async function Update(updateQuery){
        return new Promise((resolve, reject)=>{
            pool.query(updateQuery,(err, result) =>{
                if(err){
                    reject({"status": 400});
                }else{
                    resolve({"status": 200});
                }
            });
        });
    }

    ///<summary>
    // returns delete statement result
    ///</summary>
    async function Delete(insertQuery){

    }

module.exports = {Insert, Select, Update, Delete}