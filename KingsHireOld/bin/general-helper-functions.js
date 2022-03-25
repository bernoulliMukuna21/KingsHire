module.exports = {
    numberOfDaysSince: function (InitialDate) {
        if(!InitialDate){
            InitialDate = (new Date()).getTime();
        }else{
            InitialDate = InitialDate.getTime();
        }

        let numberOfDays = (new Date()).getTime() - InitialDate; // Number of days since passed date
        return Math.floor(numberOfDays/(1000 * 60 * 60 * 24));
    },
    convertTimeTo24Hours: time => {
        var matches = time.toLowerCase().match(/(\d{1,2}):(\d{2}) ([ap]m)/),
        output  = (parseInt(matches[1]) + (matches[3] === 'pm' ? 12 : 0)) + ':' + matches[2] + ':00';
        output = parseInt(output.split(':')[0])>=10 ? output : '0'+output;

        return output;
    },
    groupByKey: (array, key) => {
        return array.reduce((hash, singleProject) => {
            if(singleProject.status[key] === undefined){
                return hash
            };
            return Object.assign(hash, {
                [singleProject.status[key]]:( hash[singleProject.status[key]] || [] ).concat(singleProject)
            })
        }, {});
    }
};