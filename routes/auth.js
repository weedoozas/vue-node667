const router = require ("express").Router();
const User = require('../models/User');
//Este que voy a requerir sirve para hacer las cosas que protejerán el password osea validaciones
const Joi = require("@hapi/joi");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Aquí configuto la librería Joi para la validación esto usualmente va en otro archivo

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

// Aquí valido 

router.post("/login", async(req, res) => {
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'contraseña no válida' })
    
    //Este es el payload
    const token = jwt.sign({
        name: user.name,
        is: user._id
    }, process.env.TOKEN_SECRET )


    res.header("auth-token", token).json({
        error: null,
        data: {token}
    })
})


router.post("/register", async(req, res) => {

    //Validaciones de users
    const { error } = schemaRegister.validate(req.body)
    
    // Con esto valida los usuarios y termina la función sin enviar ni pincho a la DB
    if (error) {
        console.error('Ya la cagaste parce la estructura está mal');
        return res.status(400).json(
            {error: error.details[0].message}
            )
    }

    //Ahora validacmos si ya está registrado

    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json({
            error: true,
            mensaje: "Ya te registraste antes Papá"
        })
    }

    // hash contraseña, que es basicamente encriptar la cosntraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

//Esto novalía porque no había requerido el equivalente del bodyparse que ya instalé al inicio

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password
    })

    try {
        
        const userDB = await user.save();
        res.json({
            error: null,
            data: userDB,
        })

    } catch (error) {
        res.status(400).json(error)
    }

})


//Con esta queda exportado
module.exports= router;