

const db    = require('./../../../dbcontroller.js');

    ///<summary>
    // posts follow info
    ///</summary>
    async function postFollow(ur){

        //default result
        let postresult = {"status": 400};

        //check whether the follow info is already exists or not
        let isExists = await isfollowExists(ur);

        //if not exists insert the follow info into db
        //else update the follow info in db
        if(!isExists){
            postresult = await insertFollow(ur);
        }else{
            postresult = await updateFollow(ur);
        }

        //get followers / following and follower state
        let isfollowerState       = await isfollower({"user_id":ur.user_id,"follower_id":ur.follower_id})
        //get follow / following data for logged in user
        let logged_in_user_follow = await getfollowerfollowingData({"user_id": ur.follower_id});
        //get follow / following data for other user
        let other_user_follow     = await getfollowerfollowingData({"user_id": ur.user_id});

        //returns follow/following/isfollower info of 
        //loggedin user & other user
        return {
                "status":200, 
                "isfollower": isfollowerState, 
                "logged_in_user_followData": logged_in_user_follow,
                "other_user_follow": other_user_follow
        };
    }

    ///<summary>
    // api which inserts the follow into db
    ///</summary>
    async function insertFollow(ur){

        const insertQuery = "INSERT INTO public.md_user_relation(user_id, follower_id, is_active, created_date, updated_date)VALUES (" + ur.user_id +"," + ur.follower_id +",1,current_date, current_timestamp)";
        const insertresult = await db.Insert(insertQuery);
        if(200 != insertresult.status){
            throw "failed insert query";
        }
        return insertresult;
    }

    ///<summary>
    // api which checks where the follow info is posted or not
    ///</summary>
    async function isfollowExists(ur){
        const selectQuery = "select count(*) count from public.md_user_relation where user_id=" + ur.user_id +" and follower_id ="+ur.follower_id;
        const selectResult = await db.Select(selectQuery);
        if(200 != selectResult.status){
            throw "failed insert query";
        }
        return (0 < parseInt(selectResult.result[0].count));
    }

    ///<summary>
    // return follower/following count for the given user
    ///</summary>
    async function getfollowerfollowingData(ur){

        //get followers count info
        let followerresult  = await getfollowersCount(ur);
        //gets following count info
        let followingresult = await getfollowingCount(ur);

        //returns followers/following info
        return {
            "status"         : 200,
            "follower_count" : followerresult.result[0].followers,
            "following_count" : followingresult.result[0].followings
        }
    }

    async function getfollowersCount(ur){
        const followersQuery = "select count(*) followers from public.md_user_relation where is_active = 1 and user_id = "+ ur.user_id;        
        const followerresult = await db.Select(followersQuery);
        if(200 != followerresult.status){
            throw "failed insert query";
        }

        return followerresult;
    }

    async function getfollowingCount(ur){
        const followingQuery = "select count(*) followings from public.md_user_relation where is_active = 1 and follower_id = "+ ur.user_id;        
        const followingresult = await db.Select(followingQuery);
        if(200 != followingresult.status){
            throw "failed insert query";
        }

        return followingresult;
    }

    async function isfollower(fu){

        const followersQuery = "select count(*) count from public.md_user_relation where is_active = 1 and user_id = " + fu.user_id + " and follower_id = " + parseInt(fu.follower_id);        
        const followerresult = await db.Select(followersQuery);
        if(200 != followerresult.status){
            throw "failed insert query";
        }

        return(0 < parseInt(followerresult.result[0].count));
    }

    ///<summary>
    // add new post comments into db
    ///</summary>
    async function updateFollow(ur){

        const updateQuery = "update public.md_user_relation set created_date = current_date, updated_date = current_timestamp, is_active = "+ ur.is_active +" where user_id = "+ ur.user_id +" and follower_id = "+ ur.follower_id;
        const updateresult = await db.Update(updateQuery);
        if(200 != updateresult.status){
            throw "failed insert query";
        }
        return updateresult;
    }

    ///<summary>
    // return follower list
    ///</summary>
    async function getfollowerslist(ur){

        const followerlstQuery  = "select user_id, user_name, whatsapp_number from public.md_user_table where user_id in (select follower_id from public.md_user_relation where is_active = 1 and user_id = " + ur.user_id + ")";
        const followerlstResult = await db.Select(followerlstQuery);
        if(200 != followerlstResult.status){
            throw "failed insert query";
        }
        return followerlstResult;
    }

    ///<summary>
    // return follower list
    ///</summary>
    async function getfollowingslist(ur){

        const followinglstQuery  = "select user_id, user_name, whatsapp_number from public.md_user_table where user_id in (select user_id from public.md_user_relation where is_active = 1 and follower_id = " + ur.follower_id + ")";
        const followinglstResult = await db.Select(followinglstQuery);
        if(200 != followinglstResult.status){
            throw "failed insert query";
        }
        return followinglstResult;
    }

    module.exports = { postFollow, getfollowerfollowingData, 
            isfollower, getfollowerslist, getfollowingslist }