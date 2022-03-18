import * as accountsOperation from './account_operate.js';
import * as socketConnection from './socketio-connection-client-side.js'
import {createBookingHTML, moveProjectBooking} from "./account_operate.js";
import BookingInsertionIndex from './BookingInsertionIndex.js'

let allServicesPrices;
let domainName = 'https://kingshire.herokuapp.com';
//let domainName = 'http://localhost:3000';
let minimumPriceOfService = 10.00;

var locale = 'en-GB'; //window.navigator.userLanguage || window.navigator.language;
let freelancerListOfStatus = ['booking ongoing', 'awaiting payment', 'accept / modify', 'awaiting response',
    'please respond', 'awaiting confirmation', 'confirmed, well done!', 'awaiting resolution', 'paid', 'cancelled'];

let clientListOfStatus = ['booking ongoing', 'pay now', 'awaiting acceptance', 'awaiting response',
    'please respond', 'confirm / reject', 'thank you!', 'awaiting resolution', 'cancelled'];

function mobileVersionFunctionality(windowsize, dateValue){
    $('#service-booking-dueDate').attr("type", "text");
    if (windowsize <= 500){
        $('#service-booking-dueDate').attr("type", "date");
        $('#service-booking-dueDate').removeAttr("placeholder");
        if(!dateValue &&  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)){
            $('#service-booking-dueDate').attr("placeholder", "dd/mm/yyyy");
        }else{
            $('#service-booking-dueDate').removeAttr("placeholder");
        }
    }
}
$(window).ready(function() {
    console.log('window load');
    var windowsize = $(window).width();
    mobileVersionFunctionality(windowsize);
})

$(window).resize(function() {
    console.log('window resize');
    var windowsize = $(window).width();
    mobileVersionFunctionality(windowsize);
});

$('#service-booking-dueDate').blur(function() {
    var windowsize = $(window).width();
    mobileVersionFunctionality(windowsize, $(this).val());
})

$('#service-booking-dueDate').focus(function() {
    $(this).removeAttr("placeholder");
})

function emptyForm() {
    // Clear input value
    $('.booking-form div:nth-child(2)>section h1').remove();
    $('#service-booking-form>select option').remove();
    $('#service-booking-projectName').val('');
    $('#service-booking-dueDate').val('');
    $('#service-enquiry-price').val('');
    $('#service-booking-projectDescription').val('');
    $('#bookingHour').prop('selectedIndex', 0);
    $('#bookingMinute').prop('selectedIndex', 0);
    $('#bookingMeridies').prop('selectedIndex', 0);

    // Clear error css
    $('#service-booking-form>select').css('border', 'none');
    $('.booking-time-picker h5').css('color', 'black');
    $('#bookingHour').css('border', 'none');
    $('#bookingMinute').css('border', 'none');
    $('.project-enquiry-price').css('border', 'none');
    $('#booking-form-error-mssg').empty();
}

function booking_form_show(title, allServicesPrices) {

    //First, clear the form of any input
    emptyForm();

    // Clear request and instant booking price
    let buttonInnerText = $('#service-booking-submit-bttn')[0].innerText;
    $('#service-booking-submit-bttn')[0].innerText = buttonInnerText.split('(')[0].trim();

    // Create title for the current Pop Up form
    let formHeader = document.createElement('h1');
    formHeader.classList.add('booktitle');
    formHeader.style.textAlign = 'center';
    formHeader.innerText = title;
    $('.booking-form div:nth-child(2)>section').append(formHeader);

    // Get and display all the services of the clicked freelancer
    $('#service-booking-form>select').append(new Option('Select Service', '')).attr('selected', true);
    allServicesPrices.forEach(service_price =>{
        let service = service_price.childNodes[0].innerHTML;
        $('#service-booking-form>select').append(new Option(service, service));
    })

    $('.booking').css({
        'display': 'flex',
        'justifyContent': 'center',
        'alignItems': 'center'
    });
    $('.booking').show();
}
function priceToShow(targetService, allServicesPrices) {

    let targetPrice;
    for(let i=0; i<allServicesPrices.length; i++){
        let currentServiceAndPrice = allServicesPrices[i];
        if(currentServiceAndPrice.childNodes[0].innerHTML===targetService){
            targetPrice = currentServiceAndPrice.childNodes[1].innerHTML;
            //break;
        }
    }

    return targetPrice.slice(1)
}

function buttonToShow(button) {
    if(event.target.innerText === 'Instant Book'){
        //Show book and hide enquire button
        $('#service-booking-submit-bttn').show();

        //Hide book and show enquire button
        $('#service-enquiry-submit-bttn').hide();
        $('.project-enquiry-price').hide();
    }else if(event.target.innerText === 'Request'){
        //Show book and hide enquire button
        $('#service-booking-submit-bttn').hide();

        //Hide book and show enquire button
        $('#service-enquiry-submit-bttn').show();
        $('.project-enquiry-price').show();
    }
}

$('.bottom-side button').click(event => {
    // Get Screen size
    var windowsize = $(window).width();

    /* Get the clicked Freelancer*/
    let parentContainer = event.target.parentNode.parentNode;

    let currentFreelancerName =  parentContainer.childNodes[0].
        childNodes[1].childNodes[0].innerText;

    // Create Booking Form Title
    let currentPopTitle = 'Book Service with '+ currentFreelancerName;
    if(Object.keys($('#service-booking-form')).length === 0){
        $('.booking').css({
            'display': 'flex',
            'justifyContent': 'center',
            'alignItems': 'center'
        });
        $('.booking').show();

    }else{
        // Get the clicked freelancer services and their respective prices
        allServicesPrices = parentContainer.childNodes[1].childNodes[0].childNodes;

        // Date & Time for mobile version
        mobileVersionFunctionality(windowsize);

        // Hide/Show either Book or Enquire button
        buttonToShow(event.target.innerText)

        // Show the dynamic booking form
        booking_form_show(currentPopTitle, allServicesPrices)
    }
})

$('.public-service-enquiry .book-btn').click(event => {
    /* Get the clicked Freelancer*/
    let parentContainer = event.target.parentNode.parentNode
    let currentFreelancerName = parentContainer.childNodes[1].innerText;

    // Create Booking Form Title
    let currentPopTitle = 'Book Service with '+ currentFreelancerName;

    allServicesPrices = parentContainer.childNodes[3].childNodes;

    // Hide/Show either Book or Enquire button
    buttonToShow(event.target.innerText)

    booking_form_show(currentPopTitle, allServicesPrices)
})


$('#service-booking-form>select').change(event => {
    if($('#service-booking-submit-bttn').is(':visible') ||
        $('#service-enquiry-submit-bttn').is(':visible')){

        $('#service-booking-form>select').css('border', '.1rem solid #213e53');
        let price = priceToShow(event.target.value, allServicesPrices);
        let bookBttnText;

        if(price){
            bookBttnText = 'Instant Book '+ `(£${price})`;
        }else bookBttnText = 'Instant Book';

        $('#service-booking-submit-bttn')[0].innerText = bookBttnText;
        $('#service-booking-price').val(price);
    }
})

$('#service-enquiry-price').click(function(event){
    $('.project-enquiry-price').css('border', 'none');
});

