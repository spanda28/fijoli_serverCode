const db    = require("./../../../dbcontroller.js");

async function getlstofUsers () {

    const lstofusersQuery = "select user_id, user_name from public.md_user_table";
    const lstofusersResult = await db.Select(lstofusersQuery);
    if(200 !== lstofusersResult.status){
        throw "error occurred while fetching list of users";
    }

    let lstofUsers = {};
    lstofusersResult.result.map(usrinfo => {
        lstofUsers = {...lstofUsers, ...{[usrinfo.user_id]: usrinfo.user_name}};
    })

    return lstofUsers;
}

module.exports = {getlstofUsers}