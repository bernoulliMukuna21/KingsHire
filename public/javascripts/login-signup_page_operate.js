import * as accountsOperation from './account_operate.js';

$('.join-form-container form.join-form-right').submit(function (event) {
    // Signup
    event.preventDefault();
    let insideText = $('button#submit-button')[0].innerText.replace("Sign", "Signing");
    accountsOperation.disbaleButton('button#submit-button', `${insideText} <span id="wait">.</span>`);
    this.submit();
})

$('.login-page-container .login').submit(function (event) {
    //login
    event.preventDefault();
    accountsOperation.disbaleButton('#unilance-login-bttn', 'LOGIN <span id="wait">.</span>');
    this.submit();
})

$(document).ready(function(){
    accountsOperation.enableButton('#unilance-login-bttn', 'LOGIN');
})