$('#service-enquiry-price').keypress(function(event){
    return accountsOperation.priceValidation(event.key, $(this).val());
});

$('.closebook-form').click(event => {
    $('.booking').hide();
})

$(window).click(function(event) {
    if(event.target.className === "booking") {
        event.target.style.display = "none";
        $('#service-booking-form>select').css('border-color', '#213e53');
        // #213e53
    }
});
/* ~~~~~~~~~~~~~~~~ Booking Form ~~~~~~~~~~~~~~~~~~~~~~~~*/

// Validation and Submission
$(document).on('click', '#service-booking-submit-bttn', function(event) {
    // Book button is clicked, submit form
    $('#service-booking-form').submit();
})

$(document).on('submit', '#service-booking-form', function(event) {
    event.preventDefault();

    // Empty the error field of the booking form
    $('#booking-form-error-mssg').empty();

    let bookingButtonHTML = $('#service-booking-form>button')[0];
    let requestButtonHTML = $('#service-booking-form>button')[1];

    let formData = accountsOperation.dataCollection(this);
    let bookingDataJSON = {}

    for (var value of formData.entries()) {
        bookingDataJSON[value[0]] = value[1];
    }

    if(bookingDataJSON.servicename.trim() === '' || bookingDataJSON.projectdescription.trim() === '' ||
        bookingDataJSON.projectdueTimeHour.trim() === '' || bookingDataJSON.projectdueTimeMinute.trim() === '' ||
        bookingDataJSON.projectduedate.trim() === '' ||
        (bookingDataJSON.projectenquiryprice !== '' && parseFloat(bookingDataJSON.projectenquiryprice) < minimumPriceOfService)){
        if(bookingDataJSON.servicename === ''){
            $('#service-booking-form>select').css('border', '.1rem solid red');
        }
        if(bookingDataJSON.projectduedate===''){
            $('#service-booking-dueDate').css('border', '.1rem solid red');
        }
        if(bookingDataJSON.projectdueTimeHour===''){
            $('.booking-time-picker h5').css('color', 'red');
            $('#bookingHour').css('border', '.1rem solid red');
        }
        if(bookingDataJSON.projectdueTimeMinute===''){
            $('.booking-time-picker h5').css('color', 'red');
            $('#bookingMinute').css('border', '.1rem solid red');
        }
        if(bookingDataJSON.projectenquiryprice !== '' && (parseFloat(bookingDataJSON.projectenquiryprice) < minimumPriceOfService)){
            $('.project-enquiry-price').css('border', '.1rem solid red');
        }
    }else{
        if ($(bookingButtonHTML).is(':visible') && (bookingButtonHTML.innerText).includes('Instant Book')){
            // If the user wants to make an instant booking

            $.ajax({
                method: 'POST',
                url: `/booking/service-booking/instant_booking/${JSON.parse(bookingDataJSON.projectsupplier).freelancerEmail}`,
                data: bookingDataJSON,
                success: function (data) {
                    window.location.replace(data.paymentRoute);
                },
                error: function (error) {
                    let errorMssg = error.responseJSON.error;
                    let errorTag = document.createElement('h4');
                    errorTag.innerText = errorMssg;
                    $('#booking-form-error-mssg').append(errorTag);
                }
            })

        }else if ($(requestButtonHTML).is(':visible') && (requestButtonHTML.innerText) === 'Request'){
            // If the user wants to make a request booking

            bookingDataJSON.projectenquiryprice = (parseFloat(bookingDataJSON.projectenquiryprice).toFixed(2)).toString();

            let regex = /^\d*\.?\d{2}$/;
            if(regex.test(bookingDataJSON.projectenquiryprice)){
                $(this).get(0).setAttribute('action',
                    `${domainName}/booking/service-booking/request_booking/${JSON.parse(bookingDataJSON.projectsupplier).freelancerEmail}`);
                event.currentTarget.submit();
            }else{
                $('.project-enquiry-price').css('border', '.1rem solid red');
            }
        }
    }
})

// Add, Update and Delete booking - helper functions
function findProject(allProjectsContainerHTML, projectID) {
    let projectAtIndex;
    let allProjects = Array.from($(allProjectsContainerHTML)[0].childNodes);
    let projectIndex = allProjects.findIndex(
        singleProject => singleProject.lastChild.value === projectID);

    if(projectIndex === -1){
        return undefined;
    }

    // return both the correct project and its index
    projectAtIndex = allProjects[projectIndex];
    return [projectAtIndex, projectIndex];
}

function timeConversion([hour, minute, ampm], date) {
    let time = (parseInt(hour) + (ampm == 'PM' ? 12 : 0)) + ':' + minute + ':00';
    time = parseInt(time.split(':')[0])>=10 ? time : '0' + time;
    let dateTime = date.trim().split("/").reverse().join("-")+'T'+time.trim()+'Z';
    let timeInMilliSecond = BookingInsertionIndex.prototype.getDueDateMilliseconds(dateTime);

    return [dateTime, timeInMilliSecond];
}

// Dealing with Request booking
socketConnection.socket.on('Booking Data to Freelancer', bookingData => {
    /* With 'Request Booking', the project is inserted to all the bookings area.
    * It never goes to NDP (Next Due Project).
    * all bookings that come here are accept/modify*/

    bookingData.status = freelancerListOfStatus[bookingData.status.freelancer];
    bookingData.price = bookingData.requestedPrice;

    if( $('.freelancer-all-projects').is(':empty') ){
        // There are no project in all projects section
        accountsOperation.createBookingHTML(accountsOperation.createBookingTopHTML(bookingData,
            'freelancer-one-project-top', 'freelancer-one-project-details')
            , 'freelancer-one-project', $('.freelancer-all-projects'));
    }else{
        // There are some projects in the section
        let freelancerAllProjectsBooking = $('.freelancer-all-projects')[0].childNodes;
        freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBooking);
        let newProjectDueDateTime = BookingInsertionIndex.prototype.getDueDateMilliseconds(bookingData.dueDateTime);

        let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
            bookingData.status, bookingData);

        let newProjectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
            bookingData.status, newProjectDueDateTime);

        let place = newProjectInsertionIndex.place;
        let index = newProjectInsertionIndex.index;

        accountsOperation.createBookingHTML(accountsOperation.createBookingTopHTML(bookingData,
            'freelancer-one-project-top', 'freelancer-one-project-details'),
            'freelancer-one-project', $('.freelancer-all-projects'), {place:place,
                HTML: freelancerAllProjectsBooking[index]});
    }
})


