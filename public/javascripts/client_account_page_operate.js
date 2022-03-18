import * as accountsOperation from './account_operate.js';
import * as socketConnection from './socketio-connection-client-side.js'

/*
* The sections of the freelancer page will need to be hidden, and shown
* only the one that the user has clicked on. The 'main profile information'
* will be the default once the page has loaded.
* */

let clientProfileSections = $('.client-account-middle')[0].childNodes;
let clientsectionNames = $('.client-account-left ul li');

$(document).ready(function(){
    $(clientsectionNames).click(function(){
        accountsOperation.pageDispalyStyle(this, clientsectionNames,
            clientProfileSections);
    });

    // on page load, if the intention is to message another user,
    // the following code helps to initiate the conversation.
    let clientMessage_pageToGo = clientsectionNames[2];
    if(clientMessage_pageToGo.id === 'show-user-messages'){
        accountsOperation.pageDispalyStyle(clientMessage_pageToGo, clientsectionNames,
            clientProfileSections);
    }

    /* CLient Booking Communication */
    if( $('.client-bookings-body')[0].firstChild.id !== 'clientBookingEmpty' ){
        let allClientBookings = $('.client-bookings-body')[0].childNodes;

        allClientBookings.forEach(singleBooking => {
            let statusHTML = singleBooking.firstChild.firstChild.childNodes[3];
            let bookingOptionHTLM = singleBooking.childNodes[1].firstChild;
            console.log('Client single each booking: ', singleBooking);
            if(statusHTML.innerText === 'awaiting acceptance'){
                let payButtonHTML = bookingOptionHTLM.lastChild.firstChild
                $(payButtonHTML.firstChild).prop('disabled' , 'disabled');
                $(payButtonHTML.firstChild).css('cursor' , 'not-allowed');
                $(payButtonHTML).css('opacity' , '50%');
            }
            if(statusHTML.innerText === 'confirm / reject'){
                let bookingDescription = statusHTML.parentNode.parentNode.nextSibling;
                $(bookingDescription.childNodes[0]).hide();
                $(bookingDescription.childNodes[1]).show();
            }
            if(statusHTML.innerText === 'confirmed'){
                let bookingDescription = statusHTML.parentNode.parentNode.nextSibling;
                $(bookingDescription.childNodes[0]).hide();
                $(bookingDescription.childNodes[1]).show();
                $(bookingDescription.childNodes[1].childNodes[0]).hide();
                $(bookingDescription.childNodes[1].childNodes[1]).hide();
                $(bookingDescription.childNodes[1].childNodes[2]).show();
            }
            if(statusHTML.innerText === 'awaiting resolution'){
                let bookingDescription = statusHTML.parentNode.parentNode.nextSibling;
                $(bookingDescription.childNodes[0]).hide();
                $(bookingDescription.childNodes[1]).show();
                $(bookingDescription.childNodes[1].childNodes[0]).hide();
                $(bookingDescription.childNodes[1].childNodes[1]).hide();
                $(bookingDescription.childNodes[1].childNodes[2]).show();
                $(bookingDescription.childNodes[1].childNodes[2].firstChild.childNodes[0]).hide();
                $(bookingDescription.childNodes[1].childNodes[2].firstChild.childNodes[1]).show();
            }
            if(statusHTML.innerText === 'cancelled'){
                let bookingDescription = statusHTML.parentNode.parentNode.nextSibling;
                $(bookingDescription.childNodes[0]).hide();
                $(bookingDescription.childNodes[1]).show();
                $(bookingDescription.childNodes[1].childNodes[0]).hide();
                $(bookingDescription.childNodes[1].childNodes[1]).show();
                $(bookingDescription.childNodes[1].childNodes[2]).hide();
            }
        })
    }
})
$(document).click(function (event) {
    let elementClicked = event.target;

    if(elementClicked.className === 'addProfilePicture'){
        let pageToGo = clientsectionNames[1];
        $('.client-profile-update-page').trigger("click");
    }

    /* Client Booking */
    let bookingDescription;
    if(elementClicked.parentNode.className === 'booking-main-details'){
        bookingDescription = elementClicked.parentNode.parentNode
            .childNodes[1];
        $(bookingDescription).toggle();
    }
    else if(elementClicked.parentNode.className === 'single-client-booking'){
        bookingDescription = elementClicked.parentNode
            .childNodes[1];
        $(bookingDescription).toggle();
    }
    else if(elementClicked.parentNode.parentNode.className
        === 'booking-main-details'){
        bookingDescription = elementClicked.parentNode.parentNode.
            parentNode.childNodes[1];
        $(bookingDescription).toggle();
    }
    if(elementClicked.id === 'progressstatus'){
        bookingDescription = elementClicked.parentNode.parentNode.
            parentNode.parentNode.childNodes[1];
        $(bookingDescription).toggle();
    }
    else if(elementClicked.className === 'far fa-trash-alt' &&
        (elementClicked.parentNode.parentNode.parentNode
            .className === 'booking-main-details')){
        bookingDescription = elementClicked.parentNode.parentNode.
            parentNode.parentNode.childNodes[1];
        $(bookingDescription).toggle();
    }

    // Booking Modal Hide
    if(event.target.className === "client-account-modal") {
        event.target.style.display = "none";
    }
})

