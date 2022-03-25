/*
function registrationShowAndHide(container, indexToShow, IndexToHide) {
    $(container)[0].childNodes[indexToShow].classList.add('fadeInRight');
    $(container)[0].childNodes[IndexToHide].classList.add('fadeOutLeft');
}
$(document).on('click', '.freelancer-registration-all-steps', function(event) {
    let registrationCurrentSlide = event.target;
    if(registrationCurrentSlide.innerText === 'Terms of Use Agreement'){
        $('.registration-statement').hide();
        $('.registration-services-and-prices').show();
    }else if(registrationCurrentSlide.innerText === 'Service and Prices'){
        $('.registration-statement').show();
        $('.registration-services-and-prices').hide();
    }
})

$('.close-freelancer-registration').click(event => {
    $('.freelancer-registration').hide();
})

$(window).click(function(event) {
    if(event.target.className === "freelancer-registration") {
        event.target.style.display = "none";
    }
});
*/