// Dealing with instant booking or paid bookings
socketConnection.socket.on('Successful Payment - send to Freelancer', successData => {
    console.log('Success Payment: ', successData)
    let nxtdue_Project = $('.freelancer-projects-top-container')[0];
    successData.status = freelancerListOfStatus[successData.status.freelancer];

    if( !$('.freelancer-all-projects').is(':empty') ){
        // First, we will check whether the project is new or is there already
        // Check for ID in the list of all projects

        let projectAtIndex = findProject('.freelancer-all-projects', successData.bookingID);
        if(projectAtIndex){
            // project is already in the list of all project
            // then delete it. It has a new update
            (projectAtIndex[0]).remove();
        }
    }

    if(nxtdue_Project.childNodes[0].className === 'emptyNextDueProject'){
        // There are no 'booking ongoing' - No next due project
        $('.emptyNextDueProject').remove();
        accountsOperation.createBookingHTML(accountsOperation.createBookingTopHTML(successData,
            'freelancer-projects-top', 'freelancer-projects-top-details'),
            $('.freelancer-projects-top-container'));
    }else{
        let nxtdueProjectDueDateTime = nxtdue_Project.firstChild.childNodes[2].innerText;
        nxtdueProjectDueDateTime = BookingInsertionIndex.prototype.getDueDateMilliseconds(nxtdueProjectDueDateTime);
        let newProjectDueDateTime = BookingInsertionIndex.prototype.getDueDateMilliseconds(successData.dueDateTime);

        if(newProjectDueDateTime < nxtdueProjectDueDateTime){
            console.log('New project is due sooner');
            // New project is due sooner. So, clone the current due project and
            // send it to all projects

            // step 3: Move the previous NDP to all the projects container
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: successData.bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'), {place:'first'});

            // Step 1: Empty next due project(NDP) container
            $('.freelancer-projects-top-container').empty();

            // Step 2: Insert the new NDP to the top
            accountsOperation.createBookingHTML(accountsOperation.createBookingTopHTML(successData,
                'freelancer-projects-top', 'freelancer-projects-top-details'),
                $('.freelancer-projects-top-container'));
        }else{

            // New project is due after the current due project. Send the new
            // project in all due projects

            if( $('.freelancer-all-projects').is(':empty') ){
                // There is only one booking. It is 'booking ongoing' stage
                accountsOperation.createBookingHTML(accountsOperation.createBookingTopHTML(successData,
                    'freelancer-one-project-top', 'freelancer-one-project-details')
                    , 'freelancer-one-project', $('.freelancer-all-projects'));
            }else{
                let freelancerAllProjectsBooking = $('.freelancer-all-projects')[0].childNodes;
                freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBooking);

                let singleProject = findProject('.freelancer-all-projects', successData.bookingID);

                if(singleProject){
                    // Request booking is now paid off
                    freelancerAllProjectsBooking.splice(singleProject[1], 1);
                }

                let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking, successData.status,
                    newProjectDueDateTime);
                // There are multiple projects, so find the right index for insertion
                let newProjectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
                    successData.status, newProjectDueDateTime);

                let place = newProjectInsertionIndex.place;
                let index = newProjectInsertionIndex.index;

                accountsOperation.createBookingHTML(accountsOperation.createBookingTopHTML(successData,
                    'freelancer-one-project-top', 'freelancer-one-project-details'),
                    'freelancer-one-project', $('.freelancer-all-projects'), {place:place,
                        HTML: freelancerAllProjectsBooking[index]});
            }
        }
    }
})

/* The event below deals with the case of the freelancer modifying the terms of the booking, e.g.
* due date, price or description. */
$(document).on('submit', '#booking-modification-form', function(event) {
    event.preventDefault();

    $('.freelancer-booking-modification>p').hide();

    let formData = accountsOperation.dataCollection(this);
    let bookingModifyDataJSON = {}

    for (var value of formData.entries()) {
        bookingModifyDataJSON[value[0]] = value[1];
    }
    let previousDataToModify = JSON.parse(bookingModifyDataJSON.modifyToData);
    let dataToModifyDate = bookingModifyDataJSON.bookingModificationDate;
    let dataToModifyHour = bookingModifyDataJSON.bookingHourModify;
    let dataToModifyMinute = bookingModifyDataJSON.bookingMinuteModify;//bookingMeridiesModify
    let dataToModifyAMPM = bookingModifyDataJSON.bookingMeridiesModify

    //time
    let dataToModifyTime = timeConversion([dataToModifyHour, dataToModifyMinute,
        dataToModifyAMPM], dataToModifyDate);
    let previousTime = timeConversion(previousDataToModify.modifyDueTime, previousDataToModify.modifyDueDate)

    //description
    let dataToModifyDescription = bookingModifyDataJSON.bookingModificationDescription;
    let previousDescription = previousDataToModify.modifyDescription;

    //price
    let dataToModifyPrice = bookingModifyDataJSON.modificationprice;
    let previousPrice = previousDataToModify.modifyPrice;

    // Validate form
    if(dataToModifyTime[1] === previousTime[1] && dataToModifyDescription === previousDescription
        && dataToModifyPrice === previousPrice){
        // No changes to the details, so no update
        $('.freelancer-booking-modification>p').show();
    }else if(dataToModifyDescription === '' || dataToModifyPrice === '' || !(/^\d+(?:\.\d{2})?$/.test(dataToModifyPrice))){
        if(dataToModifyDescription === ''){
            $(event.target.childNodes[1].childNodes[1]).css({'border': '0.1rem solid red'});
        }
        else{
            $(event.target.childNodes[2].childNodes[1]).css({'border': '0.1rem solid red'});
        }
    }else{
        // changes to the details, so update
        let bookingToModifyID = event.target.parentNode.parentNode.lastChild.value;

        let dataToModify = {
            time: dataToModifyTime[0],
            description: dataToModifyDescription,
            price: dataToModifyPrice
        }

        $.ajax({
            method: 'POST',
            url: `/booking/project-modification/${bookingToModifyID}`,
            data: dataToModify,
            success: function (data) {
                let bookingDetailUpdate = data;
                let modifyData = data.bookingModificationConversation[data.bookingModificationConversation.length - 1];
                let singleProject = findProject('.freelancer-all-projects',
                    bookingDetailUpdate.bookingID);
                let projectAtIndex = singleProject[0];
                let singleProjectIndex = singleProject[1];

                let freelancerAllProjectsBooking = Array.from($('.freelancer-all-projects')[0].childNodes);

                $('.freelancer-all-projects').children().eq(singleProjectIndex).remove();
                freelancerAllProjectsBooking.splice(singleProjectIndex, 1);

                // Update frontend
                let projectBookingDetails = projectAtIndex.childNodes[1].childNodes[0];
                $(projectBookingDetails).empty();
                accountsOperation.createBookingModificationHTML(data, modifyData, projectBookingDetails);
                projectAtIndex.childNodes[0].childNodes[3].innerText =
                    freelancerListOfStatus[bookingDetailUpdate.status.freelancer];

                if(freelancerAllProjectsBooking.length === 0){
                    // There are no projects left in the list of all the projects
                    $('.freelancer-all-projects').empty();
                    accountsOperation.createBookingHTML(Array.from(projectAtIndex.childNodes),
                        'freelancer-one-project', $('.freelancer-all-projects'));
                }else{
                    let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
                        freelancerListOfStatus[bookingDetailUpdate.status.freelancer],
                        BookingInsertionIndex.prototype.getDueDateMilliseconds(bookingDetailUpdate.dueDateTime));

                    let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
                        freelancerListOfStatus[bookingDetailUpdate.status.freelancer],
                        BookingInsertionIndex.prototype.getDueDateMilliseconds(bookingDetailUpdate.dueDateTime));

                    accountsOperation.createBookingHTML(Array.from(projectAtIndex.childNodes),
                        'freelancer-one-project', $('.freelancer-all-projects'),
                        {place: projectInsertionIndex.place,
                            HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});
                    $(projectAtIndex).remove();
                }
                $(event.target.parentNode.parentNode.parentNode.parentNode).hide();
            },
            error: function (error) {
                console.log('Error occurred in Modification');
            }
        })
    }
})


