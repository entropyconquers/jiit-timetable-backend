//express server
const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

//body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const run = require('./connection.js');

//hello world

app.get('/', (req, res) => 
{
    //response 200
    //res.status(200).send(`HELLO: ${process.env.AUTH_KEY}`);
    //check headers for Authorization
    //res.status(200).send(`HELLO: ${process.env.AUTH_KEY}`);
    
    //available routes
    var data = {"Available Routes": [
        {
            "route": "/timetable",
            "method": "GET",
            "params": ["batch", "year"],
            "description": "Get timetable for a batch and year",
            "example": "/timetable?batch=2018&year=1",
            "Auth": "No"
        },
        {
            "route": "/timetable",
            "method": "POST",
            "params": ["year"],
            "description": "Add timetable for all batches of a year",
            "example": "/timetable?year=1",
            "Auth": "Yes",
        }
    ]}
    res.status(200).send(data);
});

//getTimetable



//post timetable
app.post('/timetable', async (req, res) => {
    if(req.headers.token){
        //check if authorization key matches
        if(req.headers.token == `${process.env.AUTH_KEY}`){
            //response 200
            //get params
            var params = req.query;
            //get year and batch
            var year = params.year;
            //get body
            var body = req.body;
            if(year>=1 && year<=4){
                //import json file
                try{
                run().then((client)=>{
                        //get db
                        const db = client.db("timetable");
                        console.log("Connected to db");
                        //check if collection exists
                        db.listCollections({name: `timetable_${year}`})
                        .next(function(err, collinfo) {
                            var structuredData = [];
                                //body is an object
                                for(var key in body){
                                    //get batch
                                    var batch = key;
                                    //get timetable
                                    var timetable = body[key];
                                    var doc = {
                                        _id : batch,
                                        timetable : timetable
                                    }
                                    structuredData.push(doc);
                                    
                                }
                            
                            if (collinfo) {
                                console.log("Collection exists");
                                //collection exists
                                //insert data
                                
                                

                                db.collection(`timetable_${year}`).insertMany(structuredData)
                                .then((result)=>{
                                    //response 200
                                    console.log("Inserted "+result);
                                    res.status(200).send("Timetable added");
                                    return;
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    //response 500
                                    res.status(500).send("Error adding timetable");
                                    return;
                                });
                                
                                
                            } else {
                                console.log("Collection does not exist");
                                //collection does not exist
                                //create collection 
                                db.createCollection(`timetable_${year}`)
                                .then((result)=>{
                                    db.collection(`timetable_${year}`).insertMany(structuredData)
                                    .then((result)=>{
                                        //response 200
                                        res.status(200).send("Timetable added");
                                        return;
                                    })
                                    .catch((err)=>{
                                        console.log(err);
                                        //response 500
                                        res.status(500).send("Error adding timetable");
                                        return;
                                    });
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    //response 500
                                    res.status(500).send("Error adding timetable");
                                    return;
                                });
                            }
                        });
                    });

                }
                catch(err){
                    //response 500
                    res.status(500).send(`Internal Server Error\n${err}`);
                    return;

                }
            }
            else{
                //response 400
                res.status(400).send("Invalid year");
                return;
            }
        }   
        else{
            //response 401
            res.status(401).send(`Unauthorized`);
        }
    } 
    else{
    //response 401
        res.status(401).send(`Unauthorized`);
    }
});
app.get('/timetable', (req, res) =>
{
    //get params
    var params = req.query;
    //get year and batch
    var year = params.year;
    var batch = params.batch;
    var serialize = params.serialize || "0";
    
    //get timetable
    //connect to mongodb
    try{
        run().then((client)=>{
            //get db
            const db = client.db("timetable");
            console.log("Connected to db");
            //check if collection exists
            db.listCollections({name: `timetable_${year}`})
            .next(function(err, collinfo) {
                if (collinfo) {
                    console.log("Collection exists");
                    //collection exists
                    //get data to json
                    db.collection(`timetable_${year}`).findOne({_id: batch})
                    .then((result)=>{
                        //response 200
                        
                        if(result && result.timetable){
                            //check if a document named ALL exists
                            db.collection(`timetable_${year}`).findOne({_id: "ALL"})
                            .then((result2)=>{
                                if(result2 && result2.timetable){
                                    //merge the two timetables
                                    var timetable = result.timetable;
                                    var timetable2 = result2.timetable;
                                    for(var key in timetable2){
                                        if(timetable[key]){
                                            //merge the two
                                            for(var timeslot in timetable2[key]){
                                                if(timetable[key][timeslot]){
                                                    //slot exists skip
                                                    continue;
                                                }
                                                else{
                                                    //slot does not exist add
                                                    timetable[key][timeslot] = timetable2[key][timeslot];
                                                }
                                            }
                                        }
                                        else{
                                            //slot does not exist add
                                            timetable[key] = timetable2[key];
                                        }
                                    }
                                    
                                    if(serialize == "1"){
                                        console.log("Serializing");
                                        res.status(200).send(serializeData(timetable));
                                    }
                                    else{
                                        res.status(200).send(timetable);
                                    }
                                    return;
                                }
                                else{
                                    //response 200
                                    if(serialize == "1"){
                                        console.log("Serializing");
                                        res.status(200).send(serializeData(result.timetable));
                                    }
                                    else{
                                        res.status(200).send(result.timetable);
                                    }
                                    return;
                                }
                            })
                            //res.status(200).send(result.timetable);
                        }
                        else{
                            res.status(404).send("Timetable not found");
                        }
                        return;
                    })
                    .catch((err)=>{
                        console.log(err);
                        //response 500
                        res.status(500).send("Error getting timetable");
                        return;
                    });
                } else {
                    console.log("Collection does not exist");
                    //collection does not exist
                    //response 404
                    res.status(404).send("Timetable not found");
                    return;
                }
            });
        });
    }
    catch(err){
        //response 500
        res.status(500).send(`Internal Server Error\n${err}`);
        return;
    }
});
const serializeData = (timetable) => {
    //serialize timetable data
    var days = [];
    for(var day in timetable){
        var timeslots = [];
        for(var timeslot in timetable[day]){
            var slot = {
                timeslot: timeslot,
                subject: timetable[day][timeslot]
            }
            timeslots.push(slot);
        }
        var dayData = {
            day: day,
            timeslots: timeslots
        }
        days.push(dayData);
    }
    return days;
}

   



//start server
app.listen(port, () => console.log(`app listening on port ${port}!`));

