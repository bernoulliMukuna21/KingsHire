module.exports = {
    base64ToImageSrc: function (imageInfos){
        /*
       * In this function, the update information of the user
       * will be display in the front-end.
       * */

        let name = imageInfos.name;
        let type = imageInfos.contentType;
        let data = imageInfos.data;

        return 'data:' + type + ';base64,' + data.toString('base64');
    }
    ,
    imageToDisplay: function (userData) {
        /*
        * In this function, we are taking the user data from database to return a string
        * image for display.
        * */
        let imageSource;
        let pictureData = userData.profile_picture;

        if(pictureData.data){
            if(pictureData.name === 'oauth_picture'){
                imageSource = pictureData.data.toString();
            }else{
                imageSource = module.exports.base64ToImageSrc(pictureData);
            }
        }
        if (imageSource){ return imageSource}
        else return '';
    }
}