/* The two following socket events deal with the case of the freelancer accepting the term of the
* project - the project might have gone through modification. */
socketConnection.socket.on('Accept project on Freelancer side', AcceptData => {
    let freelancerAllProjectsBooking = $('.freelancer-all-projects')[0].childNodes;
    freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBooking);

    let updatedProject = freelancerAllProjectsBooking[AcceptData.projectIndex];

    BookingInsertionIndex.prototype.updateProjectStatus(updatedProject,
        freelancerListOfStatus[AcceptData.status]);

    let updateProjectDueTime = BookingInsertionIndex.prototype.getProjectDueTime(updatedProject);
    updateProjectDueTime = BookingInsertionIndex.prototype.getDueDateMilliseconds(
        updateProjectDueTime);

    // Update background-color of the status
    $(updatedProject.firstChild.childNodes[3]).css(
        {
            'border': '.1rem solid #8d2874',
            'background-color':'#8d2874'
        }
    )

    // when the booking went through modification, there is
    // a need to update the look of the details as well
    if(AcceptData.fromStatus === 'awaiting response'){
        let originalData = updatedProject.childNodes[1].childNodes[0].childNodes[0].childNodes[1];
        let projectDetailsUpdate =
            `<div><h4>Creation Date: <span>${originalData.childNodes[0].childNodes[1].innerText}</span></h4>`+
            `<div class="bookingDetails-showOnMobileResponsive">`+
            `<h4>Client Name: <span> ${originalData.childNodes[1].childNodes[0].childNodes[1].innerText} </span></h4>`+
            `<h4>Due Date: <span> ${originalData.childNodes[1].childNodes[1].childNodes[1].innerText} </span></h4>`+
            `</div>`+
            `<div class="freelancer-project-details-descritpion">`+
            `<h4>Description:</h4>`+
            `<p>${originalData.childNodes[2].childNodes[1].innerText}</p>`+
            `</div>`+
            `<h4> Price: ${originalData.childNodes[3].childNodes[1].innerText}</h4>`+
            `</div>`;
        $(updatedProject.childNodes[1].childNodes[0]).empty();
        updatedProject.childNodes[1].childNodes[0].innerHTML = projectDetailsUpdate;
    }

    // Create `Reject` button
    let acceptButtonOptions = updatedProject.childNodes[1].childNodes[1];
    $(acceptButtonOptions).empty();
    acceptButtonOptions.innerHTML = `<button id="freelancer-booking-delete-button">`+
        `Reject</button>`

    freelancerAllProjectsBooking.splice(AcceptData.projectIndex, 1);

    let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
        freelancerListOfStatus[AcceptData.status],
        updateProjectDueTime);

    if(freelancerAllProjectsBooking.length === 0){
        // There are no projects left in the list of all the projects
        $('.freelancer-all-projects').empty();
        accountsOperation.createBookingHTML(Array.from(updatedProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'));
    }else{
        // There are still porject
        let newProjectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
            freelancerListOfStatus[AcceptData.status], updateProjectDueTime);

        let place = newProjectInsertionIndex.place;
        let index = newProjectInsertionIndex.index;

        // remove element from frontend before putting it in its new position
        //$(freelancerAllProjectsBookingHTML[AcceptData.projectIndex]).remove();
        $('.freelancer-all-projects').children().eq(AcceptData.projectIndex).remove();

        // Insert Element in its position
        accountsOperation.createBookingHTML(Array.from(updatedProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'),
            {place:place, HTML: freelancerAllProjectsBooking[index]});
    }

    if(AcceptData.fromStatus === 'awaiting response'){
        $('.freelancer-booking-completion-rejection').hide();
    }

})

socketConnection.socket.on('Accept project on Client side', acceptData => {
    // Update Status
    console.log('Freelancer has accepted project details normal/modified');
    let fromStatus = acceptData.fromStatus;

    acceptData = acceptData.bookingDetailUpdate;
    let bookingID = acceptData.bookingID;
    let status = clientListOfStatus[acceptData.status.client];

    let projectToUpdate = findProject('.client-bookings-body',
        bookingID)[0];
    let projectToUpdateStatus = projectToUpdate.childNodes[0].childNodes[0].childNodes[3]
        .childNodes[0];

    projectToUpdateStatus.innerText = status;
    $(projectToUpdateStatus).css(
        {
            'border': '.1rem solid #8d2874',
            'background-color':'#8d2874'
        }
    )
    if(fromStatus === 'please respond'){
        // Update Booking Details
        let projectAcceptedDetails = `<h4>Creation Date: ${new Date(acceptData.creationDate).toLocaleString(locale)}</h4>`+
            `<div class="bookingDetails-showOnMobileResponsive"><h4>Freelancer Name: <span>${acceptData.supplier.name}</span>`+
            `</h4><h4>Due Date: <span>${new Date(acceptData.dueDateTime).toLocaleString(locale)}</span></h4></div>`+
            `<div class="client-booking-descrption-details"><h4>Description:</h4>`+
            `<p>${acceptData.projectDescription}</p></div><h4>Cost: £${acceptData.price}</h4>`;

        let projectDetailsDivContainer = projectToUpdate.childNodes[1].childNodes[0].childNodes[0];
        $(projectDetailsDivContainer).empty();
        $(projectDetailsDivContainer).append(projectAcceptedDetails);
    }

    // Enable pay button
    let projectButtons = projectToUpdate.childNodes[1].childNodes[0].lastChild;
    let buttonHTML = projectButtons.childNodes[0];

    if(buttonHTML.innerText === 'Pay'){
        $(buttonHTML.firstChild).prop('disabled' , false);
        $(buttonHTML.firstChild).css('cursor' , 'pointer');
        $(buttonHTML).css('opacity' , '100%');
    }else if(buttonHTML.innerText === 'Accept'){
        // remove 'Accept' button to add 'Pay' button
        let paymentURL = `${domainName}/payment/create-checkout-session/booking-checkout?bookingID=${bookingID}`;
        let payButtonHTML = `<a href=${paymentURL}><button>Pay</button></a>`;

        $(projectButtons).children().eq(0).remove();
        $(projectButtons).prepend(payButtonHTML);
    }

})

