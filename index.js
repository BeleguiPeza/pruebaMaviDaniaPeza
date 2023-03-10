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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.listen(3001, () => console.log('Server running at port 3001'));

app.post('/authentication', (req, res) => {
    let user= req.body;
    mysqlConnection.query('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [user.correo, user.contrasena], async(err, rows) => {
        if(!err){
            const accessToken = await generateAccessToken(user);
            const dataUser = {
                token: accessToken,
                Id: rows[0].Id,
                correo: rows[0].correo,
                nombre: rows[0].nombre
            }
            res.header('Authorization', `Bearer ${accessToken}`).status(200).json(dataUser);
        }else{
            console.log(err);
        }
    })
});

app.get('/clients', (req, res) => {

    let token = req.header('Authorization');
    if(!token) return res.json({success: false, error: 'Acceso denegado', code: 401});
    if(!token.startsWith('Bearer')) return res.json({success: false, error: 'Invalid session token', code: 403});

    mysqlConnection.query('SELECT * FROM clientes', (err, rows) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err);
        }
    })
});

app.get('/client/:id', (req, res) => {
    mysqlConnection.query('SELECT * FROM clientes WHERE Id = ?', [req.params.id], (err, rows) => {
        if(!err){
            res.json(rows);
        }else{
            console.log(err);
        }
    })
});

app.post('/client',  (req, res) => {
    let client = req.body;
    mysqlConnection.query('INSERT INTO clientes(nombre, apellidoPaterno, apellidoMaterno, domicilio, correo) VALUES (?, ?, ?, ?, ?)', 
    [client.nombre, client.apellidoPaterno, client.apellidoMaterno, client.domicilio, client.correo], (err) => {
        if(!err){
            res.json('Insert successfuly');
        }else{
            console.log(err)
        }
    })
});

app.put('/client', (req, res) => {
    let client = req.body;
    mysqlConnection.query('UPDATE clientes SET nombre = ?, apellidoPaterno = ?, apellidoMaterno = ?, domicilio = ?, correo = ? WHERE Id = ?', 
    [client.nombre, client.apellidoPaterno, client.apellidoMaterno, client.domicilio, client.correo, client.Id], (err) => {
        if(!err){
            res.json('Updated successfuly');
        }else{
            console.log(err)
        }
    })
});

app.delete('/client/:id', (req,res) => {
    mysqlConnection.query('DELETE FROM clientes WHERE Id = ?', [req.params.id], (err, rows) => {
        if(!err){
            res.json('Deleted successfuly');
        }else{
            console.log(err);
        }
    })
});

function generateAccessToken(user){
    return jwt.sign(user, process.env.SECRET, {expiresIn: '1h'})
}