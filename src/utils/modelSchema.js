const nameRegex = /^[A-Za-zÀ-ÿ\s]{6,50}$/
const emailRegex = /^(?!.*\.\.)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/

const userSchema = {
    name: [
        { test: (val) => val === null || val === "" || val === undefined, message: "The field name cannot be empty."},
        { test: (val) => typeof(val)!== "string", message: "Invalid name type." },
        { test: (val) => !nameRegex.test(val), message: "Invalid name! Must be 6 to 50 characters and cannot contain special characters." }
    ],
    email: [
        { test: (val) => val === null || val === "" || val === undefined, message: "The field e-mail cannot be empty."},
        { test: (val) => typeof(val) !== "string", message: "Invalid e-mail type." },
        { test: (val) => !emailRegex.test(val), message: "Invalid e-mail format or domain!"}
    ],
    password: [
        { test: (val) => val === null || val === "" || val === undefined, message: "The field password cannot be empty."},
        { test: (val) => typeof(val) !== "string", message: "Invalid password type." },
        { test: (val) => !passwordRegex.test(val), message: "Invalid password! Must be at least 6 characters, contain 1 uppercase, 1 number, and 1 special character."}
    ],
    conf_password: [ 
        { test: (val) => val === null || val === "" || val === undefined, message: "The field password cannot be empty."},
        { test: (val) => typeof(val) !== "string" },
        { test: (val, data) => val !== data.password, message: "Password doesn't match!"}
    ],
    type: [
        { test: (val) => val === null || val === "" || val === undefined, message: "The field type cannot be empty."},
        { test: (val) => typeof(val) !== "string", message: "Invalid type format." },
        { test: (val) => !["supervisor", "user", "technical"].includes(val), message: "Invalid type. Must be user, supervisor or technical."}
    ]
}

const imageRegex = /^[\w,\s-]+\.(jpe?g|png)$/i;

const ticketSchema = {
    title: [
        { test: (val) => val === undefined || val === null || val === "", message: "The title cannot be empty." },
        { test: (val) => typeof(val) !== "string", message: "Invalid title type." },
        { test: (val) => val.length < 10 || val.length > 60, message: "Invalid title! Must be 10 to 60 characters." }
    ],
    desc: [
        { test: (val) => val === undefined || val === null || val === "", message: "The description cannot be empty." },
        { test: (val) => typeof(val) !== "string", message: "Invalid description type." },
        { test: (val) => val.length < 10 && val.length > 200, message: "Invalid description! Must be 10 to 250 characters."}
    ],
    urgency: [
        { test: (val) => val === undefined || val === null || val === "", message: "The urgency cannot be empty." },
        { test: (val) => typeof(val) !== "string", message: "Invalid urgency type." },
        { test: (val) => !["very urgent", "urgent", "non urgent"].includes(val), message: "Invalid urgency level!"}
    ],
    category: [
        { test: (val) => val === undefined || val === null || val === "", message: "The category cannot be empty." },
        { test: (val) => typeof(val) !== "string", message: "Invalid category type." },
        { test: (val) => !["hardware", "software", "conectivity"].includes(val), message: "Invalid category!"}
    ],
    image: [
        { test: (val) => (val === undefined || val === null || val === "") ? true : imageRegex.test(val), 
        message: "Invalid image format!" }
    ],
    status: [
        { test: (val) => val === undefined || val === null || val === "", message: "The status cannot be empty." },
        { test: (val) => typeof(val) !== "string" || !["open", "pending", "in service", "solved"].includes(val), message: "Invalid status!"}
    ],
    openDate: [
        { test: (val) => val === undefined || val === null || val === "", message: "The open date cannot be empty." },
        { test: (val) => isNaN(Date.parse(val)), message: "Invalid date format!" }
    ],
    closeDate: [
        { test: (val) => val === undefined || val === null || val === "", message: "The close date cannot be empty." },
        { test: (val) => isNaN(Date.parse(val)), message: "Invalid date format!" },
    ],
    crator: [
        { test: (val) => val === undefined || val === null || val === "", message: "The creator ID cannot be empty." },
        { test: (val) => typeof(val) !== "string", message: "Invalid creator ID type."}
    ],
    technical: [
        { test: (val) => val === undefined || val === null || val === "", message: "The technical ID cannot be empty." },
        { test: (val) => typeof(val) !== "string", message: "Invalid technical ID type."},
    ],
    solution: [
        { test: (val) => val === undefined || val === null || val === "", message: "The solution cannot be empty." },
        { test: (val) => typeof(val) !== "string" && val.length <= 500, message: "Invalid solution! Must be lower than 500 characters." },
    ]
}

const ticketState = {
    status: [
        { test: (val, data) => val === "solved" && (!data.technical || !data.solution || !data.closeDate), message: "It is not possible close the ticket without a solution, a technical and a valid close date." },
        { test: (val, data) => val === "in service" && !data.technical, message: "It is not possible " }
    ],
    solution: [
        { test: (val, data) => !data.status || !data.technical || !data.closeDate, message: "It is not possible insert a solution without a status, a technical and a valid close date." }
    ],
    closeDate: [
        { test: (val, data) => !data.status === "solved" || !data.technical || !data.solution, message: "It is not possible close the ticket without the solved status, a technical and a solution." }
    ]
}

module.exports = { userSchema, ticketSchema, ticketState }