/* Once the booking has been modified, there is a possibility of either the client
* and freelancer to accept the terms of the project set by the other. In the two socket
* events below, we are listening to when the client accept the term set by the freelancer */
socketConnection.socket.on('Accept modified booking on Freelancer side', modified_accpeptedBookingData => {
    console.log(modified_accpeptedBookingData);
    let freelancerAllProjectsBooking = $('.freelancer-all-projects')[0].childNodes;
    freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBooking);

    let projectDetails = findProject('.freelancer-all-projects',
        modified_accpeptedBookingData.bookingID);
    let updatedProject = projectDetails[0];
    let projectIndex = projectDetails[1];

    let updateProjectDueTime = modified_accpeptedBookingData.dueDateTime;
    updateProjectDueTime = BookingInsertionIndex.prototype.getDueDateMilliseconds(
        updateProjectDueTime);
    let projectStatus = freelancerListOfStatus[modified_accpeptedBookingData.status.freelancer];

    let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
        projectStatus,
        updateProjectDueTime);

    /* Front-End Update */
    // Progress Status Update
    BookingInsertionIndex.prototype.updateProjectStatus(updatedProject,
        projectStatus);
    $(updatedProject.firstChild.childNodes[3]).css(
        {
            'border': '.1rem solid #8d2874',
            'background-color':'#8d2874'
        }
    )

    // Due Date Update
    BookingInsertionIndex.prototype.updateProjectDueDate(updatedProject, new Date(updateProjectDueTime).toLocaleString(locale));

    // Description & Project Details update
    let acceptedDetailsUpdate =
        `<div><h4>Creation Date: <span>${new Date(modified_accpeptedBookingData.creationDate).toLocaleString(locale)}</span></h4>`+
        `<div class="bookingDetails-showOnMobileResponsive"><h4>Client Name: `+
        `<span>${modified_accpeptedBookingData.customer.name}</span></h4><h4>Due Date: <span>`+
        `${new Date(modified_accpeptedBookingData.dueDateTime).toLocaleString(locale)}</span></h4></div>`+
        `<div class="freelancer-project-details-descritpion"><h4>Description:</h4><p>`+
        `${modified_accpeptedBookingData.projectDescription}</p></div><h4>Price: £`+
        `${modified_accpeptedBookingData.price}</h4></div>`;
    $(updatedProject.childNodes[1].childNodes[0]).empty();
    updatedProject.childNodes[1].childNodes[0].innerHTML = acceptedDetailsUpdate;

    // Update buttons
    let acceptButtonOptions = updatedProject.childNodes[1].childNodes[1];
    $(acceptButtonOptions).empty();
    acceptButtonOptions.innerHTML = `<button id="freelancer-booking-delete-button">`+
        `Reject</button>`

    // Update Position of the project on the frontend
    freelancerAllProjectsBooking.splice(projectIndex, 1);

    if(freelancerAllProjectsBooking.length === 0){
        // There are no projects left in the list of all the projects
        $('.freelancer-all-projects').empty();
        accountsOperation.createBookingHTML(Array.from(updatedProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'));
    }else{
        // There are still porject
        let projectNewInsertionIndex =
            bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
            projectStatus, updateProjectDueTime);

        $('.freelancer-all-projects').children().eq(projectIndex).remove();

        accountsOperation.createBookingHTML(Array.from(updatedProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'),
            {place:projectNewInsertionIndex.place,
                HTML: freelancerAllProjectsBooking[projectNewInsertionIndex.index]});
    }
})

socketConnection.socket.on('Accept modified booking on Client side', modified_accpeptedBookingData => {
    console.log('Modified Data: ', modified_accpeptedBookingData);
    let bookingID = modified_accpeptedBookingData.bookingID;
    let projectToUpdate = findProject('.client-bookings-body', bookingID)[0];
    let projectStatus = clientListOfStatus[modified_accpeptedBookingData.status.client];
    let projectCreationDate = new Date(modified_accpeptedBookingData.creationDate).toLocaleString(locale);
    let projectDueDate = new Date(modified_accpeptedBookingData.dueDateTime).toLocaleString(locale);
    let projectDescription = modified_accpeptedBookingData.projectDescription;
    let projectPrice = modified_accpeptedBookingData.price;

    // Update Booking Status
    let projectToUpdateStatus = projectToUpdate.childNodes[0].childNodes[0].childNodes[3]
        .childNodes[0];
    projectToUpdateStatus.innerText = projectStatus;
    $(projectToUpdateStatus).css(
        {
            'border': '.1rem solid #8d2874',
            'background-color':'#8d2874'
        }
    )

    // Update Booking Due Date
    let projectToUpdateDueDate = projectToUpdate.childNodes[0].childNodes[0].childNodes[2];
    projectToUpdateDueDate.innerText = projectDueDate;

    // update booking details
    let projectUpdateDetailsHTML = projectToUpdate.childNodes[1].childNodes[0];

    // - update description and price
    let projectUpdateDetailsTopHTML = projectUpdateDetailsHTML.childNodes[0];
    $(projectUpdateDetailsTopHTML).empty();
    projectUpdateDetailsTopHTML.innerHTML = `<h4>Creation Date: ${projectCreationDate}`+
        `</h4>`+`<div class="bookingDetails-showOnMobileResponsive"><h4>Freelancer Name: `+
        `<span>${modified_accpeptedBookingData.supplier.name}</span></h4><h4>Due Date: `+
        `<span>${projectDueDate}</span></h4></div>`+
        `<div class="client-booking-descrption-details"><h4>Description:</h4>`+
        `<p>${projectDescription}</p></div><h4>Cost: £${projectPrice}</h4>`;

    // - update buttons option
    let projectUpdateButtonsHTML = projectUpdateDetailsHTML.childNodes[1];
    $(projectUpdateButtonsHTML).empty();
    let paymentURL = `${domainName}/payment/create-checkout-session/booking-checkout?bookingID=${bookingID}`;
    projectUpdateButtonsHTML.innerHTML = `<a href=${paymentURL}><button>Pay</button></a>`+
        `<a id="booking-side-message-bttn"><p>Message</p><i class="far fa-envelope"><input `+
        `type="hidden" id="freelancerToMessageUUID" value=${modified_accpeptedBookingData.supplier.uuid}></i></a>`+
        `<button class="delete-booking-bttn">Delete</button>`;

    // Hide Completion Conversation Modal
    $('.client-account-modal').hide();
})

/* Acceptance booking terms sent to the client */
socketConnection.socket.on('Booking Modification to Client', modificationData => {
    console.log('Modification Button: ', modificationData);
    let bookingDetailUpdate = modificationData;
    let modifyData = modificationData.bookingModificationConversation;
    let lastModificationConversationIndex = modifyData.length - 1;
    let lastModifyConversationData = modifyData[lastModificationConversationIndex];

    let projectToUpdate = findProject('.client-bookings-body',
        modificationData.bookingID)[0];
    let projectToUpdateStatus = projectToUpdate.childNodes[0].childNodes[0].childNodes[3]
        .childNodes[0];
    projectToUpdateStatus.innerText = clientListOfStatus[modificationData.status.client];
    let projectDetailsTopContainer = projectToUpdate.childNodes[1].childNodes[0].childNodes[0];
    $(projectDetailsTopContainer).empty();
    console.log(projectDetailsTopContainer);
    accountsOperation.bookingModificationClientSide(modificationData,
        lastModifyConversationData, projectDetailsTopContainer);

    let buttonsHTML = projectToUpdate.childNodes[1].childNodes[0].childNodes[1];

    $(buttonsHTML.childNodes[0]).hide();
    $(buttonsHTML).prepend('<button class="client-accept-booking-bttn">Accept</button>');
})


