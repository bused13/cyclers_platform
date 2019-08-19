$(document).ready(function() {

   var location = {
      //coordinates
      lat : 34.05,
      lng : -118.24,

      //returns coordinates
      getCoords: function(){
         var coords=[location.lat, location.lng];
         return coords;
      },

      //accepts a coordinates array and sets location.coordinates
      setCoords: function(coords){
        location.lat=coords[0];
        location.lng=coords[1];
      },

      //add predictive autocomplete service from google places API to input field
      autocomplete: new google.maps.places.Autocomplete(
         document.getElementById("autocomplete"),
         { types: ["(cities)"] }
      ),

      //autocomplete click event handler to get lat lng coords for selected location
      onPlaceChanged: function() {
         var locationObject = location.autocomplete.getPlace();
         var lat = parseFloat(locationObject.geometry.location.lat().toFixed(2));
         var lng = parseFloat(locationObject.geometry.location.lng().toFixed(2));
         var coords = [lat, lng];
         location.setCoords(coords);
         update();
      },

      //callback for successful request to google maps geocode API to format and display city,state
      displayCity: function(json) {
         var formattedAddress = json.results[0].formatted_address;
         var arr = formattedAddress.split(",");
         var city = arr[1];
         var state = arr[2];
         state = state.substring(0, 3);
         $(".city").html(city+ ", " +state);
         $("#autocomplete").attr("placeholder", city+ ", " +state);
      },

      //getJSON request to google geocode API to reverse geocode lat and lng coords -> called by update function
      callGeocodeAPI: function(){
         var coords=location.getCoords();
         var lat = coords[0];
         var lng = coords[1];
         $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"", function(json){
               location.displayCity(json);
            });
      },

      //localWeather click event handler to request coords from geolocation API
      callBrowserGeolocationAPI: function(){
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
               location.navGeolocateSuccess,
               location.navGeolocateError /*, options*/
            );
         } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
         }
      },

      //handle successful request to geolocation API, update coords and call update function
      navGeolocateSuccess: function(position) {
         var lat = parseFloat(position.coords.latitude.toFixed(2));
         var lng = parseFloat(position.coords.longitude.toFixed(2));
         var coords = [lat, lng];
         location.setCoords(coords);
         update();
      },

      //handle unsuccessful request to geolocation API
      navGeolocateError: function() {
         coords.innerHTML = "Unable to retrieve your location";
      }
   };

   //object literal containing methods for initializing and updating the map
   var map = {

      //initialize map -> called by the start function
      initMap: function() {
         var coords=location.getCoords();
         var lat=coords[0];
         var lng=coords[1];
         var mapDiv = document.getElementById("map");
         map.myMap = new google.maps.Map(mapDiv, {
            center: { lat: lat, lng: lng },
            zoom: 10
         });
         map.setMapHeight();
      },

      //set the center of the map -> called by the update function
      updateMap: function(){
        var coords=location.getCoords();
        var lat=coords[0];
        var lng=coords[1];
        map.myMap.setCenter({lat:lat, lng:lng})
        ;
         map.setMapHeight();
      },
      //window resize callback function to maintain aspect ratio
      setMapHeight:function(){
          var mapWidth = parseInt($("#map").width());
          $("#map").css("height",mapWidth);
      }
   };

   //object literal containing methods for formatting and displaying time and date
   var time = {
      //create a new instance of the date object from constructor and return array of formatted time and date
      monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
      dayNames: ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],

      //add 0 in front of single digit minutes
      setMinute: function(){
         var minute = time.minute;
         if (minute < 10) {
           minute = "0" + minute;
         }
         return minute.toString();
       },

      //convert hour to to a 12 hour clock
       setHour: function(index){
          var hour=time.hour;
          if (hour == 0) {
             hour = 12;
          } else if (hour > 12) {
             hour = hour - 12;
          }
          return hour.toString();
       },

      //set meridiem period
       setAMPM: function(){
          var ampm;
          var hour=time.hour;
          if (hour == 0) {
            ampm="am";
          } else if (hour > 12) {
            ampm="pm";
          } else {
            ampm="am";
          }
          return ampm;
       },

      //returns combined weekday, month, and date
       formatDate: function(date){
          var dayOfMonth = date.getDate();
          var dayOfWeek = date.getDay();
          time.dayOfWeek=dayOfWeek;
          var month = date.getMonth();
          month = time.monthNames[month];
          dayOfWeek = time.dayNames[dayOfWeek];
          var formattedDate = dayOfWeek + ", " + month + " " + dayOfMonth;
          return formattedDate;
       },

      //returns combined hour, minute, and meridiem period
       formatTime: function(date){
          var hour = date.getHours();
          time.hour=hour;
          var minute = date.getMinutes();
          time.minute=minute;
          var ampm = "am";
          var formattedTime = time.setHour()+":"+time.setMinute()+time.setAMPM();
          return formattedTime;
       },

      //returns updated date and time
       updateDateAndTime: function() {
          var date = new Date();
          time.date=date;
          var formattedDate = time.formatDate(date);
          var formattedTime = time.formatTime(date);
          var DateAndTime = [formattedDate, formattedTime];
          return DateAndTime;
       },

       //update and display time and date
       setTime: function() {
          var DateAndTime = time.updateDateAndTime();
          $(".dayMonth").html(DateAndTime[0]);
          $(".time").html(DateAndTime[1]);
       },

      //accepts parameter representing the current value of the forecastTemplate forloop index and returns corresponding hour value
       setForecastHour: function(index){
          var hour=time.hour;
          if ((hour + index) > 12 && (hour + index) < 24) {
            hour = (hour + index) - 12 + "pm";
          } else if ((hour + index) == 12){
            hour = (hour + index) + "pm";
          } else if ((hour + index) == 0 || (hour + index) ==24){
            hour = 12 +  "am";
          } else if( (hour + index) > 24){
            hour = (hour + index) - 24 + "am"
          } else {
            hour = (hour + index) + "am";
          }
          return hour.toString();
       },

      //accepts parameter representing the current value of the forecastTemplate forloop index and return corresponding day of the week
       setForecastDay: function(index){
          var day=time.dayOfWeek;
          if (day + index > 6) {
             day = day + index - 7;
          } else {
             day = day + index;
          }
          day = time.dayNames[day];
          return(day);
       }
   };

   //object literal containing methods for requesting, formatting, and displaying weather data
   var weather = {


      currentForecast: "",
      //switch statement to display appropriate "Weather Icons" icon based on data from the weather API
      setIcon: function(icon) {
         switch (icon) {
            case "clear-day":
               icon = '<div class = "wi wi-day-sunny"></div>';
               break;
            case "clear-night":
               icon = '<div class = "wi wi-night-clear"></div>';
               break;
            case "rain":
               icon = '<div class = "wi wi-rain"></div>';
               break;
            case "snow":
               icon = '<div class = "wi wi-snow"></div>';
               break;
            case "sleet":
               icon = '<div class = "wi wi-sleet"></div>';
               break;
            case "wind":
               icon = '<div class = "wi wi-strong-wind"></div>';
               break;
            case "fog":
               icon = '<div class = "wi wi-fog"></div>';
               break;
            case "cloudy":
               icon = '<div class = "wi wi-cloudy"></div>';
               break;
            case "partly-cloudy-day":
               icon = '<div class = "wi wi-day-cloudy-high"></div>';
               break;
            case "partly-cloudy-night":
               icon = '<div class = "wi wi-night-partly-cloudy"></div>';
               break;
            default:
               icon = "<div>See Chance of Precipitation</div>";
               break;
         }
         return icon;
      },

      //display current weather summary
      displayCurrentWeather: function() {
         $(".summary").html(weather.currentSummary);
         $(".icon").html(weather.currentIcon);
         $(".temp").html(weather.currentTemp);
         $(".tempUnit").html("&deg"+weather.currentTempUnit);
      },

      //use data from the weather API to set properties of the weather object
      setWeatherData: function(json){
         weather.currentTempUnit = "F";
         weather.darkSkyLng = json.longitude.toFixed(2);
         weather.darkSkyLat = json.latitude.toFixed(2);
         weather.currentSummary = json.currently.summary;
         weather.currentIcon = weather.setIcon(json.currently.icon);
         weather.currentTemp = json.currently.temperature.toFixed();
         weather.forecastHours = [];
         weather.hourlyIcon = [];
         weather.hourlyTemp = [];
         weather.hourlyCloudCover = [];
         weather.hourlyPrecipProbability = [];
         weather.hourlyPrecipIntensity = [];
         weather.hourlyHumidity = [];
         weather.hourlyWindSpeed = [];
         weather.hourlyPressure = [];
         weather.hourlyOzone = [];
         weather.hourlyVisibility = [];
         weather.forecastDays = [];
         weather.dailyIcon= [];
         weather.dailyHigh= [];
         weather.dailyLow= [];
         weather.dailyCloudCover = [];
         weather.dailyPrecipProbability = [];
         weather.dailyPrecipIntensity = [];
         weather.dailyHumidity = [];
         weather.dailyWindSpeed = [];
         weather.dailyPressure = [];
         weather.dailyOzone = [];
         weather.dailyVisibility = [];
         for (var i = 0; i < 5; i++) {
            var hourlyVisibility;
            if(json.hourly.data[i].visibility==undefined){
              hourlyVisibility = 0 + " mi";
            } else if(json.hourly.data[i].visibility!=undefined){
               hourlyVisibility = json.hourly.data[i].visibility + " mi";
            }

            var dailyVisibility;
            if(json.daily.data[i].visibility==undefined){
              dailyVisibility = 0 + " mi"
            } else if(json.daily.data[i].visibility!=undefined){
               dailyVisibility = json.daily.data[i].visibility + " mi";
            }

            weather.forecastHours.push(time.setForecastHour(i));
            weather.hourlyIcon.push(weather.setIcon(json.hourly.data[i].icon));
            weather.hourlyTemp.push(Math.floor(json.hourly.data[i].temperature));
            weather.hourlyCloudCover.push((json.hourly.data[i].cloudCover* 100).toFixed(0));
            weather.hourlyPrecipProbability.push((json.hourly.data[i].precipProbability*100).toFixed());
            weather.hourlyPrecipIntensity.push(json.hourly.data[i].precipIntensity.toFixed(2));
            weather.hourlyHumidity.push((json.hourly.data[i].humidity*100).toFixed());
            weather.hourlyWindSpeed.push(json.hourly.data[i].windSpeed.toFixed());
            weather.hourlyPressure.push(json.hourly.data[i].pressure.toFixed());
            weather.hourlyOzone.push(json.hourly.data[i].ozone.toFixed());
            weather.hourlyVisibility.push(parseFloat(hourlyVisibility));
            weather.forecastDays.push(time.setForecastDay(i));
            weather.dailyIcon.push(weather.setIcon(json.daily.data[i].icon));
            weather.dailyHigh.push(Math.floor(json.daily.data[i].temperatureHigh));
            weather.dailyLow.push(Math.floor(json.daily.data[i].temperatureLow));
            weather.dailyCloudCover.push((json.daily.data[i].cloudCover* 100).toFixed());
            weather.dailyPrecipProbability.push(((json.daily.data[i].precipProbability)*100).toFixed());
            weather.dailyPrecipIntensity.push(json.daily.data[i].precipIntensity.toFixed(2));
            weather.dailyHumidity.push((json.daily.data[i].humidity*100).toFixed());
            weather.dailyWindSpeed.push(json.daily.data[i].windSpeed.toFixed());
            weather.dailyPressure.push(json.daily.data[i].pressure.toFixed());
            weather.dailyOzone.push(json.daily.data[i].ozone.toFixed());
            weather.dailyVisibility.push(parseFloat(dailyVisibility));
         }
         console.log(weather.dailyIcon)
      },

      //populate forecast templates with weather data
      createForecastTemplates: function(){
         var hourlySummaries = "";
         var hourlyDetails = "";
         var dailySummaries = "";
         var dailyDetails = "";

         for (var i = 0; i < 5; i++) {
            var hourSummaryTemplate = '<div class="hour"><div class="hourlyTime">'+time.setForecastHour(i)+'</div><div class="hourlyIcon">'+weather.hourlyIcon[i]+'</div></div>';

            var hourDetailsTemplate = '<div class="hourDetails"><div class="hourDetailData">'+weather.hourlyCloudCover[i]+'%</div><div class="hourDetailData">'+weather.hourlyPrecipProbability[i]+'%</div><div class="hourDetailData">'+weather.hourlyPrecipIntensity[i]+'"</div><div class="hourDetailData">'+weather.hourlyHumidity[i]+'%</div><div class="hourDetailData">'+weather.hourlyWindSpeed[i]+' mph</div><div class="hourDetailData">'+weather.hourlyVisibility[i]+' mi</div><div class="hourDetailData">'+weather.hourlyPressure[i]+' mb</div><div class="hourDetailData">'+weather.hourlyOzone[i]+' du</div></div>';

            var daySummaryTemplate ='<div class="day"><div class="dailyDay">'+time.setForecastDay(i)+'</div><div class="dailyIcon">'+weather.dailyIcon[i]+'</div></div>';
            var dayDetailsTemplate = '<div class="dayDetails"><div class="dayDetailData">'+weather.dailyCloudCover[i]+'%</div><div class="dayDetailData">'+weather.dailyPrecipProbability[i]+'%</div><div class="dayDetailData">'+weather.dailyPrecipIntensity[i]+'"</div><div class="dayDetailData">'+weather.dailyHumidity[i]+'%</div><div class="dayDetailData">'+weather.dailyWindSpeed[i]+' mph</div><div class="dayDetailData">'+weather.dailyVisibility[i]+' mi</div><div class="dayDetailData">'+weather.dailyPressure[i]+' mb</div><div class="dayDetailData">'+weather.dailyOzone[i]+' du</div></div>';
            hourlySummaries += hourSummaryTemplate;
            hourlyDetails += hourDetailsTemplate;
            dailySummaries += daySummaryTemplate;
            dailyDetails += dayDetailsTemplate;
         };

         var hourlyTitleTemplate = '<div class="hourlyTitle">Hourly</div>';
         var hourlySummariesTemplate = '<div class="hourlySummaries">'+hourlySummaries+'</div>';
         var hourlyDetailsTemplate = '<div class="hourlyDetails">'+hourlyDetails+'</div>';

         var dailyTitleTemplate = '<div class="dailyTitle">Daily</div>';
         var dailySummariesTemplate = '<div class="dailySummaries">'+dailySummaries+'</div>';
         var dailyDetailsTemplate = '<div class="dailyDetails">'+dailyDetails+'</div>';

         var hourly = hourlyTitleTemplate+hourlySummariesTemplate+hourlyDetailsTemplate;
         var daily = dailyTitleTemplate+dailySummariesTemplate+dailyDetailsTemplate;
         weather.forecasts =[hourly,  daily];
      },
      //toggle the value of weather.currentForecast between "hourly" and "daily"
      setCurrentForecast: function(){
         if(weather.currentForecast == weather.forecasts[0] ){
           weather.currentForecast = weather.forecasts[1];
         } else if (weather.currentForecast == weather.forecasts[1] || weather.currentForecast == ""){
           weather.currentForecast = weather.forecasts[0];
         }
      },
      //display the correct forcast and details on initial page load and when location is updated
      setForecastDisplay: function(){
         if($("#currentSlide").html()==""){
            $("#currentSlide").html(weather.forecasts[0]);
            $("#currentSlide").addClass("hourly");
         }else if($("#currentSlide").hasClass("hourly")){
            $("#currentSlide").html(weather.forecasts[0]);
            if(!$(".detailChart").hasClass("hide")){
               $(".hourlyDetails").addClass("hide");
            }
         }else if($("#currentSlide").hasClass("daily")){
            $("#currentSlide").html(weather.forecasts[1]);
            if(!$(".detailChart").hasClass("hide")){
               $(".dailyDetails").addClass("hide");
            }
         }
      },

      //toggle between hourly and daily forecast
      rotateForecastDisplay: function(){
         if($("#currentSlide").hasClass("hourly")){
            $("#currentSlide").html(weather.forecasts[1]);
            $("#currentSlide").removeClass("hourly");
            $("#currentSlide").addClass("daily");
         }else if($("#currentSlide").hasClass("daily")){
            $("#currentSlide").html(weather.forecasts[0]);
            $("#currentSlide").removeClass("daily");
            $("#currentSlide").addClass("hourly");
         }
      },

      //update templates and display forecast
      displayForecast: function(){
         weather.createForecastTemplates();
         weather.setForecastDisplay();
      },

      //make getJSON request to darksky API and update data, templates, forecast display and charts
      callDarkSkyAPI: function() {
         var coords=location.getCoords();
         var lat = coords[0];
         var lng = coords[1];
         console.log(coords)
         $.getJSON("https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/7353c4ca1f3017f3868f78fac0070c3e/"+lat+","+lng, function(json){
               weather.setWeatherData(json);
               weather.displayCurrentWeather();
               weather.displayForecast();
               updateChart();
            });
      },

      //toggles temperature between Fahrenheit and Celsius
      setTemp: function() {
         if (weather.currentTempUnit=="F") {
            weather.currentTempUnit="C";
            weather.currentTemp=weather.convertFromFtoC(weather.currentTemp);
            for(var i=0; i<weather.hourlyTemp.length; i++){
               weather.hourlyTemp[i]=weather.convertFromFtoC(weather.hourlyTemp[i]);
               weather.dailyHigh[i]=weather.convertFromFtoC(weather.dailyHigh[i]);
               weather.dailyLow[i]=weather.convertFromFtoC(weather.dailyLow[i]);
            }

         } else if (weather.currentTempUnit=="C"){
            weather.currentTempUnit="F";
            weather.currentTemp=weather.convertFromCtoF(weather.currentTemp);
            for(var i=0; i<weather.hourlyTemp.length; i++){
               weather.hourlyTemp[i]=weather.convertFromCtoF(weather.hourlyTemp[i]);
               weather.dailyHigh[i]=weather.convertFromCtoF(weather.dailyHigh[i]);
               weather.dailyLow[i]=weather.convertFromCtoF(weather.dailyLow[i]);
            }
         }
         weather.updateTemp();
      },
      updateTemp: function(){
          weather.displayCurrentWeather();
          updateChart();
      },
      /*
      {var $unit = $(".tempUnit").html();
      var $temp = $(".temp").html();
      $(".tempUnit").html("&degC");
      $(".temp").html( Math.round((($temp - 32) / 1.8 + 0.00001) * 100 / 100).toFixed() );
      $(".tempUnit").html("&degF");
      $(".temp").html(($temp * (9 / 5) + 32).toFixed());},
       */
      convertFromFtoC: function(num){
         num = Math.round(((num - 32) / 1.8 + 0.00001) * 100 / 100).toFixed();
         return num;
      },
      convertFromCtoF: function(num){
         num = (num * (9 / 5) + 32).toFixed();
         return num;
      }
   };

  //object literal containing data and property for toggling forecast details dropdown section
  var forecast = {

     //caretDown click event handler to extend and retract forecast detail dropdown section
     toggleDropDown : function(){
        if(!$(".caretDown").hasClass("caretUpMargin")){
           $(".caretDown").addClass("caretUpMargin")
           $(".forecast").animate({height: "310px"});
           $(".caretDown").html('<i class="fa fa-caret-up"></i>');
        } else if($(".caretDown").hasClass("caretUpMargin")){
           $(".caretDown").removeClass("caretUpMargin")
           $(".forecast").animate({height: "130px"});
           $(".caretDown").html('<i class="fa fa-caret-down"></i>');
        }
     }
  };

  //reference to DOM node to display the temperature chart
  var tempChartCanvas = document.getElementById("myTempChart").getContext('2d');

  //configure and instantiate temperature chart
  var myTempChart = new Chart(tempChartCanvas, {
       type: 'line',
       data: {
           labels: ["hour1", "hour2", "hour3", "hour4", "hour5"],//x-axis labels
           datasets: [{
               tension: 0, // disables bezier curves
               fill:0, //fills in to dataset at this index
               label: 'Temp', //label for the dataset
               data: weather.hourlyTemp,//values for datapoints to be displayed
               backgroundColor: [//fill color under the line
                   'rgba(0, 0, 0, 0.1)',
               ],
               borderColor: [//color of the line
                   'rgba(2,99,132,1)',
               ],
               borderWidth: 1//width of the line
           }],
       },
       options: {
         showDatapoints:true, //include showDatapoints plugin
         maintainAspectRatio: false,
          tooltips:{
            enabled:false,
            opacity:1,
            displayColors:false
         },
         layout:{
           padding:{
              top:20,
              right:35,
              bottom:5,
              left:35
           }
         },
         legend:{
           display:false
         },
         animation:{
           duration:1000,
           easing:'easeInQuad',
         },
         scales: {
           yAxes: [{
             display:false,
             position:"right",//where the axes label will be displayed
             gridLines:{
               display:false//visibility of gridlines horizontal to this axes
             },
             ticks: {
               //min:0,
               //max:100
             }
           }],
           xAxes:[{
             display:false,
             position:"top",
             gridLines:{
               display:false
             },
             ticks: {
             }
           }]
         }
       }
   });

   //reference to DOM node to display the detail chart
   var detailChartCanvas = document.getElementById("myDetailChart").getContext('2d');

   //configure and instantiate detail chart
   var myDetailChart = new Chart(detailChartCanvas, {
       type: 'line',
       data: {
           labels: ["hour1", "hour2", "hour3", "hour4", "hour5"],//x-axes labels
           datasets: [{
               tension: 0, // disables bezier curves
               fill:0, //fills from this data to specified dataset or origin.
               label: 'Temp', //label for the dataset
               data: weather.hourlyTemp,//dailyHigh temperatures
               backgroundColor: [//fill color under the line
                   'rgba(0, 0, 0, 0.1)',
               ],
               borderColor: [//color of the line
                   'rgba(2,99,132,1)',
               ],
               borderWidth: 1//width of the line
           }],
       },
       options: {
         //defaultFontColor:"black",
         maintainAspectRatio: false,
          plugins:{
             showDatapoints:false
          },
          tooltips:{
            enabled:true,
            opacity:1,
            displayColors:false,
         },
         layout:{
           padding:{
              top:0,
              right:15,
              bottom:0,
              left:15
           }
         },
         legend:{
           display:false,
         },
         animation:{
           duration:800,
           easing:'easeInQuad',
         },
         scales: {

           yAxes: [{
             scaleLabel:{
                display:true,
                labelString:"% Cloud Cover",
                fontColor:"black",
             },
             ticks: {
               beginAtZero:true,
                fontColor:"black",
               fontSize:10
             }
           }],
           xAxes:[{
             scaleLabel:{
                display:true,
                labelString:"Time",
                fontColor:"black",
             },
             ticks: {
               beginAtZero:true,
                fontColor:"black",
             }
           }]
         }
       }
   });

   //updates chart datasets and axis labels when location is changed -> called from callDarkSkyAPI function
   function updateChart(){
      var id = myDetailChart.options.title.text;
      var timeUnit = getCurrentTimeUnit();
      if(timeUnit=="hourly"){
         myDetailChart.data.datasets[0].data = weather[timeUnit+id];
         myDetailChart.data.labels = weather.forecastHours;
         myTempChart.data.labels = weather.forecastHours;
         myTempChart.data.datasets[0].data = weather.hourlyTemp;
      }else if (timeUnit=="daily"){
         myDetailChart.data.datasets[0].data = weather[timeUnit+id];
         myDetailChart.data.labels = weather.forecastDays;
         myTempChart.data.labels = weather.forecastDays;
         myTempChart.data.datasets[0].data = weather.dailyHigh;
         myTempChart.data.datasets[1].data = weather.dailyLow;
      }
         myTempChart.options.scales.yAxes[0].ticks.min =findMin();
         myTempChart.options.scales.yAxes[0].ticks.max =findMax();
         myTempChart.update();
         myDetailChart.update();
   };

   //returns the lowest datapoint from tempChart's datasets
   function findMin(){
      var min=[];
      for(var i =0; i<myTempChart.data.datasets.length; i++){
         min.push(Math.min.apply(null,myTempChart.data.datasets[i].data))
      }
      return Math.min.apply(null, min);
   };

   //returns the highest datapoint from tempChart's datasets
   function findMax(){
      var max=[];
      for(var i =0; i<myTempChart.data.datasets.length; i++){
         max.push(Math.max.apply(null, myTempChart.data.datasets[i].data))
      }
      return Math.max.apply(null, max);
   };

   //toggle tempChart between hourly and daily datasets
   function changeTempChartTime(){
      var timeUnit = getCurrentTimeUnit();
      if(timeUnit=="hourly"){
         myTempChart.data.labels = weather.forecastDays;
         myTempChart.data.datasets[0].label = "daily high";
         myTempChart.data.datasets[0].data = weather.dailyHigh;
         myTempChart.data.datasets.push({
               tension: 0, //disable bezier curves
               fill:false, //fills to this dataset
               label: "daily low", //label for the dataset
               data: weather.dailyLow,//dailyLow temperatures
               borderColor: [//color of the line
                   'rgba(2,99,132,1)',
               ],
               borderWidth: 1//width of the line
           })
      } else if(timeUnit=="daily"){
         myTempChart.data.labels = weather.forecastHours;
         myTempChart.data.datasets.pop();
         myTempChart.data.datasets[0].fill=0;
         myTempChart.data.datasets[0].label = "Temp";
         myTempChart.data.datasets[0].data=weather.hourlyTemp;
      }
      myTempChart.options.scales.yAxes[0].ticks.min =findMin();
      myTempChart.options.scales.yAxes[0].ticks.max =findMax();
      myTempChart.update();
   };

   //returns string describing the currently displayed forecast
   function getCurrentTimeUnit(){
      if(myTempChart.data.datasets.length == 1){
         return "hourly";
      } else if(myTempChart.data.datasets.length == 2){
         return "daily";
      }
   };

   //updates detail chart's x-axis title and x-axis unit labels when forecast is toggled between hourly and daily
   function setDetailChartTimeLabels(timeUnit){
      if(timeUnit=="hourly"){
         myDetailChart.data.labels = weather.forecastHours;
         myDetailChart.options.scales.xAxes[0].scaleLabel.labelString="Time";
      } else if(timeUnit=="daily"){
         myDetailChart.data.labels = weather.forecastDays;
         myDetailChart.options.scales.xAxes[0].scaleLabel.labelString="Day";
      }
   };

   //toggle detail section of forecast between chart and text
   function toggleDetailChart(timeUnit, category, elem){
      //only called by detCat and caret
      if($(elem).hasClass("detCat")){
         if($(".detailChart").hasClass("hide")){
            $(".detailChart").removeClass("hide");
            $("."+timeUnit+"Details").addClass("hide");
         } else if(!$(".detailChart").hasClass("hide") && myDetailChart.data.datasets[0].data == weather[timeUnit+category]){
            $(".detailChart").addClass("hide");
            $("."+timeUnit+"Details").removeClass("hide");
         }
      } else if(($(elem).hasClass("caret") || $(elem).hasClass("forecast")) && !$(".detailChart").hasClass("hide")){
         $("."+timeUnit+"Details").addClass("hide");
      }
   };

   //update detail chart's dataset
   function setDetailChartData(timeUnit, category){
      myDetailChart.data.datasets[0].data = weather[timeUnit+category];
   };

   //accepts a reference to the DOM node that updateDetailChart was fired from and returns the an id used to update the detail chart's dataset
   function getCategory(elem){
      var id;
      if($(elem).hasClass("detCat")){
         id = $(elem).attr("id");
      }else{
         id = myDetailChart.options.title.text;
      }
      return id;
   };

   //sets the detail chart's y-axis title and tooltip label
   function setDetailChartDatasetLabels(category){
        myDetailChart.options.title.text = category;
        switch (category) {
            case "CloudCover":
               myDetailChart.data.datasets[0].label = "% Cloud Cover";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "% Cloud Cover";
               break;
            case "PrecipProbability":
               myDetailChart.data.datasets[0].label = "% Chance of Rain";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "% Chance of Rain";
               break;
            case "PrecipIntensity":
               myDetailChart.data.datasets[0].label = "Precipitation (in/Hr)";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "Precipitation (in/Hr)";
               break;
            case "Humidity":
               myDetailChart.data.datasets[0].label = "% Humidity";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "% Humidity";
               break;
            case "WindSpeed":
               myDetailChart.data.datasets[0].label = "Wind Speed (mph)";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "Wind Speed (mph)";
               break;
            case "Visibility":
               myDetailChart.data.datasets[0].label = "Visibility (miles)";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "Visibility (miles)";
               break;
            case "Pressure":
               myDetailChart.data.datasets[0].label = "Atmospheric Pressure (mB)";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "Atmospheric Pressure (mB)";
               break;
            case "Ozone":
               myDetailChart.data.datasets[0].label = "Ozone (DU)";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "Ozone (DU)";
               break;
            default:
               myDetailChart.data.datasets[0].data = [1, 2, 3, 4, 5];
               myDetailChart.data.datasets[0].label = "No Info";
               myDetailChart.options.scales.yAxes[0].scaleLabel.labelString = "No Info";
               break;
         }
   };

   function setDetailChartLabels(timeUnit, category){
      setDetailChartTimeLabels(timeUnit);
      setDetailChartDatasetLabels(category);
   };

   function setDetailChart(timeUnit, category){
      setDetailChartLabels(timeUnit, category);
      setDetailChartData(timeUnit, category);
   };

   //handler for swipe event on forecast and click event on left+right caret and detail Icons, updates detail chart dataset and labels
   function updateDetailChart(){
       var self = this;
       var category = getCategory(self);
       var timeUnit =getCurrentTimeUnit();
       toggleDetailChart(timeUnit, category, self);
       setDetailChart(timeUnit, category)
       myDetailChart.update();
   };

   //mouseOver handler for detail icons to display detail icon names
   function detailIconMouseOver(){
      var html;
      var id = $(this).attr("id");
      switch(id){
             case "CloudCover":
             html = "<div class='hoverLabel'>% Cloud Cover</div>";
             break;
            case "PrecipProbability":
             html = "<div class='hoverLabel'>Chance of Rain</div>";
             break;
            case "PrecipIntensity":
             html = "<div class='hoverLabel'>Precipitation(in/hr)</div>";
             break;
            case "Humidity":
             html = "<div class='hoverLabel'>% Humidity</div>";
             break;
            case "WindSpeed":
             html = "<div class='hoverLabel'>Wind Speed(mph)</div>";
             break;
            case "Visibility":
             html = "<div class='hoverLabel'>Visibility(miles)</div>";
             break;
            case "Pressure":
             html = "<div class='hoverLabel'>Atm Pressure(mb)</div>";
             break;
            case "Ozone":
            html="<div class='hoverLabel'>Ozone(du)</div>"
             break;
             }
      $(this).append(html);
   };

   function detailIconMouseLeave(){
     $(".hoverLabel").remove();
   };

   //plugin to display datapoint values on canvas
   Chart.plugins.register({
        id:"showDatapoints",
        afterDatasetsDraw: function(chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            var fontSize = 12;
            var fontStyle = "normal";
            var fontFamily = "Roboto";
            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
            ctx.fillStyle = "rgba(0, 0, 0, .8)";
            ctx.textBaseline = "bottom";
            ctx.textAlign = "center";
            chartInstance.data.datasets.forEach(function (dataset, i) {
                var meta = chartInstance.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach(function(element, index) {
                       var dataString = dataset.data[index].toString();
                       var position = element.tooltipPosition();
                       var x = position.x;
                       var y = position.y-2;
                       var min = findMin();
                       var max = findMax();
                       var fiveDayDiff = max-min;
                       var singleDayDiff;
                       ctx.textAlign ="center";
                       if(chartInstance.data.datasets.length>1&&i==0){
                           singleDayDiff=chartInstance.data.datasets[0].data[index]-chartInstance.data.datasets[1].data[index];
                           if(singleDayDiff<(fiveDayDiff*.6)){
                              ctx.textAlign = "left";
                           }
                        } else if(chartInstance.data.datasets.length>1&&i==1){
                           singleDayDiff=chartInstance.data.datasets[0].data[index]-chartInstance.data.datasets[1].data[index];
                           if(singleDayDiff<(fiveDayDiff*.6)){
                              ctx.textAlign = "right";
                              y=y+3;
                           }
                        };
                        ctx.fillText(dataString+"°", x, y);
                    });
                }
            });
        }
   });

  //display content in shape of mobile device and center in view
   function centerBorder(){
      var width = parseInt($("body").width());
      if(width>450){
         var margin=($("body").width()-450)/2;
         $(".border").css("margin-left",margin)
      }
   };

   //bind event handlers to DOM
   function addEventHandlers(){
     location.autocomplete.addListener("place_changed", location.onPlaceChanged);
     $("#showWeather").on("click", location.callBrowserGeolocationAPI);
     $(".tempUnit").on("click", weather.setTemp);
     $(".caretDown").on("click", forecast.toggleDropDown);
     $("#caretRight").bind("click", weather.rotateForecastDisplay).bind("click", changeTempChartTime).bind("click", updateDetailChart);
     $("#caretLeft").bind("click", weather.rotateForecastDisplay).bind("click", changeTempChartTime).bind("click", updateDetailChart);
     $("#forecast").bind("swiperight", weather.rotateForecastDisplay).bind("swiperight", changeTempChartTime).bind("swiperight", updateDetailChart).bind("swipeleft", weather.rotateForecastDisplay).bind("swipeleft", changeTempChartTime).bind("swipeleft", updateDetailChart);
     $(".detCat").bind("click", updateDetailChart).bind("mouseover", detailIconMouseOver).bind("mouseleave", detailIconMouseLeave);
     $(window).bind("resize", map.setMapHeight).bind("resize", centerBorder);
     $.mobile.loading().hide();
  };

  //use Google Maps API to update map, use Google Maps Geocode API to reverse geocode coordinates, use DarkSky API to retrieve weather data
  function update(){
     location.callGeocodeAPI();
     map.updateMap();
     weather.callDarkSkyAPI();
  };

  //
  function start() {
     time.setTime();
     setInterval(time.setTime, 1000);
     location.callGeocodeAPI();
     map.initMap();
     weather.callDarkSkyAPI();
     addEventHandlers();
     centerBorder()
  };

  start();
});
