const nameRegex = /^[A-Za-z0-9]{6,10}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail)\.com$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/

const userSchema = {
    name: [
        { test: (val) => nameRegex.test(val), message: "Invalid name!" }
    ],
    email: [
        { test: (val) => emailRegex.test(val), message: "Invalid e-mail" }
        // Validar e-mail único
    ],
    password: [
        { test: (val) => passwordRegex.test(val), message: "Invalid password!" }
    ],
    conf_password: [ 
        { test: (val) => passwordRegex.test(val), message: "Invalid password!" },
        { test: (val, data) => val === data.password, message: "Password doesn't match!" }
    ],
    type: [
        { test: (val) => ["supervisor", "user", "technical"].includes(val), message: "Invalid type" }
    ]
}

const imageRegex = /^[\w,\s-]+\.(jpe?g|png)$/i;

const ticketSchema = {
    title: [
        { test: (val) => val && val.trim().length > 0 && val.length <= 60, message: "Invalid title!"}
    ],
    desc: [
        { test: (val) => !val.length == 0 || !val.length > 200, message: "Invalid description!"}
    ],
    urgency: [
        { test: (val) => ["very urgent", "urgent", "non urgent"].includes(val), message: "Invalid urgency level!"}
    ],
    category: [
        { test: (val) => ["hardware", "software", "conectivity"].includes(val), message: "Invalid category!"}
    ],
    image: [
        { test: (val) => imageRegex.test(val), message: "Invalid image format!"}
    ],
    status: [
        { test: (val) => ["open", "pending", "in service", "closed", "solved"].includes(val), message: "Invalid status!"}
    ],
    openDate: [
        { test: (val) => !isNaN(Date.parse(val)), message: "Invalid date format!" }
    ]
}

module.exports = { userSchema, ticketSchema }