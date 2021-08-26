//Este es un middleware y en teoría debería ir en la carpeta de middlewares
//Sirve para encriptar lo que viene del front

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header("auth-token")
    if(!token) return res.status(401).json({error: "Acceso denegado"})

    try {
        const verificar = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verificar
        next()
    } catch (error) {
        res.status(400).json({error: "Token no es válido papá"})
    }
}

module.exports= verifyToken;