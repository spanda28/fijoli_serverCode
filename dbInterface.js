
    const db    = require('./dbcontroller.js');
    const { post } = require('./index.js');
    const dbfollow = require("./src/PostFollow/dbInterface/dbPostFollowInterface.js");

    ///<summary>
    // returns list of sys configuration
    ///</summary>
    async function getsysconfiguration() {
        //build query to sys configuration from table
        //const fetchQuery = "select * from public.sys_configuration";
        const fetchQuery = "SELECT category_name, json_agg(attribute_value) AS values FROM public.sys_configuration WHERE category_name = 'user_category' and is_active = True GROUP BY category_name  union all SELECT category_name, json_agg(attribute_value) AS values FROM public.sys_configuration WHERE category_name = 'Language' and is_active = True GROUP BY category_name union all  SELECT category_name, json_agg(attribute_value) AS values FROM public.sys_configuration WHERE category_name = 'Currency' and is_active = True GROUP BY category_name union all  SELECT category_name, json_agg(attribute_value) AS values FROM public.sys_configuration WHERE category_name = 'Post' and is_active = True GROUP BY category_name";
        const fetchState     = await db.Select(fetchQuery);
        if(0 === fetchState.result.length){
            throw "login data doesnt exists"
        }
        return(fetchState.result);
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function getProfileData(inputparams) {

        //build query to get the profile data of particular user info
        const fetchQuery    = "select * from public.md_user_table where whatsapp_number = '" + inputparams.whatsapp_number + "'";
        const fetchstate   = await db.Select(fetchQuery);
        if(0 === fetchstate.result.length){
            throw "login data doesnt exists"
        }

        fetchstate.result[0]["isfollower"] = false;
        fetchstate.result[0]["isblocked"]  = false;
        if(Object.keys(inputparams).includes("logged_in_user_id")){
            fetchstate.result[0]["isfollower"] = await dbfollow.isfollower({
                        "user_id": fetchstate.result[0].user_id,
                        "follower_id": inputparams.logged_in_user_id});
        }
        
        const followcount = await dbfollow.getfollowerfollowingData({"user_id": fetchstate.result[0].user_id});
        fetchstate.result[0]["follower_count"] = followcount["follower_count"];
        fetchstate.result[0]["following_count"] = followcount["following_count"];
        
        //get block list
        //build query to get the profile data of particular user info
        if(Object.keys(inputparams).includes("logged_in_user_id")){
            const blockQuery    = "SELECT count(*) count FROM public.md_block_users where is_active = 1 and blocked_user_id = " + fetchstate.result[0].user_id +" and logged_in_user_id = " + inputparams.logged_in_user_id;
            const blockresult   = await db.Select(blockQuery);
            if(0 === blockresult.result.length){
                throw "login data doesnt exists"
            }
            fetchstate.result[0]["isblocked"] = (parseInt(blockresult.result[0].count) === 1);
        }

        if(Object.keys(inputparams).includes("logged_in_user_id")){
            await registervisitor(inputparams.logged_in_user_id, fetchstate.result[0].user_id);
        }

        return(fetchstate.result[0]);
    }  
    
    async function registervisitor(visitorUserId, loggedInUserId){
        const registerQuery = "SELECT count(*) FROM public.md_profile_visits where logged_in_user_id = " + loggedInUserId +" and visitor_user_id = " + visitorUserId;
        const dbresult              = await db.Select(registerQuery);
        if(Number(dbresult.result[0].count) === 0){
            const insertvisitor = "INSERT INTO public.md_profile_visits(logged_in_user_id, visitor_user_id, is_read, visit_time) VALUES ("+ loggedInUserId +", " + visitorUserId +" , 1 ,  current_timestamp)"
            const insertresult  = await db.Insert(insertvisitor);
        }else{
            const updatevisitor = "update public.md_profile_visits set visit_time = current_timestamp  where logged_in_user_id = " + loggedInUserId + " and visitor_user_id = " + visitorUserId;
            const updateresult  = await db.Update(updatevisitor);
        }
    }
    ///<summary>
    // returns profile data
    ///</summary>
    async function registerProfile(signUpData) {

        //build query to insert register info of user
        const insertQuery   = "insert into public.md_user_table(user_email, whatsapp_number, user_name, gender,is_active, whatsapp_user_name, created_date, updated_date) values ('" + signUpData.user_email +"',"+ signUpData.whatsapp_number + ",'" + signUpData.user_name + "', '" + signUpData.gender +"'," + signUpData.is_active +",'" + signUpData.whatsapp_user_name +"', current_Date, current_timestamp)";
        const result        = await db.Insert(insertQuery);
        return(result);
    }   
    
    ///<summary>
    // returns profile data
    ///</summary>
    async function updateProfile(profileData) {

        //build query to insert register info of user
        profileData.encrypted_password   = await encryptpassword(profileData.encrypted_password);
        const updateQuery   = "update public.md_user_table set location = '" + profileData.location + "', dob ='" + profileData.dob +"', user_category=" + profileData.user_category + ", encrypted_password='" + profileData.encrypted_password +"',user_description= '" + profileData.user_description +"',languages_known= '" + profileData.languages_known +"', location_address='" + profileData.location_address +"',studio_name = '" + profileData.studio_name + "', updated_date = current_timestamp  where user_id = " + profileData.user_id;
        const result        = await db.Update(updateQuery);
        return profileData;
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function updatereRegistration(profileData) {

        //build query to insert register info of user
        const updateQuery   = "update public.md_user_table set location = '" + profileData.location + "', dob ='" + profileData.dob +"', user_category=" + profileData.user_category + ", encrypted_password='" + profileData.encrypted_password +"',user_description= '" + profileData.user_description +"',languages_known= '" + profileData.languages_known +"', location_address='" + profileData.location_address +"',studio_name = '" + profileData.studio_name + "', updated_date = current_timestamp  where user_id = " + profileData.user_id;
        const result        = await db.Update(updateQuery);
        return profileData;
    }

    async function deleteReRegistrationInfo(profileData){
        const updateQuery   = "update public.md_user_table set location = '" + profileData.location + "', dob ='" + profileData.dob +"', user_category=" + profileData.user_category + ", encrypted_password='" + profileData.encrypted_password +"',user_description= '" + profileData.user_description +"',languages_known= '" + profileData.languages_known +"', location_address='" + profileData.location_address +"',studio_name = '" + profileData.studio_name + "', updated_date = current_timestamp  where user_id = " + profileData.user_id;
        const result        = await db.Update(updateQuery);
        return profileData;
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function insertpostData(postdata, s3foldernames) {

        //build query to insert register info of user
        const insertQuery   = "insert into public.md_user_post(user_id, post_category, post_desc, currency_category, currency, post_pic_1, post_pic_2, is_active, created_date, updated_date) values ('" + postdata.user_id +"','"+ postdata.post_category + "','" + postdata.post_desc + "','" + postdata.currency_category + "','" + postdata.currency + "','" + s3foldernames[0] + "','',1,current_Date, current_timestamp)";
        const result        = await db.Insert(insertQuery);
        return(result);
    }   

    //returns category list
    async function getcategorylist(categorytype){
        //query to get list of attribute values based on category type
        const regselectfldrQuery    = "SELECT category_name, json_agg(attribute_value) AS values FROM public.sys_configuration WHERE category_name = '" + categorytype + "' and is_active = True GROUP BY category_name";
        //execute query to fetch list of attribute values
        const dbresult              = await db.Select(regselectfldrQuery);
        //throw an error if fails to fetch list of attribute values
        if(200 != dbresult.status){
            throw "failed to execute query";
        }
        return dbresult.result[0].values; //if success return list of attribute values
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function getuploadfolderlstinfo(regfoldersinfo){
        //set default response
        const result        = {"status":400,"folderlst":{}};

        //get lst of folders type from table
        let lstoffolders    = await getcategorylist("registration_type") ;
        //initialize upload folder type list 
        Object.keys(regfoldersinfo).map((item)=>{
            if(lstoffolders.includes(item))
                result.folderlst[item] = "document";
            else
                result.folderlst[item] = item;
        })

        //update result info
        if(0 === Object.keys(result.folderlst).length)
            throw "failed to create folder info"

        return result; //return result 
    }
  
    ///<summary>
    // returns status of store file info
    ///</summary>
    async function storepostfileinfo(postinfo, s3lstoffoldernames, s3lstoffilenames){

        //initialize default values
        let ctgryfilecount     = 0;
        let currentfileindex   = 0;
        let keyindex           = 1;
        //get lst of folders to store in database
        const lstoffoldernames = Object.keys(postinfo.uploadfolderInfo);

        //loop each folder to store in database
        for (let index = 0; index < lstoffoldernames.length; index++) {
            keyindex = 1;   //set default index
            //get no.of files count based on category 
            ctgryfilecount = ctgryfilecount + postinfo.uploadfolderInfo[lstoffoldernames[index]];
            //loop inserts file info based on category
            for (let fileindex = currentfileindex; fileindex < ctgryfilecount; fileindex++) {
                let keyItem = lstoffoldernames[index] + "_" + (keyindex++) + "_path";
                postinfo[keyItem] = s3lstoffoldernames[lstoffoldernames[index]] + s3lstoffilenames[fileindex];
            }
            //initialize next index based on category
            currentfileindex = currentfileindex + ctgryfilecount;
        }

        //get category details
        let post_category_id =  await getcategoryid(postinfo.post_category);
        let currency_category_id = await getcategoryid(postinfo.currency_category);

        //inserts record uploaded file info in table 
        await insertpostfileInfo(postinfo, post_category_id, currency_category_id);

        // let lstofposts = await getlstPosts({"user_id": postinfo.user_id});
        // return({"status" : 200, lstofPosts: lstofposts}); //returns result
        return({"status" : 200});
    }

    ///<summary>
    // returns status of store file info
    ///</summary>
    async function storefileinfo(userinfo, s3lstoffoldernames, s3lstoffilenames){

        //initialize default values
        let ctgryfilecount     = 0;
        let currentfileindex   = 0;

        //get lst of folders to store in database
        const lstoffoldernames = Object.keys(userinfo.uploadfolderInfo).filter(item => item != 'profilepic');

        //loop each folder to store in database
        for (let index = 0; index < lstoffoldernames.length; index++) {
            //get no.of files count based on category 
            ctgryfilecount = ctgryfilecount + userinfo.uploadfolderInfo[lstoffoldernames[index]];
            //loop inserts file info based on category
            for (let fileindex = currentfileindex; fileindex < ctgryfilecount; fileindex++) {
                //get category details
                let doc_category_id =  await getcategoryid(lstoffoldernames[index]);
                //inserts record uploaded file info in table 
                await insertuploadfileInfo(userinfo.user_id, doc_category_id, userinfo.documentDesc[lstoffoldernames[index]][fileindex],
                        s3lstoffilenames[fileindex], s3lstoffoldernames[lstoffoldernames[index]]);
            }
            //initialize next index based on category
            currentfileindex = currentfileindex + ctgryfilecount;
        }

        return({"status" : 200}); //returns result
    }

    //returns category id based on attribute value type
    async function getcategoryid(attributetype){

        const docctgryQuery = "SELECT id FROM public.sys_configuration where attribute_value = '" + attributetype + "'";
        const categoryres   = await db.Select(docctgryQuery);
        if(200 != categoryres.status){
            //return empty string if category id doesnt exists
            categoryres = {"result":[{"id": ""}]};
        }

        return categoryres.result[0].id;
    }

    //insert uploaded file info into database
    async function insertuploadfileInfo(user_id, doc_category_id, document_desc, documentname, uploadpath){

        let docinsertQuery = "INSERT INTO public.md_user_documents(user_id, document_category, document_desc, document_name, upload_path, is_active, created_date, updated_date) VALUES (" + user_id + "," + doc_category_id + ",'" + document_desc + "','" + documentname  + "','" + uploadpath +"',1,current_Date, current_timestamp)";
        let docinsertres   = await db.Insert(docinsertQuery);
        if(200 != docinsertres.status){
            throw "failed to execute query";
        }
    }

    //insert uploaded file info into database
    async function insertpostfileInfo(postinfo, post_category_id, currency_category_id){

        postinfo.post_pic_1_path = (postinfo.post_pic_1_path)?postinfo.post_pic_1_path:null;
        postinfo.post_pic_2_path = (postinfo.post_pic_2_path)?postinfo.post_pic_2_path:null;
        postinfo.post_video_1_path = (postinfo.post_video_1_path)?postinfo.post_video_1_path:null;

        let postinsertQuery = "INSERT INTO public.md_user_post(user_id, post_category, post_desc, currency_category, currency, post_pic_1_path,post_pic_2_path, post_video_1_path,likes_count, dislikes_count, views_count, is_active, created_date, updated_date)VALUES (" + postinfo.user_id + "," + post_category_id + ",'" + postinfo.post_desc + "'," + currency_category_id + "," + postinfo.currency + ",'" + postinfo.post_pic_1_path + "','" + postinfo.post_pic_2_path + "','" +  postinfo.post_video_1_path + "', 0, 0, 0, 1, current_Date, current_timestamp)";
        let postinsertres   = await db.Insert(postinsertQuery);
        if(200 != postinsertres.status){
            throw "failed to execute query";
        }
    }
 
    async function updatepostinfo(postcomment, post_category_id, currency_category_id){
        let up = postcomment;
        let updateQuery = "UPDATE public.md_user_post SET post_desc='" + up.post_desc +"', currency_category='" + currency_category_id + "', currency="+ up.currency+ ", post_pic_1_path='" + up.post_pic_1_path + "', post_pic_2_path='"+ up.post_pic_2_path+"', post_video_1_path= '"+ up.post_video_1_path +"',created_date=current_date, updated_date=current_timestamp WHERE id = " + up.id;
        let updateresult = await db.Update(updateQuery);
        if(200 != updateresult.status)
        {
            throw "failed to update query";
        }
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function getpostfolderlstinfo(postfoldersinfo){
        //set default response
        const folderlst        = {};

        //initialize upload folder type list 
        Object.keys(postfoldersinfo).map((item)=>{
            folderlst[item] = "Postfiles";
        })

        //update result info
        if(0 == Object.keys(folderlst).length){
            throw "folder info doesnot exists";
        }

        return folderlst; //return result 
    }

    async function deactivateUser(userinfo){
        const deactivateusrQry = "update public.md_user_table set is_active = 0 where user_id = " + userinfo.user_id;
        const deactivateusrres = await db.Update(deactivateusrQry);
        return deactivateusrres;
    }

    async function encryptpassword(password){
        const encryptpwdqry  = "select password_encryption('"+ password +"')";
        const encryptpwdres  = await db.Select(encryptpwdqry);
        if(0 == encryptpwdres.result.length){
            throw "error occurred while encrypting password"
        }
        return encryptpwdres.result[0].password_encryption;
    }

    async function setnewpassword(userinfo){
        const encrypt_password     =   await encryptpassword(userinfo.createpwd)
        const pwdQuery  = "update public.md_user_table set encrypted_password = '"+ encrypt_password +"' where whatsapp_number = '" + userinfo.whatsapp_number + "'";
        const pwdres    = await db.Update(pwdQuery);
        if(200 !== pwdres.status){
            throw "failed to update";
        }
        return true;
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function IsUserExists(inputparams) {

        //build query to get the profile data of particular user info
        const fetchQuery    = "select * from public.md_user_table where whatsapp_number = '" + inputparams.whatsapp_number + "'";
        const fetchstate   = await db.Select(fetchQuery);
        if(1 === fetchstate.result.length){
            throw "Please use different credentials"
        }
        return(fetchstate.result[0]);
    }   

    ///<summary>
    // returns profile data
    ///</summary>
    async function getCertificatesData(inputparams) {

        //build query to get the profile data of particular user info
        const fetchQuery    = "select * from public.md_user_documents where user_id = '" + inputparams.user_id + "'";
        const fetchstate   = await db.Select(fetchQuery);
        if(0 === fetchstate.result.length){
            throw "login data doesnt exists"
        }
        return(fetchstate);
    }   

    ///<summary>
    // returns profile data
    ///</summary>
    async function getlstPosts(user) {

        // const fetchQuery = "select md_user_table.user_name, md_user_table.whatsapp_number, md_user_post.post_desc, md_user_post.currency_category, md_user_post.currency, md_user_post.likes_count, md_user_post.dislikes_count, md_user_post.views_count, sys_configuration.attribute_value from public.md_user_post md_user_post join public.md_user_table md_user_table on md_user_post.user_id = md_user_table.user_id  join public.sys_configuration sys_configuration on sys_configuration.id = md_user_table.user_category";
        //const fetchQuery = "select id, user_id, user_name, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id, ut.user_name, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count, up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id  and up.is_active = 1 join public.sys_configuration sc on sc.id = up.post_category ) a where rn between 0 and 20";
        const fetchQuery  = "select id, user_id, user_name, user_category, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id, ut.user_name, ut.user_category, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count, up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id join public.sys_configuration sc on sc.id = up.post_category where up.is_active = 1 and not exists (select 1 from public.md_user_hidden_post h where " + user.user_id+" = h.user_id and h.is_active = 1 and up.id = h.post_id)) a where rn between 0 and 20"
        const fetchstate = await db.Select(fetchQuery);
        if(0 === fetchstate.status){
            throw "post items doesnt exists";
        }

        //update likes and dislikes count of each post
        for (let index = 0; index < fetchstate.result.length; index++) {
            const element = fetchstate.result[index];
            const likesQuery = "select post_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_likes_dislikes where post_id = " + element.id + " and is_active = 1 group by post_id";
            const likesresults = await db.Select(likesQuery);
            if(0 < likesresults.result.length){
                fetchstate.result[index].likes_count = parseInt(likesresults.result[0].like_count);
                fetchstate.result[index].dislikes_count = parseInt(likesresults.result[0].dislike_count);
            }
        }
        
        //update the user_id and reaction of the post
        for (let index = 0; index < fetchstate.result.length; index++) {
            const element = fetchstate.result[index];

            const userlikedQuery = "select reaction from public.md_post_likes_dislikes where is_active = 1 and user_id = " + user.user_id + " and  post_id = " + element.id;
            const userlikedResult = await db.Select(userlikedQuery);
            if(0 === userlikedResult.result.length){
                fetchstate.result[index]["reaction"] = 0;
                fetchstate.result[index]["is_active"] = 0;
            }else if(0 < userlikedResult.result.length){
                fetchstate.result[index]["reaction"] = userlikedResult.result[0]["reaction"];
                fetchstate.result[index]["is_active"] = 1;
            }

            fetchstate.result[index]["isfollower"] = await dbfollow.isfollower({"user_id": element.user_id,"follower_id": user.user_id})
            fetchstate.result[index]["logged_in_user_id"] = parseInt(user.user_id);
            fetchstate.result[index]["isLoggedInUser"]    = (fetchstate.result[index]["user_id"] === parseInt(user.user_id));
        }

        let lstofposts = {};
        fetchstate.result.map((item, index)=>{
            lstofposts[item.id] = item;

        });

        return(lstofposts);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function getSubmitterReviews(userids) {
        //modified query to fetch all the entries posted for the reviewer
        // const fetchQuery = "SELECT * FROM public.md_user_reviews where is_active = 1 and user_id = " + userids.user_id + " and reviewer_user_id = " + userids.reviewer_user_id;
        const fetchQuery = "SELECT * FROM public.md_user_reviews where is_active = 1 and reviewer_user_id = " + userids.reviewer_user_id;
        const fetchstate = await db.Select(fetchQuery);
        if(-1 === fetchstate.result.length){
            throw "post items doesnt exists";
        }

        return(fetchstate);
    }   
    
    ///<summary>
    // returns reviews data
    ///</summary>
    async function getreviewerReviews(inputparams) {

        const fetchQuery = "SELECT * FROM public.md_user_reviews where is_active = 1 and reviewer_user_id = " + inputparams.user_id;
        const fetchstate = await db.Select(fetchQuery);
        if(0 === fetchstate.result.length){
            throw "post items doesnt exists";
        }

        return(fetchstate);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function postuserreview(review) {

        const insertQuery = "INSERT INTO public.md_user_reviews(user_id, reviewer_user_id, review_desc, user_rating, reply_desc, is_active, created_date, updated_date)VALUES ("+ review.user_id +"," + review.reviewer_user_id + ",'" + review.review_desc +"'," + review.user_rating +",'" + review.reply_desc + "',1, current_date, current_timestamp)";
        const insertresult = await db.Insert(insertQuery);
        if(200 != insertresult.status){
            throw "failed insert query";
        }

        return(insertresult);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function updateuserreview(review) {
        
        const updateQuery = "update public.md_user_reviews set updated_date = current_timestamp, review_desc = '" + review.review_desc + "',reply_desc = '" + review.reply_desc + "', user_rating = " + review.user_rating + " where user_id =" + review.user_id + " and reviewer_user_id = " + review.reviewer_user_id;
        const updateresult = await db.Update(updateQuery);
        if(200 != updateresult.status){
            throw "failed insert query";
        }

        return(updateresult);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function deleteuserreview(review) {

        const deleteQuery = "update public.md_user_reviews set is_active = 0 where user_id =" + review.user_id + " and reviewer_user_id = " + review.reviewer_user_id;
        const deleteresult = await db.Update(deleteQuery);
        if(200 != deleteresult.status){
            throw "failed insert query";
        }
        deleteresult["operationtype"] = "isdeleted";
        return(deleteresult);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function blockuser(blockinfo) {

        const insertQuery = "INSERT INTO public.md_block_users(logged_in_user_id, blocked_user_id, is_active, created_date, updated_date)VALUES (" + blockinfo.logged_in_user_id + "," + blockinfo.blocked_user_id+",1, current_date, current_timestamp)";
        const insertresult = await db.Insert(insertQuery);
        if(200 != insertresult.status){
            throw "failed insert query";
        }
        return(insertresult);
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
        return(updateresult);
    } 
    
    // 
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
    // deletes post info
    ///</summary>
    async function deletepostitem(delpostinfo) {

        const updateQuery = "update public.md_user_post set is_active = 0 where id = " + delpostinfo.id;
        const updateresult = await db.Update(updateQuery);
        if(200 != updateresult.status){
            throw "failed insert query";
        }
        return(updateresult);
    } 

        ///<summary>
    // returns status of store file info
    ///</summary>
    async function updatepostfileinfo(postinfo, s3lstoffoldernames, s3lstoffilenames){

        //initialize default values
        let ctgryfilecount     = 0;
        let currentfileindex   = 0;
        let keyindex           = 1;
        //get lst of folders to store in database
        const lstoffoldernames = Object.keys(postinfo.uploadfolderInfo);

        //loop each folder to store in database
        for (let index = 0; index < lstoffoldernames.length; index++) {
            keyindex = 1;   //set default index
            //get no.of files count based on category 
            ctgryfilecount = ctgryfilecount + postinfo.uploadfolderInfo[lstoffoldernames[index]];
            //loop inserts file info based on category
            for (let fileindex = currentfileindex; fileindex < ctgryfilecount; fileindex++) {
                let keyItem = lstoffoldernames[index] + "_" + (keyindex++) + "_path";
                postinfo[keyItem] = s3lstoffoldernames[lstoffoldernames[index]] + s3lstoffilenames[fileindex];
            }
            //initialize next index based on category
            currentfileindex = currentfileindex + ctgryfilecount;
        }

        //get category details
        let post_category_id =  await getcategoryid(postinfo.post_category);
        let currency_category_id = await getcategoryid(postinfo.currency_category);
        
        //inserts record uploaded file info in table 
        await updatepostinfo(postinfo, post_category_id, currency_category_id);
        // let lstofposts = await getlstPosts({"user_id": postinfo.user_id});
        // return({"status" : 200, lstofPosts: lstofposts}); //returns result
        return({"status" : 200, lstofPosts: postinfo}); //returns result
    }

    ///<summary>
    // returns profile data
    ///</summary>
    async function getlstPostsInfo(user, sysconfigData) {

        // const fetchQuery = "select md_user_table.user_name, md_user_table.whatsapp_number, md_user_post.post_desc, md_user_post.currency_category, md_user_post.currency, md_user_post.likes_count, md_user_post.dislikes_count, md_user_post.views_count, sys_configuration.attribute_value from public.md_user_post md_user_post join public.md_user_table md_user_table on md_user_post.user_id = md_user_table.user_id  join public.sys_configuration sys_configuration on sys_configuration.id = md_user_table.user_category";
        //const fetchQuery = "select id, user_id, user_name, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id, ut.user_name, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count, up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id  and up.is_active = 1 join public.sys_configuration sc on sc.id = up.post_category ) a where rn between 0 and 20";
        const fetchQuery  = "select id, user_id, user_name, user_category, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id, ut.user_name, ut.user_category, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count, up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id join public.sys_configuration sc on sc.id = up.post_category where up.is_active = 1 and not exists (select 1 from public.md_user_hidden_post h where " + user.user_id+" = h.user_id and h.is_active = 1 and up.id = h.post_id)) a where rn between 0 and 20"
        const fetchstate = await db.Select(fetchQuery);
        if(0 === fetchstate.status){
            throw "post items doesnt exists";
        }

        //update likes and dislikes count of each post
        for (let index = 0; index < fetchstate.result.length; index++) {
            const element = fetchstate.result[index];
            const likesQuery = "select post_id, count(case when reaction = 1 then 1 end) as like_count, count(case when reaction=0 then 1 end) as dislike_count from public.md_post_likes_dislikes where post_id = " + element.id + " and is_active = 1 group by post_id";
            const likesresults = await db.Select(likesQuery);
            if(0 < likesresults.result.length){
                fetchstate.result[index].likes_count = parseInt(likesresults.result[0].like_count);
                fetchstate.result[index].dislikes_count = parseInt(likesresults.result[0].dislike_count);
            }
        }
        
        //update the user_id and reaction of the post
        for (let index = 0; index < fetchstate.result.length; index++) {
            const element = fetchstate.result[index];

            const userlikedQuery = "select reaction from public.md_post_likes_dislikes where is_active = 1 and user_id = " + user.user_id + " and  post_id = " + element.id;
            const userlikedResult = await db.Select(userlikedQuery);
            if(0 === userlikedResult.result.length){
                fetchstate.result[index]["reaction"] = 0;
                fetchstate.result[index]["is_active"] = 0;
            }else if(0 < userlikedResult.result.length){
                fetchstate.result[index]["reaction"] = userlikedResult.result[0]["reaction"];
                fetchstate.result[index]["is_active"] = 1;
            }

            fetchstate.result[index]["isfollower"] = await dbfollow.isfollower({"user_id": element.user_id,"follower_id": user.user_id})
            fetchstate.result[index]["logged_in_user_id"] = parseInt(user.user_id);
            fetchstate.result[index]["isLoggedInUser"]    = (fetchstate.result[index]["user_id"] === parseInt(user.user_id));
            fetchstate.result[index]["isloggedInUserAdmin"] = parseInt(user.is_admin);
        }


        let tmplstofposts = {}

        sysconfigData.map((item, index)=>{
            if("Post" === item.category_name){
                item.values.map((categorytype)=>{
                    tmplstofposts[categorytype] =[];
                })
            }
        });

        fetchstate.result.map((item, index)=>{
            tmplstofposts[item.post_category] = [...tmplstofposts[item.post_category], item];
        })

        let lstofposts = {};
        Object.keys(tmplstofposts).map((item, index)=>{
            let categoryposts = {};
            let category_name = item.replace("Post", "").trim();
            categoryposts[category_name] = tmplstofposts[item];
            lstofposts = {...lstofposts, ...categoryposts};
        });

        return(lstofposts);
    }   

    async function getnewPost(user) {

        // const fetchQuery = "select md_user_table.user_name, md_user_table.whatsapp_number, md_user_post.post_desc, md_user_post.currency_category, md_user_post.currency, md_user_post.likes_count, md_user_post.dislikes_count, md_user_post.views_count, sys_configuration.attribute_value from public.md_user_post md_user_post join public.md_user_table md_user_table on md_user_post.user_id = md_user_table.user_id  join public.sys_configuration sys_configuration on sys_configuration.id = md_user_table.user_category";
        //const fetchQuery = "select id, user_id, user_name, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id, ut.user_name, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count, up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id  and up.is_active = 1 join public.sys_configuration sc on sc.id = up.post_category ) a where rn between 0 and 20";
        const fetchQuery  = "select id, user_id, user_name, user_category, whatsapp_number, post_desc, currency_category, currency, likes_count, dislikes_count, views_count, post_pic_1_path, post_pic_2_path, post_video_1_path, attribute_value as post_category from (select dense_rank() over(partition by up.post_category order by up.updated_date desc) rn,  up.id, ut.user_id, ut.user_name, ut.user_category, ut.whatsapp_number, up.post_desc, up.currency_category,  up.currency, up.likes_count, up.dislikes_count, up.views_count, up.post_pic_1_path, up.post_pic_2_path,  up.post_video_1_path,sc.attribute_value from public.md_user_post up join public.md_user_table ut  on up.user_id = ut.user_id join public.sys_configuration sc on sc.id = up.post_category where up.is_active = 1 and not exists (select 1 from public.md_user_hidden_post h where " + user.user_id+" = h.user_id and h.is_active = 1 and up.id = h.post_id)) a where rn between 0 and 1"
        const fetchstate = await db.Select(fetchQuery);
        if(0 === fetchstate.status){
            throw "post items doesnt exists";
        }

        let result = fetchstate.result.filter(item=>{
            if(item.post_category === user.post_category){
                item["is_active"] = 0;
                item["reaction"] = 0;
                item["logged_in_user_id"] = parseInt(user.user_id);
                item["isLoggedInUser"]    = (fetchstate.result[0]["user_id"] === parseInt(user.user_id));
                return item;
            }
        });

        return result;
    }

    module.exports = {getsysconfiguration,insertuploadfileInfo, 
        getProfileData, registerProfile, updateProfile, insertpostData, 
        getuploadfolderlstinfo, storefileinfo, getcategoryid, getpostfolderlstinfo, 
        insertpostfileInfo, storepostfileinfo, deactivateUser, setnewpassword, 
        encryptpassword, IsUserExists, getCertificatesData, getlstPosts,
        getSubmitterReviews, postuserreview,getreviewerReviews,updateuserreview,
        deleteuserreview, getnewPost,updatereRegistration,
        deletepostitem, updatepostfileinfo, getlstPostsInfo} 
