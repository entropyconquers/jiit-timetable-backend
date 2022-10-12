//express server
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//hello world

app.get('/', (req, res) => 
{
    //response 200
    res.status(200).send('Hello World!');
});

//getTimetable


app.get('/timetable', (req, res) =>
{
    //get params
    var params = req.query;
    //get year and batch
    var year = params.year;
    var batch = params.batch;
    //get timetable
    var timetable = getTimetable(year, batch);
    //check if timetable is null
    if(timetable){
        //response 200
        res.status(200).send(timetable);
    }
    else{
        //response 404
        res.status(404).send("Timetable not found");
    }
});

//start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

var getTimetable = (year, batch)=>{
    //check if year and batch are valid
    if(year>=1 && year<=4){
        //import json file
        try{
            var fs = require('fs');
            var data = fs.readFileSync(`timetable_${year}.json`);
            var timetable = JSON.parse(data);
            //check if batch is exists
            if(timetable[batch]){
                return timetable[batch];
            }
        }
        catch(err){
            return null;
        }
    }
    return null;
}