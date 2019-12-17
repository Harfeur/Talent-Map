const express = require('express');
const app = express();
const dateFormat = require('dateformat');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database_modif.db');

var port = process.env.PORT || 8080;

app.use('/', express.static(__dirname + '/public/'));

app.use('/packages', express.static(__dirname + '/node_modules/'));



app.get('/unPersonnel', function (req, res) {
	let query = req.query;
	let sql = `SELECT *, Personnels.id AS pid, Services.libelle AS serviceLibelle, Postes.libelle AS posteLibelle FROM Personnels, Services, Postes 
				where Personnels.fk_id_service=Services.id
				and Personnels.fk_id_poste=Postes.id
				and Personnels.id=${query.id}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/personnels', function (req, res) {
	let sql = `SELECT *, Personnels.id AS pid, Services.libelle AS serviceLibelle, Postes.libelle AS posteLibelle FROM Personnels, Services, Postes
				where Personnels.fk_id_service=Services.id
				and Personnels.fk_id_poste=Postes.id
				ORDER BY Personnels.nom`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/competencesDunPersonnel', function (req, res) {
	let query = req.query;
	let sql = `SELECT Competences.id, Competences.libelle, CompetencesPersonnels.pourcentAcquis
				FROM Personnels, Competences, CompetencesPersonnels
				where Personnels.id=CompetencesPersonnels.fk_id_personnel 
				and CompetencesPersonnels.fk_id_competence=Competences.id
				and Personnels.id=${query.id}
				ORDER BY Competences.libelle`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/listeCompetences', function (req, res) {
	let sql = 'SELECT * FROM Competences ORDER BY libelle ASC';
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});


app.get('/personnelCompetence', function (req, res) {
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

app.get('/postes', function (req, res) {
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
app.get('/unposte', function (req, res) {
	let query = req.query;
	let sql = `SELECT * FROM Postes where id=${query.id}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/competencesPoste', function (req, res) {
	let query = req.query;
	let sql = `SELECT Competences.id, Competences.libelle, CompetencesPostes.pourcentRequis FROM Postes, Competences, CompetencesPostes 
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


app.get('/competencesPersonnel', function (req, res) {
	let query = req.query;
	let sql = `SELECT Competences.id, Competences.libelle, CompetencesPersonnels.pourcentAcquis
				FROM Personnels, Competences, CompetencesPersonnels
				where Personnels.id=CompetencesPersonnels.fk_id_personnel 
				and CompetencesPersonnels.fk_id_competence=Competences.id
				and Personnels.id=${query.idPersonnel}
				and Competences.id IN (SELECT Competences.id FROM Postes, Competences, CompetencesPostes 
				where Postes.id=CompetencesPostes.fk_id_poste 
				and CompetencesPostes.fk_id_competence=Competences.id
				and Postes.id=${query.idPoste});`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});



/******************************************************************* */
/*
						Suggestions Formations
*/
/******************************************************************* */

app.get('/suggestFormation', function (req, res) {
	let query = req.query;
	let sql = `SELECT Formations.id, Formations.libelle FROM Formations, Competences, FormationsCompetences 
				where Formations.id=FormationsCompetences.fk_id_formation 
				and FormationsCompetences.fk_id_competence=Competences.id
				and Competences.id=${query.id}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/suggestTuteur', function (req, res) {
	let query = req.query;
	let sql = `SELECT Personnels.id, Personnels.nom, CompetencesPersonnels.pourcentAcquis FROM Personnels, Competences, CompetencesPersonnels 
				where Competences.id=CompetencesPersonnels.fk_id_competence 
				and CompetencesPersonnels.fk_id_personnel=Personnels.id
				and Competences.id=${query.id}
				and CompetencesPersonnels.pourcentAcquis=100`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});


/******************************************************************* */
/*
						Formations
*/
/******************************************************************* */


app.get('/toutesFormations', function(req, res) {
	let sql = `SELECT * FROM Formations ORDER BY libelle`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/formationsUnPersonnel', function(req, res) {
	let query = req.query;
	let sql = `SELECT * 
				FROM Formations, Personnels, FormationsPersonnels 
				WHERE Formations.id=FormationsPersonnels.fk_id_formation
				and FormationsPersonnels.fk_id_personnel=Personnels.id
				and Personnels.id = ${query.id} 
				ORDER BY libelle`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/uneFormation', function(req, res) {
	let query = req.query;
	let sql = `SELECT * FROM Formations WHERE Formations.id=${query.id}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/ajoutFormation', function(req, res) {
	let query = req.query;
	let sql = `INSERT INTO Formations (libelle) VALUES ('${query.libelle}')`;
	db.run(sql, [], function(err) {
		if (err) {
		  return console.log(err.message);
		}
		
		// get the last insert id
		console.log(`A row has been inserted with rowid ${this.lastID}`);
		return this.lastID;
	  });
});
 
app.get('/formationDateValidite', function(req, res) {
	let query = req.query;
	let sql = `SELECT Personnels.id, Personnels.nom, Formations.id, Formations.libelle, FormationsPersonnels.date_validite 
				FROM Personnels, Formations, FormationsPersonnels 
				WHERE Personnels.id = FormationsPersonnels.fk_id_personnel
				and FormationsPersonnels.fk_id_formation = Formations.id
				and FormationsPersonnels.date_validite IS NOT NULL
				ORDER BY FormationsPersonnels.date_validite, Personnels.nom`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows);
	});
});

app.get('/ajoutFormationPersonnel', function(req, res) {
	let query = req.query;
	let sql = `INSERT INTO FormationsPersonnels(fk_id_formation,fk_id_personnel,date_debut,date_fin,heure,date_validite) VALUES (${query.idFormation},${query.idPersonnel},'${query.dateDebut}','${query.dateFin}',${query.heures},'${query.dateValidite}')`;
	console.log(sql);
	db.run(sql, [], function(err) {
		if (err) {
		  return console.log(err.message);
		}
		// get the last insert id
		console.log(`A row has been inserted with rowid ${this.lastID}`);
	  });
});

var server = app.listen(port, function () {
	console.log('listening on *:' + port);
});