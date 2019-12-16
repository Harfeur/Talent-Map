var express = require('express');
var app = express();
var dateFormat = require('dateformat');

var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database.db');

app.use('/', express.static(__dirname + '/public/'));

app.use('/packages', express.static(__dirname + '/node_modules/'));

app.get('/personnels', function(req, res) {
	let sql = 'SELECT * FROM Personnels';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/competences', function(req, res) {
	let sql = 'SELECT Libelle FROM Competences';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows.sort());
	});
});


app.get('/personnelCompetence', function(req, res) {
	let libelle = req.query.libelle;
	var stmt = db.prepare('SELECT nom FROM Personnels, Competences, CompetencesPersonnels where Personnels.id=CompetencesPersonnels.id and CompetencesPersonnels.id=Personnels.id and Competences.libelle LIKE ?');
	stmt.run(0, libelle);
	stmt.finalize();
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

var port = 8080;
var server = app.listen(port, function(){
  console.log('listening on *:'+port);
});

