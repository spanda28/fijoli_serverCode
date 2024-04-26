
const db                    = require('../../../dbcontroller.js');
const likesDislikesCtrl     = require("../likesDislikesController.js");

const dbcommoninterface     = require("./../../../dbInterface.js");

    ///<summary>
    // returns reviews data
    ///</summary>
    async function postlikesDislikesinfo(postData) {

        let postresult    = {"status" : 400};
        const postdbres     = await getpostlikesDislikesState(postData);
        if(0 === postdbres.result.length){
            postresult = await insertpostlikesDislikesinfo(postData);
            postData["is_active"] = 1;
        }else{
            postData = likesDislikesCtrl.getPostData(postData, postdbres.result[0]);
            postresult = await updatepostlikesDislikesinfo(postData);
        }

        postresult["post_id"] = postData["post_id"];
        postresult["is_active"] = postData["is_active"];
        postresult["reaction"]  = postData["reaction"];
        postresult["post_category"] = postData["post_category"];
        return postresult;
        //need to change the query in future to get particular post item
        // let lstofposts  =  await dbcommoninterface.getlstPosts({"user_id": postData.user_id});
        // let post = lstofposts[postData.post_id];
        // return {[post.id] : post};
    }   

    async function getpostlikesANDdislikesCount(ids) {
        const likesCountQuery = "select count(*) likesCount from public.md_post_likes_dislikes where is_active = 1 and reaction = 1 and post_id =" + ids.post_id;
        const likesCountResult = await db.Select(likesCountQuery);
        if(200 != likesCountResult.status){
            throw "failed insert query";
        }
        const dislikesCountQuery = "select count(*) dislikesCount from public.md_post_likes_dislikes where is_active = 1 and reaction = 0 and post_id =" + ids.post_id;
        const dislikesCountResult = await db.Select(dislikesCountQuery);
        if(200 != dislikesCountResult.status){
            throw "failed insert query";
        }
        
        return {
            "post_id"     : ids.post_id,
            "likes_count" : likesCountResult.result[0].likescount,
            "dislikes_count" : dislikesCountResult.result[0].dislikescount
        }
    }
    
    ///<summary>
    // returns reviews data
    ///</summary>
    async function getpostlikesDislikesState(plu) {

        const selectQuery = "select post_id, user_id, reaction, is_active from public.md_post_likes_dislikes where post_id = "+ plu.post_id +" and user_id = " + plu.user_id;
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
        }
        return(selectresult);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function insertpostlikesDislikesinfo(plud) {

        const insertQuery   = "INSERT INTO public.md_post_likes_dislikes(post_id, user_id, reaction, is_active, created_date, updated_date) VALUES (" + plud.post_id+ "," + plud.user_id + "," + plud.reaction +", 1, current_date, current_timestamp)";
        const insertResult  = await db.Insert(insertQuery);
        if(200 != insertResult.status){
            throw "failed insert query";
        }
        return(insertResult);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function updatepostlikesDislikesinfo(plud) {

        const updateQuery = "UPDATE public.md_post_likes_dislikes SET reaction = " + plud.reaction + ", is_active = " + plud.is_active +", created_date=current_date, updated_date=current_timestamp WHERE post_id= "+ plud.post_id +" and user_id=" + plud.user_id;
        const updateResult = await db.Update(updateQuery);
        if(200 != updateResult.status){
            throw "failed insert query";
        }
        return(updateResult);
    } 

    module.exports = {postlikesDislikesinfo, getpostlikesANDdislikesCount}