/*** Completion ***/

/* The following two socket events right below handle the process of which the freelancer
* signals the completion of a booking. */

// The event righ below is for the update on the freelancer side
socketConnection.socket.on('Booking Completion - Request to Freelancer', finishData => {
    // 'Booking Completion - Request to Freelancer'
    let nxtdue_Project = $('.freelancer-projects-top-container')[0];
    let projectStatus = freelancerListOfStatus[finishData.status.freelancer];
    let bookingID = finishData.bookingID;

    if(bookingID === nxtdue_Project.lastChild.value){
        // Next Due project is completed
        BookingInsertionIndex.prototype.updateProjectStatus(nxtdue_Project, projectStatus);
        projectBookingCompletion_cssUpdate(nxtdue_Project);

        if( $('.freelancer-all-projects').is(':empty') ){
            // Move project to all other projects
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'));

            // Empty Next Due Project Container
            $('.freelancer-projects-top-container').empty();

            // Show a message to show that it is indeed empty
            let emptyNextDueProjectHTML = document.createElement('p');
            emptyNextDueProjectHTML.classList.add('emptyNextDueProject');
            emptyNextDueProjectHTML.innerText = 'No Next Due Project'
            $('.freelancer-projects-top-container').append(emptyNextDueProjectHTML);
        }else{
            let freelancerAllProjectsBookingHTML = $('.freelancer-all-projects')[0];
            let freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBookingHTML.childNodes);
            let singleProject = freelancerAllProjectsBookingHTML.childNodes[0];

            let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
                projectStatus,
                BookingInsertionIndex.prototype.getDueDateMilliseconds(finishData.dueDateTime));

            let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
                projectStatus,
                BookingInsertionIndex.prototype.getDueDateMilliseconds(finishData.dueDateTime));

            // Move project to all other projects
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'),
                {place: projectInsertionIndex.place,
                    HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});

            // Empty Next Due Project Container
            $('.freelancer-projects-top-container').empty();

            // Possibly the move the next 'booking ongoing' project to the top.
            // Otherwise, leave an empty message at the top.
            if(BookingInsertionIndex.prototype.getProjectStatus(singleProject) === 'booking ongoing'){
                // Send the project from the list of all projects to the Next Due project
                accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(singleProject,
                    {bookingID: singleProject.lastChild.value},
                    'freelancer-projects-top', 'freelancer-projects-top-details'),
                    $('.freelancer-projects-top-container'));
                $(singleProject).remove();
            }else{
                let emptyNextDueProjectHTML = document.createElement('p');
                emptyNextDueProjectHTML.classList.add('emptyNextDueProject');
                emptyNextDueProjectHTML.innerText = 'No Next Due Project'
                $('.freelancer-projects-top-container').append(emptyNextDueProjectHTML);
            }
        }
    }else{
        // The project completed is in the list of all the project.

        // Find the project
        let freelancerAllProjectsBookingHTML = $('.freelancer-all-projects')[0];
        let freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBookingHTML.childNodes)

        let singleProject = findProject('.freelancer-all-projects', bookingID);
        let projectIndex = singleProject[1];
        singleProject = singleProject[0];
        BookingInsertionIndex.prototype.updateProjectStatus(singleProject, projectStatus);
        projectBookingCompletion_cssUpdate(singleProject);

        freelancerAllProjectsBooking.splice(projectIndex, 1);

        let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
            projectStatus,
            BookingInsertionIndex.prototype.getDueDateMilliseconds(finishData.dueDateTime));

        let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
            projectStatus,
            BookingInsertionIndex.prototype.getDueDateMilliseconds(finishData.dueDateTime));

        // Move project to all other projects
        accountsOperation.createBookingHTML(Array.from(singleProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'),
            {place: projectInsertionIndex.place,
                HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});

        $(singleProject).remove();
    }

    // Hide Completion Conversation Modal
    $('.freelancer-booking-completion-rejection').hide();
})

// The event below is for the update on the client side
socketConnection.socket.on('Booking Completion - Request to Client', finishData => {

    let bookingID = finishData.bookingID;
    let projectStatus = clientListOfStatus[finishData.status.freelancer];
    let allprojects = Array.from($('.client-bookings-body')[0].childNodes);
    let singleProject = findProject('.client-bookings-body', bookingID)[0];

    singleProject.firstChild.firstChild.childNodes[3].firstChild.innerText= projectStatus;
    $(singleProject.firstChild.firstChild.childNodes[3].firstChild).css(
        {
            'border': '.1rem solid #308634',
            'background-color':'#308634'
        }
    )
    $(singleProject.childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[0]).show();
    singleProject.childNodes[1].childNodes[1]
        .childNodes[0].childNodes[0].childNodes[1].innerText =
        `Date of Completion:${new Date(finishData.completionDate).toLocaleString(locale)}`
    $(singleProject.childNodes[1].childNodes[1].childNodes[1]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2]).hide();
    $(singleProject).clone().appendTo($('.client-bookings-body'));
    $(singleProject).remove();
})

function projectBookingCompletion_cssUpdate(html) {
    $(html.firstChild.childNodes[3]).css(
        {
            'border': '.1rem solid #308634',
            'background-color':'#308634'
        }
    )

    $(html.childNodes[1].childNodes[1].firstChild).attr('disabled','disabled');
    $(html.childNodes[1].childNodes[1].lastChild).attr('disabled','disabled');

    $(html.childNodes[1].childNodes[1].firstChild).css(
        {
            'cursor':'not-allowed',
            'opacity':'50%'
        }
    )
    $(html.childNodes[1].childNodes[1].lastChild).css(
        {
            'disabled': 'true',
            'cursor':'not-allowed',
            'opacity':'50%'
        }
    )
    $(html.childNodes[1].childNodes[0]).hide();
    $(html.childNodes[1].childNodes[1]).hide();
    $(html.childNodes[1].childNodes[2]).show();
    $(html.childNodes[1].childNodes[2].childNodes[0]).show();
    $(html.childNodes[1].childNodes[2].childNodes[0].childNodes[1]).hide();
}


/*** Completion Confirmation ***/

/* After the freelancer has signalled the completion of the project, the client
* has to confirm the completion of the project. The events below handle the positive
* confirmation of the competion on the client and freelancer side */

// Confirmation sent to client
socketConnection.socket.on('Booking Completion Confirmation - to Client', confirmData => {
    console.log('booking compeltion confirmation (client): ', confirmData);
    let bookingID = confirmData.bookingCompletionConfirmedID;
    let singleProject = findProject('.client-bookings-body', bookingID)[0];

    singleProject.firstChild.firstChild.childNodes[3].firstChild.innerText= 'thank you!';

    $(singleProject.childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[1]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2]).show();

    // Close modal
    $(singleProject.parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling).hide();
})

// Confirmation sent to Freelancer
socketConnection.socket.on('Booking Completion Confirmation - to Freelancer', confirmData => {
    console.log('booking compeltion confirmation (Freelancer): ', confirmData);
    // Find the project
    let bookingID = confirmData.bookingCompletionConfirmedID;
    let singleProject = findProject('.freelancer-all-projects', bookingID)[0];
    BookingInsertionIndex.prototype.updateProjectStatus(singleProject, 'confirmed, well done!');
})

