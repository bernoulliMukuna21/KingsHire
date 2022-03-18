/*
    * Author: Bernoulli Mukuna
    * created: 13/05/2020
*/

function password_checker(password, conf_password){
    /*
    *  This method serves as checker of the password put by the user
    * */

    let password_errors = [];
    let uppercase = /[A-Z]/;
    let lowercase = /[a-z]/;
    let numbers =  /[0-9]/;
    let white_space = /\s/g;

    if(password.length<9){
        password_errors.push(error_messages('password', 'password length must be at least 9'));
    }
    else{
        if(password === conf_password){
            if(white_space.test(password)){
                password_errors.push(error_messages('password', 'password cannot contain white spaces'));
            }
            if(!uppercase.test(password)){
                password_errors.push(error_messages('password', 'password must contain at least one uppercase letter'));
            }
            if(!lowercase.test(password)){
                password_errors.push(error_messages('password', 'password must contain at least one lowercase letter'));
            }
            if(!numbers.test(password)){
                password_errors.push(error_messages('password', 'password must contain a least one digit'));
            }
        }
        else{
            password_errors.push(error_messages('password', 'passwords DO NOT match!'));
        }
    }
    return password_errors;
}

function profilePictureChecker(pictureFile) {
    /*
    * The following function is used for validation of the image uploaded
    * by the user. The picture must be of certain format to be accepted;
    * this is checked using the code below.
    * */

    // Allowed ext
    let filetypes = /jpeg|jpg|png|gif|webp/;
    let picture_errors = [];

    if(pictureFile){
        let pictureType = pictureFile.mimetype;
        pictureType = pictureType.split('/');
        pictureType = pictureType[pictureType.length - 1];

        if(!filetypes.test(pictureType)){
            picture_errors.push(error_messages('profilePicture',
                'Picture can only be .jpeg, .webp, .jpg, .png or .gif.'))
        }
    }
    return picture_errors;
}

function phoneNumberChecker(phoneNumber) {
    let phoneNumber_test1 = /^\d+$/;
    let phoneNumber_test2 = /^\+?\d*$/;
    let phoneNumberErrors = [];

    if(phoneNumber){
        if(!phoneNumber_test1.test(phoneNumber) || !phoneNumber_test2.test(phoneNumber)){
            phoneNumberErrors.push(error_messages('phoneNumber',
                'Phone Number can start with + sign but must only contain numbers.'))
        }
    }

    return phoneNumberErrors;
}

function priceChecker(price){
    let decimalNumber =  /^\d{0,10}(\.\d{1,2})?$/;
    let priceError = [];

    if(!decimalNumber.test(price)){
        priceError.push(error_messages('price',
            'price can only contain numbers (e.g. .75, 1025, 12.99)'))
    }

    return priceError;
}
function servicesChecker(services) {
    let serviceError = [];

    if(services.length<=0){
        serviceError.push(error_messages('service',
            'service cannot be empty!'))
    }

    return serviceError;
}

function emailChecker(email) {
    email = email.trim();

    let emailErrors = [];
    let emailTester = /\S+@\S+\.\S+/;

    if(!email || email.length===0){
        emailErrors.push(error_messages('email',
            'email cannot be empty!'))
    }
    else if(!emailTester.test(email)){
        emailErrors.push(error_messages('email',
            'Please enter a valid email address'))
    }

    return emailErrors;
}

function error_messages(label, message){
    /*
    * The error message to return to the user
    * */

    return{
        label: label,
        message: message
    }
}

module.exports = {
    passwordChecker: password_checker,
    profilePhotoFormatChecker: profilePictureChecker,
    phoneNumberChecker: phoneNumberChecker,
    priceChecker: priceChecker,
    servicesChecker: servicesChecker,
    emailChecker: emailChecker,
    error_message: error_messages
}
