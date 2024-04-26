

const db    = require("./../../../dbcontroller");

const dbcommoninterface = require("./../../../dbInterface.js");
const dbfollow          = require("./../../PostFollow/dbInterface/dbPostFollowInterface.js");

    ///<summary>
    // add new post hide into db
    ///</summary>
    async function posthide(hp){

        let postresult = await selectHide(hp);
        if(0 === postresult.result.length){
            postresult = await insertHide(hp);
        }else if(0 < postresult.result.length){
            postresult = await updateHide(hp);
        }

        // let lstofPosts = await dbcommoninterface.getlstPosts({"user_id": hp.user_id});
        return postresult;
    }

    ///<summary>
    // add new post hide into db
    ///</summary>
    async function insertHide(hp){
        const insertQuery = "INSERT INTO public.md_user_hidden_post(user_id, post_id, is_active, created_date, updated_date)VALUES (" + hp.user_id +"," + hp.post_id +",1,current_date, current_timestamp)";
        const insertresult = await db.Insert(insertQuery);
        if(200 != insertresult.status){
            throw "failed insert query";
        }
        return(insertresult);
    }

    ///<summary>
    // add new post hide into db
    ///</summary>
    async function selectHide(hp){
        const selectQuery = "select user_id, post_id, is_active from public.md_user_hidden_post where user_id =" + hp.user_id +" and post_id =" + hp.post_id;
        const selectResult = await db.Select(selectQuery);
        if(200 != selectResult.status){
            throw "failed insert query";
        }
        return(selectResult);
    }
    
    ///<summary>
    // add new post hide into db
    ///</summary>
    async function updateHide(hp){
        const updateQuery = "update public.md_user_hidden_post set is_active = " + hp.is_active + " where user_id = " + hp.user_id + " and post_id =" +hp.post_id;
        const updateResult = await db.Update(updateQuery);
        if(200 != updateResult.status){
            throw "failed insert query";
        }
        return(updateResult);
    }

    ///<summary>
    // add new post hide into db
    ///</summary>
    async function postreportcomment(prc){

        let prcQuery   = "insert into public.md_user_report_post (post_id, reporter_user_id, reason, is_active, created_date, updated_date)values(" + prc.post_id + "," + prc.reporter_user_id + ",'"  + prc.reason + "',1, current_date, current_timestamp)";
        let prcResult  = await db.Insert(prcQuery);
        if(200 !== prcResult.status){
            throw "failed to inset post report comment"
        }
        return prcResult;
    }

    
    ///<summary>
    // add new post hide into db
    ///</summary>
    async function getlstPostcategory(ppc){

        let postctryQuery   = "select id, user_id, user_name, user_category, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id,  ut.user_name, ut.user_category, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count,  up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value  from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id join public.sys_configuration sc  on sc.id = up.post_category where up.is_active = 1 and not exists (select 1 from public.md_user_hidden_post h where ut.user_id = h.user_id and h.is_active = 1 and up.id = h.post_id)) a where rn between 0 and 20 and user_id ="+ ppc.user_id +" and attribute_value = '" + ppc.post_category +"'";
        // let postctryQuery   = "SELECT id,user_id,user_name,user_category,whatsapp_number,post_desc,currency_category,currency,likes_count,dislikes_count,views_count,post_pic_1_path,post_pic_2_path,post_video_1_path,attribute_value AS post_category FROM   (SELECT Dense_rank() OVER( partition BY up.post_category ORDER BY up.updated_date DESC) rn,up.id,ut.user_id,ut.user_name,ut.user_category,ut.whatsapp_number,up.post_desc,up.currency_category,up.currency,up.likes_count,up.dislikes_count,up.views_count,up.post_pic_1_path,up.post_pic_2_path,up.post_video_1_path,sc.attribute_value FROM   PUBLIC.md_user_post up JOIN PUBLIC.md_user_table ut ON up.user_id = ut.user_id JOIN PUBLIC.sys_configuration sc ON sc.id = up.post_category WHERE  up.is_active = 1 AND    sc.category_name = 'Post' AND sc.attribute_value = "+ ppc.post_category +" AND ut.user_id = "+ ppc.user_id+" AND NOT EXISTS (SELECT 1 FROM   PUBLIC.md_user_hidden_post h WHERE  user.user_id = h.user_id AND h.is_active = 1 AND up.id = h.post_id)) xyz WHERE  rn BETWEEN 0 AND 20"

        let postctryResult  = await db.Select(postctryQuery);
        if(200 !== postctryResult.status){
            throw "failed to inset post report comment"
        }

        let lstofposts = {};
        //update likes and dislikes count of each post
        if (undefined !== postctryResult.result){

            for (let index = 0; index < postctryResult.result.length; index++) {
                const element = postctryResult.result[index];
                const likesQuery = "select post_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_likes_dislikes where post_id = " + element.id + " and is_active = 1 group by post_id";
                const likesresults = await db.Select(likesQuery);
                if(0 < likesresults.result.length){
                    postctryResult.result[index].likes_count = parseInt(likesresults.result[0].like_count);
                    postctryResult.result[index].dislikes_count = parseInt(likesresults.result[0].dislike_count);
                }
            }
                    
            //update the user_id and reaction of the post
            for (let index = 0; index < postctryResult.result.length; index++) {
                const element = postctryResult.result[index];
    
                const userlikedQuery = "select reaction from public.md_post_likes_dislikes where is_active = 1 and user_id = " + ppc.logged_in_user_id + " and  post_id = " + element.id;
                const userlikedResult = await db.Select(userlikedQuery);
                if(0 === userlikedResult.result.length){
                    postctryResult.result[index]["reaction"] = 0;
                    postctryResult.result[index]["is_active"] = 0;
                }else if(0 < userlikedResult.result.length){
                    postctryResult.result[index]["reaction"] = userlikedResult.result[0]["reaction"];
                    postctryResult.result[index]["is_active"] = 1;
                }
    
                postctryResult.result[index]["isfollower"] = await dbfollow.isfollower({"user_id": element.user_id,"follower_id": ppc.logged_in_user_id})
                postctryResult.result[index]["logged_in_user_id"] = parseInt(ppc.logged_in_user_id);
                postctryResult.result[index]["isLoggedInUser"]    = (postctryResult.result[index]["user_id"] === parseInt(ppc.logged_in_user_id));
            }
            postctryResult.result.map((item, index)=>{
                lstofposts[item.id] = item;
            });
        }
        
        return {"postItems" : lstofposts, "post_category" : ppc.post_category};
    }

module.exports = {posthide, postreportcomment, getlstPostcategory}