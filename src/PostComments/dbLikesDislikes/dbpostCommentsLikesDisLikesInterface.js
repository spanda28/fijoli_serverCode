

const db                    = require('./../../../dbcontroller.js');
const likesDislikesCtrl     = require('./../../PostLikeUnlikeAPIs/likesDislikesController.js');

    ///<summary>
    // returns reviews data
    ///</summary>
    async function postcommentsldinfo(postData) {

        let postresult    = {"status" : 400};
        const postdbres     = await getpostcommentsldState(postData);
        if(0 === postdbres.result.length){
            postresult = await insertpostcommentsldinfo(postData);
            postData["is_active"] = 1
        }else{
            postData = likesDislikesCtrl.getPostData(postData, postdbres.result[0]);
            postresult = await updatepostcommentsldinfo(postData);
        }
        return postData;
    }   
    
    ///<summary>
    // returns reviews data
    ///</summary>
    async function getpostcommentsldState(plu) {

        const selectQuery = "select post_id, user_id, comment_id, reaction, is_active from public.md_post_comments_likes_dislikes where post_id = "+ plu.post_id +" and user_id = " + plu.user_id +" and comment_id = " + plu.comment_id;
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
        }
        return(selectresult);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function insertpostcommentsldinfo(plud) {

        const insertQuery   = "INSERT INTO public.md_post_comments_likes_dislikes(post_id, user_id, comment_id, reaction, is_active, created_date, updated_date) VALUES (" + plud.post_id+ "," + plud.user_id + "," + plud.comment_id + "," + plud.reaction +", 1, current_date, current_timestamp)";
        const insertResult  = await db.Insert(insertQuery);
        if(200 != insertResult.status){
            throw "failed insert query";
        }
        plud["status"] = insertResult.status;
        plud["is_active"] = 1;
        return(plud);
    } 

    ///<summary>
    // returns reviews data
    ///</summary>
    async function updatepostcommentsldinfo(plud) {

        const updateQuery = "UPDATE public.md_post_comments_likes_dislikes SET reaction = " + plud.reaction + ", is_active = " + plud.is_active +", created_date=current_date, updated_date=current_timestamp WHERE post_id= "+ plud.post_id +" and user_id=" + plud.user_id +" and comment_id =" + plud.comment_id;
        let updateResult = await db.Update(updateQuery);
        if(200 != updateResult.status){
            throw "failed insert query";
        }
        plud["status"] = updateResult["status"];
        return(plud);
    } 


    async function getpostcommentikesANDdislikesCount(ids) {

        const likesCountQuery = "select count(*) likesCount from public.md_post_comments_likes_dislikes where is_active = 1 and reaction = 1 and comment_id =" + ids.comment_id;
        const likesCountResult = await db.Select(likesCountQuery);
        if(200 != likesCountResult.status){
            throw "failed insert query";
        }
        const dislikesCountQuery = "select count(*) dislikesCount from public.md_post_comments_likes_dislikes where is_active = 1 and reaction = 0 and comment_id =" + ids.comment_id;
        const dislikesCountResult = await db.Select(dislikesCountQuery);
        if(200 != dislikesCountResult.status){
            throw "failed insert query";
        }
        
        return {
            "comment_id"     : ids.comment_id,
            "likes_count" : likesCountResult.result[0].likescount,
            "dislikes_count" : dislikesCountResult.result[0].dislikescount
        }
    }

    module.exports = {postcommentsldinfo, getpostcommentikesANDdislikesCount}