import * as accountsOperation from "./account_operate.js";

$(document).ready(function(){
    if(!$('.bottom-side button').is(':visible')){
        $('.bottom-side .freelance-mssg-btn').css({
            'padding':'.75rem',
            'width': '12rem',
        });
    }
    if(!$('.bottom-side .freelance-mssg-btn').is(':visible')){
        $('.bottom-side').css({
            'justifyContent': 'center'
        });
        $('.bottom-side button').css({
            'margin': '0 .5rem'
        });
    }
})
function scrollToFreelancers(){
    $('html, body').animate({
        scrollTop: $('.index-page-three').offset().top
    }, 1000);
}
/*
$('#book-now-btn').click(function (event) {
    scrollToFreelancers();
})
let previousName = $('#book-now-btn')[0];
if(previousName.className === 'client'){
    scrollToFreelancers();
}*/

$(window).click(function(event) {
    if(!event.target.closest('.feedback-modal-container') && event.target.className !== 'feedbackText'){
        $('.feedback-modal-container').hide();
    }

    if(!event.target.closest('.freelance-service-package-modal-container')
        && !event.target.closest('.index-serviceAndPrice')
        || event.target.className === 'closebook-form'){
        $('.freelance-service-package-modal').hide();
    }
});

$(document).on('click', '.index-serviceAndPrice', function (event) {
    let indexPageServicesHTML = event.target;

    if (indexPageServicesHTML.tagName === 'P')
        indexPageServicesHTML = indexPageServicesHTML.parentNode

    let packagesForService = JSON.parse(indexPageServicesHTML.lastChild.value);
    packagesForService = packagesForService.freelancerPackage;
    let servicePackageModal = indexPageServicesHTML.parentNode.parentNode.parentNode.parentNode.lastChild;
    console.log(indexPageServicesHTML.firstChild.innerText)
    console.log(servicePackageModal)

    servicePackageModal.firstChild.firstChild.firstChild.firstChild.innerHTML =
        `<span>${indexPageServicesHTML.firstChild.innerText} </span>`+
        `by ${indexPageServicesHTML.parentNode.parentNode.previousSibling.lastChild.firstChild.firstChild.firstChild.innerText}`;


    // Set the price for the current cliked service to be shown on the modal
    servicePackageModal.firstChild.childNodes[1].childNodes[2].firstChild.innerText = `Total Price: ${indexPageServicesHTML.childNodes[1].innerText}`

    // Finally, set the packages to be displayed
    servicePackageModal = servicePackageModal.firstChild.childNodes[1].childNodes[1];
    $(servicePackageModal).empty();

    if(packagesForService.length > 0){
        servicePackageModal.innerHTML = '<ul></ul>';
        packagesForService.forEach( singlePackage => {
            let packageUList = document.createElement('li');
            packageUList.innerText = `- ${singlePackage}`;
            servicePackageModal.firstChild.append(packageUList);
        })
    }else{
        servicePackageModal.innerHTML = '<div><p>Empty Package</p></div>'
    }

    $('.freelance-service-package-modal').css({
        'display': 'flex',
        'justifyContent': 'center',
        'alignItems': 'center'
    });
    $('.freelance-service-package-modal').show();
});

$(document).on('click', '.bottom-side button', function(event) {
    let mainDIV = event.target.parentNode.parentNode;
    let freelancerEmail = mainDIV.lastChild.value;
    let name = mainDIV.firstChild.lastChild.firstChild.firstChild.firstChild.innerText;
    $('#service-supplier-name').val(JSON.stringify({freelancerEmail: freelancerEmail, freelancerName: name}));
})

$(document).on('click', '.feedbackText', function(event) {
    $('.feedback-modal-container').toggle();
})

$('#feeback-form').submit( event => {
    event.preventDefault();

    $('.feedback-form-mailer-message').empty();
    $('#feeback-form>div section:last-child input:first-child').prop('disabled', true);
    $('#feeback-form>div section:last-child input:last-child').prop('disabled', true);

    let formData = accountsOperation.dataCollection('#feeback-form');
    let feedbackDataJSON = {}

    for (var value of formData.entries()) {
        feedbackDataJSON[value[0]] = value[1];
    }

    $.ajax({
        method: 'POST',
        url: '/feedback',
        data: feedbackDataJSON,
        success: function (data) {
            $('#feeback-form>div section:last-child input:first-child').prop('disabled', false);
            $('#feeback-form>div section:last-child input:last-child').prop('disabled', false);

            $('#feeback-form>div section:last-child input:first-child').trigger('click');

            $('.feedback-form-mailer-message').append('<p> Feedback Sent, thank you! </p>');
            $('.feedback-form-mailer-message p').css({
                'background-color': '#4CAF50'
            })

            $('.feedback-form-mailer-message').show();
            $('.feedback-form-mailer-message').delay(2000).hide(500);
        },
        error: function (error) {
            $('#feeback-form>div section:last-child input:first-child').prop('disabled', false);
            $('#feeback-form>div section:last-child input:last-child').prop('disabled', false);

            $('.feedback-form-mailer-message').append('<p> Sorry, Send Feedback Failed!  </p>');
            $('.feedback-form-mailer-message p').css({
                'background-color': '#FF0000'
            })

            $('.feedback-form-mailer-message').show();
            $('.feedback-form-mailer-message').delay(2000).hide(500);
        }
    })
})
