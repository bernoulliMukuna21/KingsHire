import * as accountsOperation from "./account_operate.js";
let domainURL = 'https://kingshireproject.herokuapp.com'
$(window).ready(function() {
    let currentPath = window.location.href.substring(domainURL.length);
    console.log('Domain URL: ', domainURL);

    if(currentPath.length > 0){
        $('.top-navbar>div>a:first-child').removeClass('clicked-top-navbar');

        let navOptioIdentifier;

        if(currentPath.includes('services')){
            let clickedServicePosition = currentPath.split('&').pop();
            clickedServicePosition = clickedServicePosition.split('=').pop();
            clickedServicePosition = parseInt(clickedServicePosition);

            $(`.services-navigation-bar ul li:nth-child(${clickedServicePosition}) a`)[0].classList.add('services-navigation-bar-clicked');

        }else{
            if(currentPath.includes('login')){
                navOptioIdentifier = 'login'
            }
            if(currentPath.includes('join')){
                navOptioIdentifier = 'join'
            }
            if(currentPath.includes('account')){
                navOptioIdentifier = 'account'
            }
            if(currentPath.includes('logout')){
                navOptioIdentifier = 'logout'
            }

            let allNavigationOptions = $('.top-navbar>div')[0].childNodes;
            let indexOfNavOptionToShow = Array.from(allNavigationOptions).findIndex( eachoption =>
                (eachoption.innerText).toLowerCase().includes(navOptioIdentifier));

            $(`.top-navbar>div>a:nth-child(${indexOfNavOptionToShow+1})`)[0].classList.add('clicked-top-navbar');
        }
    }else{
        $('.top-navbar>div>a:first-child')[0].classList.add('clicked-top-navbar');
    }

    if(!$('.bottom-side button').is(':visible')){
        $('.single-selected-freelancer-index .bottom-side').css({
            'display':'flex',
            'justifyContent': 'center',
        });
        $('.bottom-side .freelance-mssg-btn').css({
            'padding':'.75rem',
            'width': '12rem',
        });
    }
    if(!$('.bottom-side .freelance-mssg-btn').is(':visible')){
        $('.bottom-side').css({
            'display':'flex',
            'justifyContent': 'center'
        });
    }
})

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

$(document).on('click', '.top-navbar div a', function(event){
    let allNavigationOptions = $('.top-navbar>div')[0].childNodes;
    let targetedElement = event.target;

    allNavigationOptions.forEach(eachOption => {

        $(eachOption).removeClass('clicked-top-navbar');

        if(targetedElement.innerText === eachOption.innerText)
            targetedElement.classList.add('clicked-top-navbar');
    })
});

$('#pro-services-redirect').click(function (event) {
    $('html, body').animate({
        scrollTop: $('.services-navigation-bar').offset().top
    }, 1000);
})

$(document).on('click', '.single-selected-freelancer-index .bottom-side button', function(event) {
    let bottomSideHTML = event.target.parentNode;
    let freelancerEmail = bottomSideHTML.nextSibling.value;
    let name = bottomSideHTML.previousSibling.previousSibling.lastChild.innerText;
    $('#service-supplier-name').val(JSON.stringify({freelancerEmail: freelancerEmail, freelancerName: name}));
})

$(document).on('click', '.index-serviceAndPrice', function (event) {
    let indexPageServicesHTML = event.target;

    if (indexPageServicesHTML.tagName === 'P')
        indexPageServicesHTML = indexPageServicesHTML.parentNode

    let packagesForService = JSON.parse(indexPageServicesHTML.lastChild.value);
    packagesForService = packagesForService.freelancerPackage;
    let servicePackageModal = indexPageServicesHTML.parentNode.parentNode.parentNode.parentNode;

    if(servicePackageModal.className !== 'kingslance-services'){
        servicePackageModal = servicePackageModal.parentNode;
    }

    servicePackageModal = servicePackageModal.parentNode.nextSibling.nextSibling;

    servicePackageModal.firstChild.firstChild.firstChild.firstChild.innerHTML =
        `<span>${indexPageServicesHTML.firstChild.innerText} </span>`+
        `by ${indexPageServicesHTML.parentNode.previousSibling.lastChild.firstChild.innerText}`;


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

// Slideshow
var slidePosition = 1;
SlideShow(slidePosition);

$(document).on("click", "#freelancerBackarrow", function (event) {
    plusSlides(-1);
});

$(document).on("click", "#freelancerFrontarrow", function (event) {
    plusSlides(1);
});

// forward/Back controls
function plusSlides(n) {
    SlideShow((slidePosition += n));
}

function SlideShow(n) {
    var i;
    var slides = document.getElementsByClassName("landingpageFreelancers");
    if (n > slides.length) {
        slidePosition = 1;
    }
    if (n < 1) {
        slidePosition = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slides[slidePosition - 1].style.display = "block";
}

// Mobile Slideshow
$( document ).ready(function() {
    // First check if its a mobile device before integrating the slideshow function
    let is_mobile = false;
    if( $('#freelancerFrontarrow').css('display')=='block') {
        is_mobile = true;
    }
    if (is_mobile == true) {
        let slidePosition = 1;
        SlideShow(slidePosition);

        $(document).on("click", "#freelancerBackarrow", function (event) {
            plusSlides(-1);
        });

        $(document).on("click", "#freelancerFrontarrow", function (event) {
            plusSlides(1);
        });

        // Forward/Back controls
        function plusSlides(n) {
            SlideShow((slidePosition += n));
        }
        // Slide show function
        function SlideShow(n) {
            var i;
            var slides = document.getElementsByClassName("landingpageFreelancers");
            if (n > slides.length) {
                slidePosition = 1;
            }
            if (n < 1) {
                slidePosition = slides.length;
            }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }

            slides[slidePosition - 1].style.display = "block";
        }
    }
});




/*
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
*/
