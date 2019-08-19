var name = localStorage.getItem("name");
var to = [];
var from = [];
var dateTime = [];
var distance = [];

to = JSON.parse(localStorage.getItem("to"));
from = JSON.parse(localStorage.getItem("from"));
dateTime = JSON.parse(localStorage.getItem("dateTime"));
distance = JSON.parse(localStorage.getItem("distance"));


function sort () {
    scores = scores.sort(function(a,b) {
        return b.score - a.score;
    });
}

function createTable () {
    var table = document.getElementById("board");
    table.border = "1px";
    for (var j = 0; j < scores.length && j < 10; j++) {
        var row = table.insertRow(j+1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        cell1.innerHTML = j+1;
        cell2.innerHTML = to[j];
        cell3.innerHTML = from[j];
        cell4.innerHTML = dateTime[j];
        cell5.innerHTML = distance[j];
    }
}

sort ();
createTable();
