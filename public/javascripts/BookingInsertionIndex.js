export default class BookingInsertionIndex {
    /*
    * This class is used to find the correct index for inserting
    * booking in a list of bookings. The idea with this insertion
    * is that the booking of the same status should appear at the
    * same place in the following order:
    *       - booking ongoing
    *       - awaiting payment
    *       - accept/reject
    *       - awaiting confirmation, awaiting resolution and cancelled
    * */

    constructor(listOfProjects, target, newProjectDueDateTime) {
        this.listOfProjects = listOfProjects;
        this.status = status;
        this.newProjectDueDateTime = newProjectDueDateTime;
    }

    get sizeOfList(){
        return this.listOfProjects.length;
    }

    get firstIndex(){
        return 0;
    }

    updateProjectStatus(projectContainerHTML, newStatus){
        projectContainerHTML.firstChild.childNodes[3].innerText = newStatus;
    }

    updateProjectDueDate(projectContainerHTML, newDueDate){
        projectContainerHTML.childNodes[0].childNodes[2].innerText = newDueDate;
    }

    getProjectDueTime(projectContainerHTML) {
        /* This method returns the due time
        * of the project.
        * Arguments:
        *   - projectContainerHTML: HTML container
        *       of a single project booking
        * */

        return projectContainerHTML.firstChild.childNodes[2].innerText;
    }

    getProjectStatus(projectContainerHTML) {
        /* This method returns the status
        * of the project.
        * Arguments:
        *   - projectContainerHTML: HTML container
        *       of a single project booking
        * */

        return projectContainerHTML.firstChild.childNodes[3].innerText;
    }

    getDueDateMilliseconds(time) {
        /* Gets the milliseconds of the date and time passed. */

        if(time.includes(',')){
            time = time.split(',');
            time = time[0].trim().split("/").reverse().join("-")+'T'+time[1].trim()+'Z';
        }
        return Date.parse(time);
    }

    statusToInteger(status) {
        if (status === 'booking ongoing') {
            return 0;
        }
        if (status === 'awaiting payment') {
            return 1;
        }
        if (status === 'accept / modify') {
            return 2;
        }
        if (status === 'awaiting response') {
            return 3;
        }
        if (status === 'please respond') {
            return 4;
        }
        if (status === 'awaiting confirmation') {
            return 5;
        }
        if (status === 'confirmed, well done!') {
            return 6;
        }
        if (status === 'awaiting resolution') {
            return 7;
        }
        if (status === 'paid') {
            return 8;
        }
        if (status === 'cancelled') {
            return 9;
        }
    }

    listOfProjectsToListOfIndexes(listOfProjects){
        let listOfIndexes = listOfProjects.map(singleProject => {
            return this.statusToInteger(this.getProjectStatus(singleProject));
        });
        return listOfIndexes;
    }

    findProjectInsertionIndex(listOfProjects, status, insertTime) {
        /* This method returns the exact index of the insertion of the
        * new project.
        * Arguments:
        *   - listOfProjects: List of the project apart from the Next Due Project
        *   - status: Status of the new project to be insert
        *   - insertTime: Due time of the new project to be insert
        * */

        let insertIndex;
        let listOfProjectsStatusesIndexes = this.listOfProjectsToListOfIndexes(listOfProjects);

        /* Find the first and last occurrence of the new project status in the list of
        all the projects.*/
        let firstStatusOccurence = this.findFirstIndex(listOfProjectsStatusesIndexes,
            this.firstIndex, this.sizeOfList, this.statusToInteger(status));
        let lastStatusOccurence = this.findEndIndex(listOfProjectsStatusesIndexes,
            this.firstIndex, this.sizeOfList, this.statusToInteger(status));

        if(firstStatusOccurence === -1 || lastStatusOccurence === -1){
            /* There no project in the list of all the projects that has the same
            status as the new project. The bext step becomes to be find the current
             index to insert it, based on the order the projects are expected to
             appear*/

            insertIndex = this.correctInsertionIndex(listOfProjectsStatusesIndexes,
                this.statusToInteger(status));
        }else{
            /* Now, if there are projects in the list of projects with the same status with the new
            * projects. The next step is to find the right index of insertion based on the due date & time. */

            // Get only projects with the same status as the new project.
            let listOfProjectsWithCurrentStatuses = listOfProjects.slice(firstStatusOccurence, lastStatusOccurence+1);

            // For all the proejcts of the same status as the new one, compare the time in ascending order to find
            // insertion index for the new project.
            insertIndex = this.earliestDueTimeIndex(listOfProjectsWithCurrentStatuses, this.firstIndex,
                listOfProjectsWithCurrentStatuses.length, insertTime, firstStatusOccurence);
        }

        return insertIndex;
    }

    earliestDueTimeIndex(list, first, last, target, startIndex) {
        /* This method is used for finding the correct index to insert
        * a new project based on its due date & time.
        * Arguments:
        *   - list: List of the projects with the same status as the new project
        *   - first: the first index of this list (always 0)
        *   - last: the last index of this list (always length of list)
        *   - target: the due date & time in milliseconds of the new project.
        *   - startIndex: The list here is a sub-list of the list of all projects.
        *           This list passed to this function is broken based on the status
        *           of the new project. Now, startIndex represents the firs index where
        *           the list of all projects was broken.
        *  */

        let cutter = Math.floor(first + (last - first)/2);
        let middleElem = this.getDueDateMilliseconds(this.getProjectDueTime(list[cutter]));

        if(first <= last){
            if(middleElem >= target){ // target is less than or equal to the element in the midlle
                if(cutter === 0){
                    return {place: 'before', index: startIndex + cutter};
                }
                else if(this.getDueDateMilliseconds(this.getProjectDueTime(list[cutter-1])) < target){
                    return {place: 'before', index: startIndex + cutter};
                }else{
                    return this.earliestDueTimeIndex(list, first, cutter-1, target, startIndex);
                }
            }else{
                if(cutter === (list.length - 1)){
                    return {place: 'after', index: (last - 1)+startIndex};
                }
                return this.earliestDueTimeIndex(list, cutter+1, last, target, startIndex);
            }
        }
    }

    correctInsertionIndex(list, insertionTarget) {
        let size = list.length - 1;
        let newArray = list.concat(insertionTarget);
        newArray.sort((a, b) => a - b);
        let insertionIndex = newArray.indexOf(insertionTarget);

        if(insertionTarget > list[size]){
            return {place: 'after', index: size};
        }
        return {place: 'before', index: insertionIndex};
    }

    findFirstIndex(list, first, last, target) {
        let cutter = Math.floor(first + (last - first)/2);
        if(first <= last){
            if(list[cutter] === target){
                if(cutter === 0 || target !== list[cutter-1]){
                    return cutter;
                }
                else if(target === list[cutter-1]){
                    return this.findFirstIndex(list, first, cutter-1, target);
                }
            }
            else{
                if(list[cutter] > target){
                    return this.findFirstIndex(list, first, cutter-1, target);
                }else{
                    return this.findFirstIndex(list, cutter + 1, last, target);
                }
            }
        }
        return -1;
    }

    findEndIndex(list, first, last, target) {
        let cutter = Math.floor(first + (last - first)/2);

        if(first <= last){
            if(list[cutter] === target){
                if(cutter === (list.length - 1) || target !== list[cutter+1]){
                    return cutter;
                }
                else if(target === list[cutter+1]){
                    return this.findEndIndex(list, cutter+1, last, target);
                }
            }
            else{
                if(list[cutter] > target){
                    return this.findEndIndex(list, first, cutter-1, target);
                }else{
                    return this.findEndIndex(list, cutter + 1, last, target);
                }
            }
        }
        return -1;
    }
}