const express = require('express');

const server = express();

server.use(express.json());

const users = ["cassio", "claudio", "fabio"];

// Middleware Global
server.use((req, res, next) => {
    console.time('Request');
    console.log(`Método: ${req.method}; URL: ${req.url}`);

    // vai para o proximo sem bloquear a continuação do metodo, (ira continuar chamando o console.timeEnd mesmo indo para o proximo).
    next();

    console.timeEnd('Request');
})

// Middleware Local
function checkUserExists(req, res, next) {
    if (!req.body.objetos) {
        return res.status(400).json({error: 'Insira corretamente o nome do objeto'});
    }

    return next();
}

// Middleware Local
function checkUserInArray(req, res, next) {
    const user = users[req.params.index]

    if (!user) {
        return res.status(400).json({error: 'Usuario não existe!'});
    }

    // Estou adicionando mais um parametro na requição (Que foi mandada pelo postman) que fornecerá diretamente 
    // quem é o usuario(Fará a busca no array antes de chegar no metodo que utilizará esse objeto), 
    // para que possa ser reutilizado no metodo GET/ID de forma direta.
    req.user = user;

    return next();
}

server.get('/users', (req, res) => {
    return res.json({objetos: users});
})

server.get('/users/:index', checkUserInArray, (req, res) => {
    // Essa seria a forma de fazer esse metodo sem a adição de um novo parametro no REQ pelo CheckuserInArray.
    // const { index } = req.params;
    // return res.json({ objeto: users[index]});

    // Essa é a forma após a adição de um novo parametro pelo CheckuserInArray
    return res.json(req.user);
});

server.post('/users', checkUserExists, (req, res) => {
    const { objetos } = req.body
    users.push(objetos)
    
    return res.json(users)
})

server.put('/users/:index', checkUserExists, checkUserInArray, (req, res) => {
    const {objetos} = req.body
    const {index} = req.params
    users[index] = objetos
    return res.json(users)
})

server.delete('/users/:index', checkUserInArray, (req, res) => {
    const {index} = req.params
    users.splice(index, 1);
    return res.send();
})

server.listen(3000);