const express = require('express');
const mongoose = require('mongoose');

const app = express();


//Aquí invoco la función de formularios de bodyParse
// eliminé eso que estaba para poner esto porque ahora express por defecto ya utiliza bodyParser
app.use(express.urlencoded({extended: true}));
//Lo mismo pero para apps json
//Y con lo mismo me refiero a que también lo eliminé
app.use(express.json())

require('dotenv').config()

// cors
const cors = require('cors');
var corsOptions = {
    origin: '* || http://localhost:8080/', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));


//Conexión a base de datos

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@clusterino.i54qj.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`

//Aquí pasó algo raro, el puntoenv me traia solo el usuario anterior

const option = { useNewUrlParser: true, useUnifiedTopology: true }



mongoose.connect(uri, option)
.then(() => console.log('Base de datos ready'))
.catch(e => console.log('error db:', e))

// import routes, en este caso del archivo auth.js
const authRouters = require("./routes/auth")
//Esto es para palicar lo de JWT
const verifyToken = require('./routes/validate-token');
const admin = require ("./routes/admin");


// route middlewares
app.use("/api/user", authRouters);
app.use("/api/admin", verifyToken, admin);

// Esto era solo para probar que funciona
// app.get('/', (req, res) => {
//     res.json({
//         estado: true,
//         mensaje: 'alive!'
//     })
// });

//Esto sirve para poder hacer que no salga el # cuando usamos las apps
//Además es importante saber que esto solo sirve cuando el proyecto está en una carpeta public, no cuando solo consumimos la API

const history = require('connect-history-api-fallback');
app.use(history());
app.use(express.static(__dirname + "/public"));

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`)
})
