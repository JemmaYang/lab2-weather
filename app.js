var express = require('express');
var weather = require('openweather-apis');
var app = express();
var fs = require('fs');
var path = require('path');
var Flickr = require("node-flickr");
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;



//Link to mongodb database http://127.0.0.1:28017/
// mongoose.connect('mongodb://localhost/todoAppTest');
MONGOLAB_URI='mongodb://yajingyang:yajingyang@ds153669.mlab.com:53669/heroku_ft36kt81';

mongoose.connect(MONGOLAB_URI);


//Data schema in database
var TodoSchema = new mongoose.Schema({
  name: String,
  temprature: String,
  icon: String,
  updated_at: { type: Date, default: Date.now },
});

// Create a model based on the schema
var Todo = mongoose.model('Todo', TodoSchema);


//set up Flickr API Key
var keys = {"api_key": "8c1a895f4aca88edc12b60cf19437077"}
flickr = new Flickr(keys);


app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.use('/public', express.static(__dirname + '/public'));

var data = {};

//after user entering a city name, return flickr photos and weather data.
app.get('/api/:ctname',function(req, res){
    var cityname = req.params.ctname;
    

     flickr.get("photos.search", {"tags":cityname}, function(err, result){
             
             if (err) return console.error(err);
             data.cityImage = result.photos.photo[0];
             data.cityImage02 = result.photos.photo[1];

            //set up openweathermpa API
             weather.setAPPID('19ac0327f0454aa820ed4c504723cf92');
             weather.setCity(cityname);

             weather.getAllWeather(function(err, dataToday){
                  data.temp= dataToday.main.temp;
                  data.humidity = dataToday.main.humidity;
                  data.pressure = dataToday.main.pressure;
                  data.wind = dataToday.wind.speed;
                  data.name = dataToday.name;
                  data.icon = dataToday.weather[0].icon;

                  weather.getWeatherForecastForDays(3, function(err, obj){   	
                        data.firstTempMin = obj.list[0].temp.min;
                        data.firstTempMax = obj.list[0].temp.max;
                        data.firstWeather = obj.list[0].weather[0].icon;
                        data.secondTempMin = obj.list[1].temp.min;
                        data.secondTempMax = obj.list[1].temp.max;
                        data.secondWeather = obj.list[1].weather[0].icon;
                        data.thirdTempMin = obj.list[2].temp.min;
                        data.thirdTempMax = obj.list[2].temp.max;
                        data.thirdWeather = obj.list[2].weather[0].icon; 

                        // console.log(data);
                        res.send(data);  
                  });
       
             });

                       // console.log(data.cityImage);
      });
       

});

//CODES for remove all data in database.

// Todo.remove(function (err, todos) {
//   if (err) return console.error(err);
//   console.log(todos)
// });


//save selected data to database after users click the save buttom.
//print all data in the database
app.get('/save/:cityName', function (req, res, next) {
	var cityName = req.params.cityName;

    var todo = new Todo({name: cityName, temprature: data.temp, icon: data.icon});
	
	todo.save(function(err){
       if(err)   {console.log(err);}
       else  {
    	     Todo.find(function (err, todos) {
                 if (err) {console.error(err);}

              console.log("You have saved " + todos);         
          });
          // console.log(todo);
          res.json(todo);
        }
    	  
    });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});