/*** Completion Conflict ****/
/* As well as the client confirming the completion of a project, there is also a possibility
* of rejecting the information from the freelancer. This does result in a conflict, which will
* then be passed the adminstration staff to resolve. */


// Update client side on conflict occurrence
socketConnection.socket.on('Booking Completion Conflict - to Client', conflictData => {
    let bookingID = conflictData.bookingCompletionConflictID;
    let singleProject = findProject('.client-bookings-body', bookingID)[0];
    singleProject.firstChild.firstChild.childNodes[3].firstChild.innerText= 'awaiting resolution';
    $(singleProject.firstChild.firstChild.childNodes[3].firstChild).css(
        {
            'border': '.1rem solid #FF0000',
            'background-color':'#FF0000'
        }
    )

    $(singleProject.childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[1]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2].firstChild.childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2].firstChild.childNodes[1]).show();

    // Close modal
    $(singleProject.parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling).hide();
})

// Update Freelancer side on conflict occurrence
socketConnection.socket.on('Booking Completion Conflict - to Freelancer', conflictData => {
    // Find the project

    let bookingID = conflictData.bookingID;
    let projectToUpdate = findProject('.freelancer-all-projects', bookingID);
    let singleProject = projectToUpdate[0];
    let projectIndex = projectToUpdate[1];
    let bookingDueTime = BookingInsertionIndex.prototype.getDueDateMilliseconds(conflictData.dueDateTime);
    let status = freelancerListOfStatus[conflictData.status.freelancer];

    BookingInsertionIndex.prototype.updateProjectStatus(singleProject, 'awaiting resolution');
    $(singleProject.firstChild.childNodes[3]).css(
        {
            'border': '.1rem solid #FF0000',
            'background-color':'#FF0000'
        }
    )
    $(singleProject.childNodes[1].childNodes[2].firstChild.childNodes[1]).show();

    let freelancerAllProjectsBookingHTML = $('.freelancer-all-projects')[0].childNodes;
    let freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBookingHTML);
    freelancerAllProjectsBooking.splice(projectIndex, 1);

    let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
        status, bookingDueTime);

    let newProjectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
        status, bookingDueTime);
    console.log(newProjectInsertionIndex);
    let place = newProjectInsertionIndex.place;
    let index = newProjectInsertionIndex.index;

    accountsOperation.createBookingHTML(Array.from(singleProject.childNodes),
        'freelancer-one-project', $('.freelancer-all-projects'),
        {place:place, HTML: freelancerAllProjectsBooking[index]});

    $(singleProject).remove();
})

/*** Booking Cancelled - Freelancer ****/

/* Once a booking is ongoing (it has been paid for), the freelancer can still cancel the project
* but they will need to provide the justification of this. */

// ongoing booking cancel on freelancer side
socketConnection.socket.on('Ongoing Project Cancel on Freelancer side', cancelData => {

    let bookingID = cancelData.bookingID;
    let projectStatus = freelancerListOfStatus[cancelData.status.freelancer];
    let dueDateTime = BookingInsertionIndex.prototype
        .getDueDateMilliseconds(cancelData.dueDateTime);
    let nxtdue_Project = $('.freelancer-projects-top-container')[0];

    if(bookingID === nxtdue_Project.lastChild.value){
        // Next Due project is cancelled
        BookingInsertionIndex.prototype.updateProjectStatus(nxtdue_Project, projectStatus);
        projectCancellation_cssUpdate(nxtdue_Project);

        if( $('.freelancer-all-projects').is(':empty') ){
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'));
            $('.freelancer-projects-top-container').empty();

            let emptyNextDueProjectHTML = document.createElement('p');
            emptyNextDueProjectHTML.classList.add('emptyNextDueProject');
            emptyNextDueProjectHTML.innerText = 'No Next Due Project'
            $('.freelancer-projects-top-container').append(emptyNextDueProjectHTML);
        }else{
            let freelancerAllProjectsBookingHTML = $('.freelancer-all-projects')[0];
            let freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBookingHTML.childNodes);
            let singleProject = freelancerAllProjectsBookingHTML.childNodes[0];

            let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
                projectStatus, dueDateTime);

            let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
                projectStatus, dueDateTime);

            // Move project to all other projects
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'),
                {place: projectInsertionIndex.place,
                    HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});

            // Empty Next Due Project Container
            $('.freelancer-projects-top-container').empty();

            if(BookingInsertionIndex.prototype.getProjectStatus(singleProject) === 'booking ongoing'){
                // Send the project from the list of all projects to the Next Due project
                accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(singleProject,
                    {bookingID: singleProject.lastChild.value},
                    'freelancer-projects-top', 'freelancer-projects-top-details'),
                    $('.freelancer-projects-top-container'));
                $(singleProject).remove();
            }else{
                let emptyNextDueProjectHTML = document.createElement('p');
                emptyNextDueProjectHTML.classList.add('emptyNextDueProject');
                emptyNextDueProjectHTML.innerText = 'No Next Due Project'
                $('.freelancer-projects-top-container').append(emptyNextDueProjectHTML);
            }
        }
    }else{
        // The porject is not in the Next Due section, so go to all projects

        // Find the project
        let freelancerAllProjectsBooking = $('.freelancer-all-projects')[0].childNodes;
        freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBooking);

        let singleProject = findProject('.freelancer-all-projects', bookingID);
        let projectIndex = singleProject[1];
        singleProject = singleProject[0];
        BookingInsertionIndex.prototype.updateProjectStatus(singleProject, 'cancelled');
        projectCancellation_cssUpdate(singleProject);

        freelancerAllProjectsBooking.splice(projectIndex, 1);

        let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
            projectStatus, dueDateTime);

        let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
            projectStatus, dueDateTime);

        // Move project to all other projects
        accountsOperation.createBookingHTML(Array.from(singleProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'),
            {place: projectInsertionIndex.place,
                HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});

        $(singleProject).remove();
    }
})

function projectCancellation_cssUpdate(html) {
    let allprojectsContainer = html.parentNode.parentNode;
    $(html.firstChild.childNodes[3]).css(
        {
            'border': '.1rem solid #FF0000',
            'background-color':'#FF0000'
        }
    )

    if(allprojectsContainer.className !== 'booking-section-container'){
        allprojectsContainer = allprojectsContainer.parentNode;
    }

    $(html.childNodes[1].childNodes[1]).hide();
    $(allprojectsContainer.nextSibling).hide();
}

socketConnection.socket.on('Ongoing Project Cancel on Client side', cancelData => {
    console.log('Booking ongoing Cancel client side: ', cancelData)
    let bookingID = cancelData.bookingID;
    let singleProject = findProject('.client-bookings-body', bookingID)[0];

    singleProject.firstChild.firstChild.childNodes[3].firstChild.innerText= 'cancelled';
    $(singleProject.firstChild.firstChild.childNodes[3].firstChild).css(
        {
            'border': '.1rem solid #FF0000',
            'background-color':'#FF0000'
        }
    )
    $(singleProject.childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[1]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2]).hide();
    $(singleProject).clone().appendTo($('.client-bookings-body'));
    $(singleProject).remove();
})

