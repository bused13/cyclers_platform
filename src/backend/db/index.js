var cradle = require ('cradle');
var Connection = new(cradle.Connection)
	('http://localhost:5984',
		{auth:{username:"tc91",
			password: "12341"}})

var racesTable = Connection.database('races')
var usersTable = Connection.database('users')

module.exports = {racesTable, usersTable}
