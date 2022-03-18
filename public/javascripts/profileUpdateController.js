var fs = require('fs');
var formChecker = require('../javascripts/formChecker');
var UserModel = require('../../models/UserModel');

class ProfileUpdateController{
    /*
    * In this class, the information type in by a user is validated and
    * if there are any errors, this class will return the error.
    * **/


    constructor(user, userUpdateData, userProfilePictureFile, userType) {
        this.user = user;
        this.userUpdateData = userUpdateData;
        this.userProfilePictureFile = userProfilePictureFile;
        this.userType = userType;

        this.newPassword = userUpdateData.new_password;
        this.newEmail = userUpdateData.email;
        this.userDB_email = user.email;
        this.errors = {};
    }

    checkAccountStrategy(){
        /*
        * If a user signed up with their social network
        * or google Strategy, then they should not be allowed
        * to update their email on this site.
        * */
        
        let authTypeName = this.user.authentication.authName;

        if(authTypeName){
            // User's account linked to social network login startegy

            if(this.newEmail !== this.userDB_email || this.newPassword){
                return 'socialNetworkStrategy';
            }
        }
    }

    checkGeneralInformation(){
        // add another one for the email check
        let name = this.userUpdateData.name;
        let surname = this.userUpdateData.surname;
        let phone_number = this.userUpdateData.phone_number;
        let email = this.newEmail;

        let emailChecker = formChecker.emailChecker(email);
        if(emailChecker.length>=1){
            this.errors.emailError = emailChecker;
        }

        if(phone_number){
            let phoneChecker = formChecker.phoneNumberChecker(phone_number);
            if(phoneChecker.length>=1){
                this.errors.phoneError = phoneChecker;
            }else{
                this.user.phone_number = phone_number;
            }
        }

        if(name !== this.user.name){this.user.name = name;}
        if(surname !== this.user.surname){this.user.surname = surname;}
    }

    checkPassword(){
        // if there is a new password and it is different to old password
        if(this.newPassword){
            let newConfirmPasswod = this.userUpdateData.confirm_password;
            let passwordChecker =
                formChecker.passwordChecker(this.newPassword, newConfirmPasswod);
            if(passwordChecker.length>=1){
                this.errors.passwordErrors = passwordChecker;
            }else{
                this.user.password = this.newPassword;
            }
        }
    }

    checkImageFile(){
        if(this.userProfilePictureFile){

            let fileFormatCheck =
                formChecker.profilePhotoFormatChecker(this.userProfilePictureFile);
            if(fileFormatCheck.length>=1){
                this.errors.fileFormatError = fileFormatCheck;
            }else{
                // If there are no errors, then a file with the right format must
                // have been picked

                this.user.profile_picture = {
                    name: this.userProfilePictureFile.filename,
                    contentType: this.userProfilePictureFile.mimetype,
                    data: fs.readFileSync(this.userProfilePictureFile.path)
                }
            }
        }
    }

    checkFreelancerInformation(){
        let education, description, servicesAndPrices, skills;
        let minimumPriceOfService = 10.00;

        // description
        if(this.userUpdateData.freelancer_description){
            this.user.description = this.userUpdateData.freelancer_description;
        }else{
            this.user.description = undefined;
        }

        // skills
        if(this.userUpdateData.saved_skills){
            skills = JSON.parse(this.userUpdateData.saved_skills);
            if(Object.keys(skills).length>0){
                this.user.skill = [];
                for(let i=0; i<skills.length; i++){
                    this.user.skill.push(skills[i][0]);
                }
            }else {this.user.skill = []}
        }

        if(this.userUpdateData.saved_servicesAndPrices){
            servicesAndPrices = JSON.parse(this.userUpdateData.saved_servicesAndPrices);

            if(Object.keys(servicesAndPrices).length>0){
                this.user.serviceAndPrice=[];
                for(let i=0; i<servicesAndPrices.length; i++){
                    let singleServiceAndPrice = new Object();
                    let service = servicesAndPrices[i][0];
                    let priceOfService = servicesAndPrices[i][1];
                    let packageOfService = servicesAndPrices[i][2];

                    if(priceOfService >= minimumPriceOfService){
                        singleServiceAndPrice.service = service;
                        singleServiceAndPrice.price = priceOfService;

                        if(packageOfService){
                            packageOfService = JSON.parse(packageOfService);
                            singleServiceAndPrice.servicePackage = packageOfService.freelancerPackage;
                        }

                        this.user.serviceAndPrice.push(singleServiceAndPrice);
                    }

                }

            }else{this.user.serviceAndPrice=[]}
        }

        //education
        if(this.userUpdateData.saved_educations){
            education = JSON.parse(this.userUpdateData.saved_educations);
            if(Object.keys(education).length>0){
                this.user.education = [];
                for(let i=0; i<education.length; i++){
                    let singleEducation = new Object();
                    singleEducation.degreeAndCourse = education[i][0];
                    singleEducation.institute = education[i][1];
                    singleEducation.educationYear = education[i][2];
                    this.user.education.push(singleEducation);
                }
            }else{this.user.education = []}
        }
    }

    checkUserInformation(){
        this.checkGeneralInformation();
        this.checkPassword();
        this.checkImageFile();
        if(this.userType === 'freelancer'){
            this.checkFreelancerInformation();
        }

        return{
            updateErrors: this.errors,
            updateUser: this.user
        }
    }

    async compileUpdateInformation(){
        let updateInfos={};

        try {
            if(this.newEmail !== this.userDB_email){
                // User has typed in a new email, this must be checked to ensure
                // that there is not another user already using this email.

                let userFound = await UserModel.findOne({email: this.newEmail});
                if(!userFound){
                    this.user.email = this.newEmail;
                    updateInfos = this.checkUserInformation();
                }else{
                    // someone is already using the new email
                    updateInfos = {};
                    updateInfos.updateErrors = {
                        emailError:
                            [ formChecker.error_message('email', 'Email error - This email is already' +
                                ' taken by another user')]
                    };
                    updateInfos.updateUser = null;
                }
            }else{
                updateInfos = this.checkUserInformation();
            }
        }catch (e) {
            throw e;
        }
        return updateInfos;
    }

    async checkLoginStrategyAndReturnInformation(){

        let userAccountStrategy = this.checkAccountStrategy();

        if(userAccountStrategy === 'socialNetworkStrategy'){
            return{
                updateErrors: {
                    signUpStrategy:
                        [ formChecker.error_message('strategy', 'This account is linked to Facebook ' +
                            'or Google - Email and Password cannot be updated')]
                },
                updateUser: null
            }
        }
        else{
            return this.compileUpdateInformation();
        }
    }
}
module.exports = ProfileUpdateController;