/*** Booking Cancelled - Client ****/

/* The client can also cancel the project whilst it is ongoing. Since the booking is ongoing,
* there is a possibility that the freelancer already started the work. So, a compensation
* might be in place in this case. */

// Cancel on client side
socketConnection.socket.on('Booking ongoing Cancel on Client side', cancelData => {

    let bookingID = cancelData.bookingToDeleteID;
    let singleProject = findProject('.client-bookings-body', bookingID)[0];

    singleProject.firstChild.firstChild.childNodes[3].firstChild.innerText= 'cancelled';
    $(singleProject.firstChild.firstChild.childNodes[3].firstChild).css(
        {
            'border': '.1rem solid #FF0000',
            'background-color':'#FF0000'
        }
    )
    $(singleProject.childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[0]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[1]).hide();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2].firstChild.childNodes[0]).show();
    $(singleProject.childNodes[1].childNodes[1].childNodes[2].firstChild.childNodes[1]).hide();
    $(singleProject).clone().appendTo($('.client-bookings-body'));

    // Close modal and remove project
    $(singleProject.parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling).hide();
    $(singleProject).remove();
})


// Cancel on freelancer side
socketConnection.socket.on('Booking ongoing Cancel on Freelancer side', cancelData => {

    let bookingID = cancelData.bookingID;
    let projectStatus = freelancerListOfStatus[cancelData.status.freelancer];
    let dueDateTime = BookingInsertionIndex.prototype
        .getDueDateMilliseconds(cancelData.dueDateTime);
    let nxtdue_Project = $('.freelancer-projects-top-container')[0];

    if(bookingID === nxtdue_Project.lastChild.value){
        // Next Due project is cancelled
        BookingInsertionIndex.prototype.updateProjectStatus(nxtdue_Project, projectStatus);
        projectCancellation_cssUpdate(nxtdue_Project);

        if( $('.freelancer-all-projects').is(':empty') ){
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'));

            $('.freelancer-projects-top-container').empty();

            let emptyNextDueProjectHTML = document.createElement('p');
            emptyNextDueProjectHTML.classList.add('emptyNextDueProject');
            emptyNextDueProjectHTML.innerText = 'No Next Due Project';
            $('.freelancer-projects-top-container').append(emptyNextDueProjectHTML);
        }else{
            let freelancerAllProjectsBookingHTML = $('.freelancer-all-projects')[0];
            let freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBookingHTML.childNodes);
            let singleProject = freelancerAllProjectsBookingHTML.childNodes[0];

            let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
                projectStatus, dueDateTime);

            let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
                projectStatus, dueDateTime);

            // Move project to all other projects
            accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(nxtdue_Project,
                {bookingID: bookingID},
                'freelancer-one-project-top', 'freelancer-one-project-details'),
                'freelancer-one-project', $('.freelancer-all-projects'),
                {place: projectInsertionIndex.place,
                    HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});

            // Empty Next Due Project Container
            $('.freelancer-projects-top-container').empty();

            if(BookingInsertionIndex.prototype.getProjectStatus(singleProject) === 'booking ongoing'){
                // Send the project from the list of all projects to the Next Due project
                accountsOperation.createBookingHTML(accountsOperation.moveProjectBooking(singleProject,
                    {bookingID: singleProject.lastChild.value},
                    'freelancer-projects-top', 'freelancer-projects-top-details'),
                    $('.freelancer-projects-top-container'));
                $(singleProject).remove();
            }else{
                let emptyNextDueProjectHTML = document.createElement('p');
                emptyNextDueProjectHTML.classList.add('emptyNextDueProject');
                emptyNextDueProjectHTML.innerText = 'No Next Due Project';
                $('.freelancer-projects-top-container').append(emptyNextDueProjectHTML);
            }
        }
    }else{
        // The porject is not in the Next Due section, so go to all projects

        // Find the project
        let freelancerAllProjectsBooking = $('.freelancer-all-projects')[0].childNodes;
        freelancerAllProjectsBooking = Array.from(freelancerAllProjectsBooking);

        let singleProject = findProject('.freelancer-all-projects', bookingID);
        let projectIndex = singleProject[1];
        singleProject = singleProject[0];
        BookingInsertionIndex.prototype.updateProjectStatus(singleProject, 'cancelled');
        clientprojectCancellation_cssUpdate(singleProject);

        freelancerAllProjectsBooking.splice(projectIndex, 1);

        let bookingInsertion = new BookingInsertionIndex(freelancerAllProjectsBooking,
            projectStatus, dueDateTime);

        let projectInsertionIndex = bookingInsertion.findProjectInsertionIndex(freelancerAllProjectsBooking,
            projectStatus, dueDateTime);

        // Move project to all other projects
        accountsOperation.createBookingHTML(Array.from(singleProject.childNodes),
            'freelancer-one-project', $('.freelancer-all-projects'),
            {place: projectInsertionIndex.place,
                HTML: freelancerAllProjectsBooking[projectInsertionIndex.index]});
        $(singleProject).remove();
    }
})

function clientprojectCancellation_cssUpdate(html) {
    let allprojectsContainer = html.parentNode.parentNode;
    $(html.firstChild.childNodes[3]).css(
        {
            'border': '.1rem solid #FF0000',
            'background-color':'#FF0000'
        }
    )

    if(allprojectsContainer.className !== 'booking-section-container'){
        allprojectsContainer = allprojectsContainer.parentNode;
    }

    $(html.childNodes[1].childNodes[0]).hide();
    $(html.childNodes[1].childNodes[1]).hide();
    $(html.childNodes[1].childNodes[2]).show();
    $(html.childNodes[1].childNodes[2].childNodes[0]).hide();
    $(html.childNodes[1].childNodes[2].childNodes[1]).show();
    $(allprojectsContainer.nextSibling).hide();
}


/*** Booking Delete ***/

// Freelancer Request
socketConnection.socket.on('Delete project on Freelancer side', deleteData => {
    console.log('Data Deletion (Freelancer Side): ', deleteData)
    let bookingID = deleteData.projectToCancelID;
    let singleProject = findProject('.freelancer-all-projects', bookingID)[0];
    $(singleProject).remove();
})

socketConnection.socket.on('Delete project on Client side', deleteData => {
    console.log('Data Deletion (Client Side): ', deleteData)
    let bookingID = deleteData.projectToCancelID;
    let singleProject = findProject('.client-bookings-body', bookingID)[0];
    $(singleProject).remove();
})

// Client Request
socketConnection.socket.on('Booking Delete on Client side - Client Request', deleteData => {
    console.log('Data Deletion (Client Side): ', deleteData)
    let bookingID = deleteData.bookingToDeleteID;
    let singleProject = findProject('.client-bookings-body', bookingID)[0];
    $(singleProject).remove();
})

socketConnection.socket.on('Booking Delete on Freelancer side - Client Request', deleteData => {
    console.log('Data Deletion (Freelancer Side): ', deleteData)
    let bookingID = deleteData.bookingToDeleteID;
    let singleProject = findProject('.freelancer-all-projects', bookingID)[0];
    $(singleProject).remove();
})