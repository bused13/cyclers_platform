const backendData = [
    {
        "date":"2019-04-05",
        "time":"09:00",
        "duration": 20,
        "distance": 12,

    },
    {
        "date":"2019-04-12",
        "speed":22,
        "dist":43,
        "elevation":10
    },
    {
        "date":"2019-04-13",
        "speed":14,
        "dist":11,
        "elevation":50
    },
    {
        "date":"2019-04-14",
        "speed":23,
        "dist":40,
        "elevation":5
    },
    {
        "date":"2019-04-30",
        "speed":14,
        "dist":11,
        "elevation":50
    }
]

const withoutTime = (date => {
    date.setHours(0,0,0,0);
    return date;
})


YUI().use('calendar', 'datatype-date', 'cssbutton',  function(Y) {
        
    // Create a new instance of calendar, placing it in
    // #mycalendar container, setting its width to 340px,
    // the flags for showing previous and next month's
    // dates in available empty cells to true, and setting
    // the date to today's date.
    var calendar = new Y.Calendar({
      contentBox: "#mycalendar",
      width:'340px',
      showPrevMonth: true,
      showNextMonth: true,
      date: new Date()}).render();

    // Get a reference to Y.DataType.Date
    var dtdate = Y.DataType.Date;

    // Listen to calendar's selectionChange event.
    calendar.on("selectionChange", function (ev) {
        const selectedDate = withoutTime(ev.newSelection[0]);
        let hide = true;
        backendData.forEach(data => {
            const date = withoutTime(new Date(data.date));

            if(selectedDate.getTime() == date.getTime()){
                Y.one("#speed").setHTML(data.speed );
                Y.one("#distance").setHTML(data.dist); 
                Y.one("#duration").setHTML(data.duration); 
                Y.one("#time").setHTML(data.time);
                

                hide = false;
            } 
        })

        if(hide) {
            Y.one("#speed").setHTML();
            Y.one("#distance").setHTML();
            Y.one("#duration").setHTML(); 
            Y.one("#time").setHTML(); 
            
        }

      // Get the date from the list of selected
      // dates returned with the event (since only
      // single selection is enabled by default,
      // we expect there to be only one date)
      var newDate = ev.newSelection[0];

      // Format the date and output it to a DOM
      // element.
      
    });


    // When the 'Show Previous Month' link is clicked,
    // modify the showPrevMonth property to show or hide
    // previous month's dates
    Y.one("#togglePrevMonth").on('click', function (ev) {
      ev.preventDefault();
      calendar.set('showPrevMonth', !(calendar.get("showPrevMonth")));
    });

    // When the 'Show Next Month' link is clicked,
    // modify the showNextMonth property to show or hide
    // next month's dates
    Y.one("#toggleNextMonth").on('click', function (ev) { 
      ev.preventDefault();
      calendar.set('showNextMonth', !(calendar.get("showNextMonth")));
    });
});