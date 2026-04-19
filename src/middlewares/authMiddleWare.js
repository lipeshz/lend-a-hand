const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    // Captura o token da requisição
    const authHeader = req.headers.authorization
    // Retorna um erro caso o token não exista
    if(!authHeader) return res.status(401).send({error: "The token doesn't exists!"})

    const parts = authHeader.split(' ')[1]
    const token = parts

    // Valida o token e injeta no header para os outros controllers poderem acessar
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(401).send({error: 'Invalid token!'});

        req.userId = decoded.id;
        return next();
    })
}