/*** Booking ***/
// Booking Acceptance
$(document).on('click', '.client-accept-booking-bttn', function(event) {
    let buttonContainerHTML = event.target.parentNode;
    let bookingDescriptionContainerHTML = buttonContainerHTML.previousSibling;
    let bookingContainerHTML = buttonContainerHTML.parentNode.
        parentNode.parentNode;

   let bookingModification = bookingDescriptionContainerHTML.childNodes[0].childNodes[1];
    bookingModification = bookingModification.childNodes[1];
    console.log('Booking Modification: ', bookingModification)
    clientSideBookingInfosModal(bookingContainerHTML,
        'booking modification acceptance - client',
        {
            acceptDueDate: bookingModification.childNodes[0].innerText.split(': ')[1].trim(),
            acceptDescription: bookingModification.childNodes[2].childNodes[1].innerText,
            acceptPrice: bookingModification.childNodes[3].innerText.split(':')[1].trim()
        });
})

$(document).on('click', '#projectCompleted', function(event) {
    let bookingContainerHTML = event.target.parentNode.parentNode.
        parentNode.parentNode.parentNode;
    clientSideBookingInfosModal(bookingContainerHTML,
        'booking completed - client');
})

$(document).on('click', '#projectIncomplete', function(event) {
    let bookingContainerHTML = event.target.parentNode.parentNode.
        parentNode.parentNode.parentNode;
    clientSideBookingInfosModal(bookingContainerHTML,
        'booking incompleted - client');
})

// Delete Booking
$(document).on('click', '.delete-booking-bttn', function(event) {
    console.log('Booking Deletion requested by Client');
    let deleteBttnHTML = event.target;
    let projectDetails = deleteBttnHTML.parentNode.parentNode.
        parentNode;
    let bookingToDeleteID = projectDetails.nextSibling.value;
    let freelancerBooked = bookingToDeleteID.split(':')[1];
    let projectStatus = projectDetails.previousSibling.firstChild.childNodes[3].innerText;
    let bookingContainerHTML = projectDetails.parentNode;

    console.log('Booking Details: ', projectDetails.parentNode);
    console.log({bookingToDeleteID, freelancerBooked, projectStatus});
    let deleteData = {bookingToDeleteID, freelancerBooked, status: projectStatus};

    if(projectStatus === 'booking ongoing'){
        clientSideBookingInfosModal(bookingContainerHTML,
            'ongoingBooking delete - client', deleteData);
    }else{
        socketConnection.socket.emit('Booking Delete - Client Request',
            {bookingToDeleteID, freelancerBooked, status: projectStatus});
    }
});

$(document).on('click', '#client-ongoingBooking-continue', function(event) {
    let deletionData = event.target.parentNode.nextSibling.value;
    socketConnection.socket.emit('Booking ongoing Delete - Client Request',
        JSON.parse(deletionData));
})

function clientSideBookingInfosModal(bookingContainerHTML, buttonInformation, bookingData) {

    let bookingID = bookingContainerHTML.lastChild.value;
    console.log('BookindID: ', bookingID)
    let clientSide_modal = bookingContainerHTML.parentNode.parentNode.
        parentNode.parentNode.parentNode.nextSibling;

    // Show the modal
    $(clientSide_modal).show();
    let clientSide_modalContainer = clientSide_modal.childNodes[0].childNodes[0];
    $(clientSide_modalContainer.nextSibling)
        .val(bookingID);

    if(buttonInformation === 'booking modification acceptance - client'){
        let acceptanceDataToShow = clientSide_modalContainer.childNodes[2].childNodes[2];
        acceptanceDataToShow.childNodes[0].childNodes[1].innerText = bookingData.acceptDueDate;
        acceptanceDataToShow.childNodes[1].childNodes[1].innerText = bookingData.acceptDescription;
        acceptanceDataToShow.childNodes[2].childNodes[1].innerText = bookingData.acceptPrice;
        $(acceptanceDataToShow.childNodes[3].childNodes[0]).val(JSON.stringify(bookingData));
        $(clientSide_modalContainer.childNodes[0]).hide();
        $(clientSide_modalContainer.childNodes[1]).hide();
        $(clientSide_modalContainer.childNodes[2]).show();
        $(clientSide_modalContainer.childNodes[3]).hide();
    } else if(buttonInformation === 'booking completed - client'){
        $(clientSide_modalContainer.childNodes[0]).show();
        $(clientSide_modalContainer.childNodes[1]).hide();
        $(clientSide_modalContainer.childNodes[2]).hide();
        $(clientSide_modalContainer.childNodes[3]).hide();
    } else if(buttonInformation === 'booking incompleted - client'){
        $(clientSide_modalContainer.childNodes[0]).hide();
        $(clientSide_modalContainer.childNodes[1]).show();
        $(clientSide_modalContainer.childNodes[2]).hide();
        $(clientSide_modalContainer.childNodes[3]).hide();
    }else if(buttonInformation === 'ongoingBooking delete - client'){
        $(clientSide_modalContainer.childNodes[0]).hide();
        $(clientSide_modalContainer.childNodes[1]).hide();
        $(clientSide_modalContainer.childNodes[2]).hide();
        $(clientSide_modalContainer.childNodes[3]).show();
        $(clientSide_modalContainer.childNodes[3].childNodes[2]).val(JSON.stringify(bookingData));
    }
}

