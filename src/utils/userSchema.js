const nameRegex = /^[A-Za-z0-9]{6,10}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail)\.com$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/

// Rule map - Substitui a cadeia de if/else por um hashmap
const schema = {
    name: [
        { test: (val) => nameRegex.teset(val), message: "Invalid name!" }
    ],
    email: [
        { test: (val) => emailRegex.test(val), message: "Invalid e-mail" }
    ],
    password: [
        { test: (val) => passwordRegex.test(val), message: "Invalid password!" }

    ],
    conf_password: [ 
        { test: (val) => passwordRegex.test(val), message: "Invalid password!" },
        { test: (val, data) => val != data.password, message: "Password doesn't match!" }
    ]
}

module.exports = schema