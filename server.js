var express = require('express');
var app = express();
var dateFormat = require('dateformat');

var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database_modif.db');

app.use('/', express.static(__dirname + '/public/'));

app.use('/packages', express.static(__dirname + '/node_modules/'));

app.get('/personnels', function(req, res) {
	let sql = 'SELECT * FROM Personnels ORDER BY nom ASC';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/listeCompetences', function(req, res) {
	let sql = 'SELECT * FROM Competences ORDER BY libelle ASC';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});


app.get('/personnelCompetence', function(req, res) {
	let query = req.query;
	let sql = `SELECT nom, pourcentAcquis FROM Personnels, Competences, CompetencesPersonnels 
				where Personnels.id=CompetencesPersonnels.fk_id_personnel 
				and CompetencesPersonnels.fk_id_competence=Competences.id 
				and Competences.id = ${query.id} 
				and CompetencesPersonnels.pourcentAcquis >= ${query.pourcent} ORDER BY pourcentAcquis DESC`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/postes', function(req, res) {
	let sql = 'SELECT * FROM Postes ORDER BY libelle ASC';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});


/******************************************************************* */
/*
						Comparatif Poste vs Personnel
*/
/******************************************************************* */
app.get('/unposte', function(req, res) {
	let query = req.query;
	let sql = 'SELECT * FROM Postes where id=${query.id}';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/competencesPoste', function(req, res) {
	let query = req.query;
	let sql = `SELECT Competences.libelle, CompetencesPostes.pourcentRequis FROM Postes, Competences, CompetencesPostes 
				where Postes.id=CompetencesPostes.fk_id_poste 
				and CompetencesPostes.fk_id_competence=Competences.id
				and Postes.id=${query.id}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});


app.get('/competencesPersonnel', function(req, res) {
	let query = req.query;
	let sql = `SELECT Competences.libelle, CompetencesPersonnels.pourcentAcquis FROM Personnels, Competences, CompetencesPersonnels 
				where Personnels.id=CompetencesPersonnels.fk_id_personnel 
				and CompetencesPersonnels.fk_id_competence=Competences.id
				and Personnels.id=${query.id}`;
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

