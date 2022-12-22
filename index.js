const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

var app = express();

app.use(cors());
app.use(bodyparser.json());

var mysqlConnection = mysql.createPool({
    host:'localhost',
    user: 'root',
    password: '',
    database: 'crudprueba'
});

app.listen(3001, () => console.log('Server running at port 3001'));

app.post('/authentication', (req, res) => {
    let user= req.body;
    mysqlConnection.query('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [user.correo, user.contrasena], (err, rows) => {
        if(!err){
            const accessToken = generateAccessToken(user);
            res.header('Authorization', `Bearer ${accessToken}`.status(200).json(rows));
        }else{
            console.log(err);
        }
    })
});

app.get('/clientes', (req, res) => {
    mysqlConnection.query('SELECT * FROM clientes', (err, rows) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err);
        }
    })
});

function generateAccessToken(user){
    return jwt.sign(user, process.env.SECRET, {expiresIn: '1h'});
}