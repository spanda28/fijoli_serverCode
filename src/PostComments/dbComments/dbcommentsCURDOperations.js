
const db    = require('./../../../dbcontroller.js');

    ///<summary>
    // add new post comments into db ==> md_post_comments
    ///</summary>
    async function addpostcomment(pc){
        const insertQuery = "INSERT INTO public.md_post_comments(reply_id, post_id, post_user_id, comment_user_id, comment_desc, is_active, likes_count, dislikes_count, created_date, updated_date)VALUES (" + pc.reply_id +"," + pc.post_id +"," + pc.post_user_id + "," + pc.comment_user_id+",'" +pc.comment_desc +"',1,0,0,current_date, current_timestamp)";
        const insertresult = await db.Insert(insertQuery);
        if(200 != insertresult.status){
            throw "failed insert query";
        }
        let addedPostComments = await getNewlyAddedPostComments(pc);
        return (addedPostComments);
    }
    
    ///<summary>
    // add new post comments into db ==> md_post_comments
    ///</summary>
    async function addReplypostcomment(pc){
        const insertQuery = "INSERT INTO public.md_post_comments(reply_id, post_id, post_user_id, comment_user_id, comment_desc, is_active, likes_count, dislikes_count, created_date, updated_date)VALUES (" + pc.reply_id +"," + pc.post_id +"," + pc.post_user_id + "," + pc.logged_in_user_id+",'" +pc.comment_desc +"',1,0,0,current_date, current_timestamp)";
        const insertresult = await db.Insert(insertQuery);
        if(200 != insertresult.status){
            throw "failed insert query";
        }

        let addedreplyPostComments = await getNewlyAddedReplyPostComments(pc);
        return (addedreplyPostComments);
    }

    async function getNewlyAddedReplyPostComments(pc){
        const selectQuery = "select public.get_newly_post_comments_details(" + pc.post_id + ", " + pc.id + ", " + pc.comment_user_id +")"
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
        }

        if(null !== selectresult.result[0].get_newly_post_comments_details){

            for (let index = 0; index < selectresult.result[0].get_newly_post_comments_details.length; index++) {

                const pcd = selectresult.result[0].get_newly_post_comments_details[index];
                pcd["logged_in_user_id"] = parseInt(pc.logged_in_user_id);
                pcd["main_post_id"]      = parseInt(pc.main_post_id);
                const pcldQuery = "select post_id, comment_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_comments_likes_dislikes where post_id = "+ pcd.post_id +" and comment_id = "+ pcd.id +" and is_active = 1 group by post_id, comment_id";
                const pcldresult = await db.Select(pcldQuery);
                if(200 != pcldresult.status){
                    throw "failed insert query";
                }
                try {
                    pcd["likes_count"] = 0;
                    pcd["dislikes_count"] = 0;
                    if(0 < pcldresult.result.length){
                        pcd["likes_count"] = pcldresult.result[0].like_count;
                        pcd["dislikes_count"] = pcldresult.result[0].dislike_count;
                    }
                } catch (error) {
                    throw "failed insert query";
                }

                const pclsQuery = "select is_active, reaction from public.md_post_comments_likes_dislikes where post_id = " + pcd.post_id + " and user_id = " + pc.comment_user_id +" and comment_id = "+ pcd.id;
                const pclsResult = await db.Select(pclsQuery);
                if(200 != pclsResult.status){
                    throw "failed insert query";
                }
                pcd["reaction"]    = 0;
                pcd["is_active"]   = 0;
                if(0 < pclsResult.result.length){
                    pcd["reaction"]    = pclsResult.result[0].reaction;
                    pcd["is_active"]   = pclsResult.result[0].is_active;
                }
            }
        }

        let comments = {};
        if(null !== selectresult.result[0].get_newly_post_comments_details){
            selectresult.result[0].get_newly_post_comments_details.map((item, index)=>{
                comments = {...comments, ...{[item.id]: item}}
            });
        }

        return {"post_id" : pc.post_id, "comment_id": pc.main_post_id, "comments" : comments};
    }

    ///<summary>
    // returns last post comment 
    ///</summary>
    async function getNewlyAddedPostComments(pc){

        const selectQuery = "select public.get_newly_post_comments_summary(" + pc.post_id+ "," + pc.comment_user_id+ ")";
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
            // selectresult["result"] = [];
        }

        if(null !== selectresult.result[0].get_newly_post_comments_summary){
            for (let index = 0; index < selectresult.result[0].get_newly_post_comments_summary.length; index++) {

                const pcs = selectresult.result[0].get_newly_post_comments_summary[index];
                pcs["logged_in_user_id"] = parseInt(pc.comment_user_id);
                const pcldQuery = "select post_id, comment_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_comments_likes_dislikes where post_id = "+ pcs.post_id +" and comment_id = "+ pcs.root_reply_id +" and is_active = 1 group by post_id, comment_id";
                const pcldresult = await db.Select(pcldQuery);
                if(200 != pcldresult.status){
                    throw "failed insert query";
                }
                try {
                    pcs["likes_count"] = 0;
                    pcs["dislikes_count"] = 0;
                    if(0 < pcldresult.result.length){
                        pcs["likes_count"] = pcldresult.result[0].like_count;
                        pcs["dislikes_count"] = pcldresult.result[0].dislike_count;
                    }
                } catch (error) {
                    console.log(error);
                }

                const pclsQuery = "select is_active, reaction from public.md_post_comments_likes_dislikes where post_id = " + pcs.post_id + " and user_id = " + pc.comment_user_id +" and comment_id = "+ pcs.root_reply_id;
                const pclsResult = await db.Select(pclsQuery);
                if(200 != pclsResult.status){
                    throw "failed insert query";
                }
                pcs["reaction"]    = 0;
                pcs["is_active"]   = 0;
                if(0 < pclsResult.result.length){
                    pcs["reaction"]    = pclsResult.result[0].reaction;
                    pcs["is_active"]   = pclsResult.result[0].is_active;
                }
            }
        }

        let comments = {};
        if(null !== selectresult.result[0].get_newly_post_comments_summary){
            selectresult.result[0].get_newly_post_comments_summary.map((item, index)=>{
                comments = {...comments, ...{[item.root_reply_id]: item}}
            });
        }

        return {"post_id" : pc.post_id, "comments" : comments};
    }
    
    ///<summary>
    // returns main post comments
    ///</summary>
    async function getPostComments(postIds) {

        const selectQuery = "select public.get_post_comments_summary(" + postIds.post_id+ ")";
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
            // selectresult["result"] = [];
        }

        if(null !== selectresult.result[0].get_post_comments_summary){
            for (let index = 0; index < selectresult.result[0].get_post_comments_summary.length; index++) {

                const pcs = selectresult.result[0].get_post_comments_summary[index];
                pcs["logged_in_user_id"] = parseInt(postIds.user_id);
                const pcldQuery = "select post_id, comment_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_comments_likes_dislikes where post_id = "+ pcs.post_id +" and comment_id = "+ pcs.root_reply_id +" and is_active = 1 group by post_id, comment_id";
                const pcldresult = await db.Select(pcldQuery);
                if(200 != pcldresult.status){
                    throw "failed insert query";
                }
                try {
                    pcs["likes_count"] = 0;
                    pcs["dislikes_count"] = 0;
                    if(0 < pcldresult.result.length){
                        pcs["likes_count"] = pcldresult.result[0].like_count;
                        pcs["dislikes_count"] = pcldresult.result[0].dislike_count;
                    }
                } catch (error) {
                    console.log(error);
                }

                const pclsQuery = "select is_active, reaction from public.md_post_comments_likes_dislikes where post_id = " + pcs.post_id + " and user_id = " + postIds.user_id +" and comment_id = "+ pcs.root_reply_id;
                const pclsResult = await db.Select(pclsQuery);
                if(200 != pclsResult.status){
                    throw "failed insert query";
                }
                pcs["reaction"]    = 0;
                pcs["is_active"]   = 0;
                if(0 < pclsResult.result.length){
                    pcs["reaction"]    = pclsResult.result[0].reaction;
                    pcs["is_active"]   = pclsResult.result[0].is_active;
                }
            }
        }

        let comments = {};
        if(null !== selectresult.result[0].get_post_comments_summary){
            selectresult.result[0].get_post_comments_summary.map((item, index)=>{
                comments = {...comments, ...{[item.root_reply_id]: item}}
            });
        }

        return {"post_id" : postIds.post_id, "post_category": postIds.post_category, "comments" : comments};
    } 

    async function getdbReplyPostComments(replyids){

        const selectQuery = "select public.get_post_comments_details(" + replyids.post_id + "," + replyids.id + ")";
        const selectresult = await db.Select(selectQuery);
        if(200 != selectresult.status){
            throw "failed insert query";
            // selectresult["result"] = [];
        }

        return selectresult;
    }

    ///<summary>
    // returns reply post comments
    ///</summary>
    async function getReplyPostComments(replyids) {
        
        let selectresult = await getdbReplyPostComments(replyids);
        
        if(null !== selectresult.result[0].get_post_comments_details){

            for (let index = 0; index < selectresult.result[0].get_post_comments_details.length; index++) {

                const pcd = selectresult.result[0].get_post_comments_details[index];
                pcd["logged_in_user_id"] = parseInt(replyids.user_id);
                pcd["main_post_id"]      = parseInt(replyids.id);
                const pcldQuery = "select post_id, comment_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_comments_likes_dislikes where post_id = "+ pcd.post_id +" and comment_id = "+ pcd.id +" and is_active = 1 group by post_id, comment_id";
                const pcldresult = await db.Select(pcldQuery);
                if(200 != pcldresult.status){
                    throw "failed insert query";
                }
                try {
                    pcd["likes_count"] = 0;
                    pcd["dislikes_count"] = 0;
                    if(0 < pcldresult.result.length){
                        pcd["likes_count"] = pcldresult.result[0].like_count;
                        pcd["dislikes_count"] = pcldresult.result[0].dislike_count;
                    }
                } catch (error) {
                    throw "failed insert query";
                }

                const pclsQuery = "select is_active, reaction from public.md_post_comments_likes_dislikes where post_id = " + pcd.post_id + " and user_id = " + replyids.user_id +" and comment_id = "+ pcd.id;
                const pclsResult = await db.Select(pclsQuery);
                if(200 != pclsResult.status){
                    throw "failed insert query";
                }
                pcd["reaction"]    = 0;
                pcd["is_active"]   = 0;
                if(0 < pclsResult.result.length){
                    pcd["reaction"]    = pclsResult.result[0].reaction;
                    pcd["is_active"]   = pclsResult.result[0].is_active;
                }
            }
        }
        
        let comments = {};
        try {
            if(null !== selectresult.result[0].get_post_comments_details){
                selectresult.result[0].get_post_comments_details.map((item, index)=>{
                    comments = {...comments, ...{[item.id]: item}}
                });
            }
        } catch (error) {
            console.log(error);
        }

        return {"post_id" : replyids.post_id, "comment_id": replyids.id, "comments" : comments};
    } 

    ///<summary>
    // edits main/reply post comments
    ///</summary>
    async function editpostcomment(pc){
        const UpdateQuery = "update public.md_post_comments set comment_desc = '" + pc.comment_desc+ "' where id = " + pc.id;
        const updateresult = await db.Update(UpdateQuery);
        if(200 != updateresult.status){
            throw "failed insert query";
        }
        return(pc);
    }

    ///<summary>
    // delete post comments
    ///</summary>    
    async function deletepostcomment(pc){
        try {
            
            let subcomments = await getdbReplyPostComments(pc);
            let deleteComments = [];
            deleteComments.push(pc);
            if(null !== subcomments.result[0].get_post_comments_details)
            {
                for (let index = 0; index < subcomments.result[0].get_post_comments_details.length; index++) {
                    deleteComments.push(subcomments.result[0].get_post_comments_details[index]);
                }
            }

            let updateresult = {"status" : 400};
            for (let index = 0; index < deleteComments.length; index++) {
                const UpdateQuery = "update public.md_post_comments set is_active = 0 where id = " + deleteComments[index].id;
                updateresult = await db.Update(UpdateQuery);
                if(200 != updateresult.status){
                    throw "failed insert query";
                }
            }
            return(deleteComments);
        } catch (error) {
            console.log(error);
        }
    }

    module.exports = {addpostcomment,
        getPostComments,getReplyPostComments,
        editpostcomment, deletepostcomment, addReplypostcomment
    }