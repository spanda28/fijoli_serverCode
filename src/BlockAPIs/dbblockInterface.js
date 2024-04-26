

const { el } = require('date-fns/locale');
const db    = require('./../../dbcontroller.js');

    ///<summary>
    // returns reviews data
    ///</summary>
    async function blockuser(blockinfo) {
        
        let unblockresult    = {"status": 400};
        const isUserblocked = await isUserBlockExists(blockinfo);
        if(!isUserblocked){
            const insertQuery = "INSERT INTO public.md_block_users(logged_in_user_id, blocked_user_id, is_active, created_date, updated_date)VALUES (" + blockinfo.logged_in_user_id + "," + blockinfo.blocked_user_id+",1, current_date, current_timestamp)";
            unblockresult = await db.Insert(insertQuery);
            if(200 != unblockresult.status){
                throw "failed insert query";
            }
        }else{
            unblockresult = await setBlockState(blockinfo);
        }
        
        return(unblockresult);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function unblockuser(unblockinfo) {

        const updateQuery = "UPDATE public.md_block_users SET is_active=0, created_date=current_date, updated_date=current_timestamp WHERE logged_in_user_id= "+ unblockinfo.logged_in_user_id + " and blocked_user_id= " + unblockinfo.blocked_user_id;
        const updateresult = await db.Update(updateQuery);
        if(200 != updateresult.status){
            throw "failed insert query";
        }
        return(unblockinfo);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function setBlockState(unblockinfo) {

        const updateQuery = "UPDATE public.md_block_users SET is_active=1, created_date=current_date, updated_date=current_timestamp WHERE logged_in_user_id= "+ unblockinfo.logged_in_user_id + " and blocked_user_id= " + unblockinfo.blocked_user_id;
        const updateresult = await db.Update(updateQuery);
        if(200 != updateresult.status){
            throw "failed insert query";
        }
        return(updateresult);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function getBlockUserlist(blockuserinfo) {

        const selectQuery = "select u.user_name, u.user_id, bu.logged_in_user_id from public.md_user_table u join public.md_block_users bu on u.user_id = bu.blocked_user_id and bu.is_active = 1 and bu.logged_in_user_id =" + blockuserinfo.logged_in_user_id
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
            // selectresult["result"] = [];
        }
        return(selectresult);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function isUserBlockExists(bui) {

        const selectQuery = "select count(*) as count from public.md_block_users where blocked_user_id = " +bui.blocked_user_id + " and logged_in_user_id = " + bui.logged_in_user_id;
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
            // selectresult["result"] = [];
        }
        return((parseInt(selectresult.result[0].count) === 1));
    } 

    module.exports = {blockuser, unblockuser, getBlockUserlist}