var mongoClient = require("mongodb").MongoClient;
var moment = require("moment");
var constring = "";

mongoClient.connect(constring, function(err, db) {

    if (err) {
        console.log("bağlantı hatası");
        return;
    }
    db.collection("events", function(err, collection) {

        if (err) {
            console.log("collection alınamadı.");
            return;
        }
        var options = {
            "sort":[["startDate","asc"]]
        };
        collection.find({},options).toArray((err,docs) => {
            console.log("documentlar alındı.");
            docs.forEach(doc=>{
                var startDate = moment(doc.startDate).format("YYYY-MM-DD");
                var startTime = doc.startTime;
                var endTime = doc.endTime;
                if(!startTime){
                    console.log("Invalid StartTime - ",startTime);
                    return;
                }
                else if(!endTime){
                    console.log("Invalid EndDate - ", endTime);
                }
                
                startTime = startTime.toString();
                endTime = endTime.toString();
                if(startTime.length === 2){
                    startTime += ":00";
                }
                else if(startTime.length === 4){
                    startTime = startTime.replace(".",":") + "0";
                }
                else{
                    startTime = startTime.replace(".",":");
                }
                if(startTime === "Invalid date"){
                    console.log(JSON.stringify(doc));
                }


                if(endTime.length === 2){
                    endTime += ":00";
                }
                else if(endTime.length === 4){
                    endTime = endTime.replace(".",":") + "0";
                }
                else{
                    endTime = endTime.replace(".",":");
                }
                if(endTime === "Invalid date"){
                    console.log(JSON.stringify(doc));
                }

                var startDateTime = moment(startDate + " " + startTime);
                var endDateTime = moment(startDate + " " + endTime);

                // startDateTime = startDateTime;
                // endDateTime = endDateTime;

                console.log("ID: ",doc._id.toString(), " - StartDate: ",moment(startDateTime).format("YYYY-MM-DD HH:mm"), " - EndDate: ", moment(endDateTime).format("YYYY-MM-DD HH:mm") );

                collection.update({ _id: doc._id }, { $set: { endDate: endDateTime._d, startDate: startDateTime._d }});
            });
        });
    });
});