// Client Booking Side Modal Click
$(document).on('click', '#client-booking-modificationAcceptance', function(event) {
    console.log('Booking Acceptance');
    let acceptanceBookingModal_lastSection = event.target.parentNode;
    let bookingModificationData = acceptanceBookingModal_lastSection.childNodes[0].value;
    bookingModificationData = JSON.parse(bookingModificationData);

    let bookingID = acceptanceBookingModal_lastSection.parentNode.parentNode.parentNode.nextSibling.value;
    bookingModificationData.bookingToAcceptID = bookingID;

    let modified_acceptedDueDate = bookingModificationData.acceptDueDate;
    modified_acceptedDueDate = modified_acceptedDueDate.split(',');
    modified_acceptedDueDate = modified_acceptedDueDate[0].trim().split("/").reverse().join("-")+'T'+
        modified_acceptedDueDate[1].trim()+'Z';
    modified_acceptedDueDate = new Date(modified_acceptedDueDate);

    bookingModificationData.acceptDueDate = modified_acceptedDueDate;

    socketConnection.socket.emit('Booking Acceptance - Client', {bookingModificationData})
})

$(document).on('click', '.client-booking-completion-confirmation .client-bookingCompletion-continue', function(event) {
    // Booking Completion confirmed
    let bookingCompletionConfirmedID = event.target.parentNode.parentNode.parentNode.nextSibling.value;
    socketConnection.socket.emit('Completion Confirmed', {bookingCompletionConfirmedID})
})
$(document).on('click', '.client-booking-completion-rejection .client-bookingCompletion-continue', function(event) {
    // Booking Completion Conflict
    let bookingCompletionConflictID = event.target.parentNode.parentNode.parentNode.nextSibling.value;
    socketConnection.socket.emit('Completion Conflict', {bookingCompletionConflictID})
})


// Closing Modal
function close_clientSideModal(event) {
    let buttonHTML = event.target;
    if(buttonHTML.id === 'client-booking-modificationReject'){
        $(buttonHTML.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode).hide();
    }else{
        $(buttonHTML.parentNode.parentNode.parentNode.parentNode.parentNode).hide();
    }

}
$(document).on('click', '.client-booking-completion .client-bookingCompletion-cancel', function(event) {
    close_clientSideModal(event);
})
$(document).on('click', '#client-booking-modificationReject', function(event) {
    close_clientSideModal(event);
})
$(document).on('click', '#client-ongoingBooking-cancel', function(event) {
    close_clientSideModal(event);
})


/*** The following codes deal with the changes and display of the profile of the client ***/
accountsOperation.profileImageChange("#client-profile-picture",
    '#client-imagePreview')
accountsOperation.profileImageEmpty('#client-imagePreview')


/*
* This section is to handle the process of the client updating their personal
* information.
* **/

$('#client-profile-update-form').submit(function (event) {
    event.preventDefault();

    accountsOperation.disbaleButton('#clientUpdate', 'Wait - Profile Updating <span id="wait">.</span>');

    let clientErrorSection = '.client-update-errors';

    // on submit of information, any of the errors display during the
    // previous this submit process should be erased from the screen.
    $(clientErrorSection).empty();

    // Collect the data of the update profile form
    let formData = accountsOperation.dataCollection(this);

    // Get the profile picture uploaded by the client
    let saved_clientProfile = $('#client-profile-picture')[0].files[0];
    formData.append('user_profile_picture', saved_clientProfile);


    $.ajax({
        type: 'PUT',
        enctype: 'multipart/form-data',
        url: '/account/client/update',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {

            // display the updated profile picture of the client
            if(data.profileImageSrc === ''){
                $('.client-profile-details img').attr('src',
                    '/images/userDefaultImage.png');
            }else{
                $('.client-profile-details img').attr('src',
                    data.profileImageSrc);
            }

            $('default-profile-image p').innerText = '+ Update Profile Picture';

            // display the updated names of te client
            accountsOperation.showNames(data.name, data.surname,
                '.client-profile-name');

            accountsOperation.enableButton('#clientUpdate', 'Save Profile');
            $('.client-profile-information ul li:first-child').trigger('click');
        },
        error: function (error) {
            let errors = error.responseJSON;
            accountsOperation.ajaxFormError_generator(errors, clientErrorSection);
        }
    })
})

