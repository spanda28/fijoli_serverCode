

function getPostData(hp, hpdb){
    	
    let currentState    = hpdb.is_active.toString() +  hp.reaction.toString();
    let postState       = getpostStateValue(currentState);

    pludb["is_active"]     = postState["is_active"];
    pludb["reaction"]      = postState["reaction"];

    return pludb
}

function getpostStateValue(currentState){

    let reactionCombinations = {  
           "000"  :   {"is_active" :1, "reaction" :0}  ,
           "001"  :   {"is_active" :1, "reaction" :1}  ,
           "010"  :   {"is_active" :1, "reaction" :0}  ,
           "011"  :   {"is_active" :1, "reaction" :1}  ,
           "100"  :   {"is_active" :0, "reaction" :0}  ,
           "101"  :   {"is_active" :1, "reaction" :1}  ,
           "110"  :   {"is_active" :1, "reaction" :0}  ,
           "111"  :   {"is_active" :0, "reaction" :1}  
        };
    

    return reactionCombinations[currentState];

}

module.exports = {getPostData}