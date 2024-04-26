

const db    = require('./../../../dbcontroller.js');
const idbsp = require('./../../../dbInterface.js');

    ///<summary>
    // returns reviews data
    ///</summary>
    async function getsearchposts(sp) {
        const spQuery = "select * from (SELECT 'post' as section, up.id as post_id, up.user_id, post_category, post_desc as description, post_pic_1_path, post_pic_2_path, post_video_1_path, ut.user_name, sc.attribute_value as category, null as whatsapp_number FROM public.md_user_post up inner join public.md_user_table ut on up.user_id = ut.user_id inner join public.sys_configuration sc on up.post_category = sc.id and category_name = 'Post' where up.is_active =1 and ut.is_active = 1 and sc.is_active = true union all select 'user' as section, null as post_id, ut.user_id, null as post_category, user_description as description,null as post_pic_1_path, null as post_pic_2_path, null as post_video_1_path, ut.user_name,'Profile' as category, ut.whatsapp_number from public.md_user_table ut where ut.is_active = 1 ) as source where (description like '%" + sp.searchkeyword +"%' or '%"+ sp.searchkeyword +"%' is null ) or (user_name like '%"+ sp.searchkeyword +"%' or '%"+ sp.searchkeyword +"%' is null ) or (category like '%"+ sp.searchkeyword+"%' or '%"+ sp.searchkeyword +"%' is null )"
        const spResult = await db.Select(spQuery);
        if(200 != spResult.status){
            throw "failed to get spQuery Data";
        }
        return(spResult);
    }   

    ///<summary>
    // returns reviews data
    ///</summary>
    async function getsearchpostitem(sp) {
        const lstofposts = await idbsp.getlstPosts({"user_id":sp.user_id});
        let postresult = {};

        Object.keys(lstofposts).map((keyItem, index)=>{
            if(sp.post_id === keyItem){
                postresult = {[keyItem]: lstofposts[keyItem]};
            }
        });

        return(postresult);
    }   
    module.exports = {getsearchposts, getsearchpostitem}