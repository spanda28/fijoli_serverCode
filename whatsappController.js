

    ///<summary>
    // returns profile data
    ///</summary>
    async function validateWhatsappNumber (name, whatsappnumber) {
        try {
             return new Promise((resolve, reject)=>{
                resolve(whatsappnumber);
            });
        } catch (error) {
            //do nothing
        }
    }

    module.exports = {validateWhatsappNumber}