const nameRegex = /^[A-Za-zÀ-ÿ\s]{6,50}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/

const userSchema = {
    name: [
        { test: (val) => val !== null && val !== "", message: "The field name cannot be empty."},
        { test: (val) => typeof(val) === "string" && nameRegex.test(val), message: "Invalid name! Must be 6 to 50 characters and cannot contain special characters." }
    ],
    email: [
        { test: (val) => val !== null && val !== "", message: "The field e-mail cannot be empty."},
        { test: (val) => typeof(val) === "string" && emailRegex.test(val), message: "Invalid e-mail format or domain!" }
    ],
    password: [
        { test: (val) => val !== null && val !== "", message: "The field password cannot be empty."},
        { test: (val) => typeof(val) === "string" && passwordRegex.test(val), message: "Invalid password! Must be at least 6 characters, contain 1 uppercase, 1 number, and 1 special character." }
    ],
    conf_password: [ 
        { test: (val) => val !== null && val !== "", message: "The field password cannot be empty."},
        { test: (val, data) => typeof(val) === "string" && data && val === data.password, message: "Password doesn't match!" }
    ],
    type: [
        { test: (val) => val !== null && val !== "", message: "The field type cannot be empty."},
        { test: (val) => typeof(val) === "string" && ["supervisor", "user", "technical"].includes(val), message: "Invalid type!" }
    ]
}

const imageRegex = /^[\w,\s-]+\.(jpe?g|png)$/i;

const ticketSchema = {
    title: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The title cannot be empty." },
        { test: (val) => typeof(val) === "string" && val.length > 10 && val.length <= 60, message: "Invalid title! Must be 10 to 60 characters." }
    ],
    desc: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The description cannot be empty." },
        { test: (val) => typeof(val) === "string" && val.length > 10 && val.length <= 200, message: "Invalid description! Must be 10 to 250 characters."}
    ],
    urgency: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The title urgency be empty." },
        { test: (val) => typeof(val) === "string" && ["very urgent", "urgent", "non urgent"].includes(val), message: "Invalid urgency level!"}
    ],
    category: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The category cannot be empty." },
        { test: (val) => typeof(val) === "string" && ["hardware", "software", "conectivity"].includes(val), message: "Invalid category!"}
    ],
    image: [
        { test: (val) => (!val || val.trim() === "") ? true : imageRegex.test(val), 
        message: "Invalid image format!" }
    ],
    status: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The status cannot be empty." },
        { test: (val) => typeof(val) === "string" && ["open", "pending", "in service", "closed", "solved"].includes(val), message: "Invalid status!"}
    ],
    openDate: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The open date cannot be empty." },
        { test: (val) => !!val && !isNaN(Date.parse(val)), message: "Invalid date format!" }
    ],
    closeDate: [
        { test: (val) => val !== undefined && val !== null && val !== "", message: "The open date cannot be empty." },
        { test: (val) => !!val && !isNaN(Date.parse(val)), message: "Invalid date format!" }
    ]
}

module.exports = { userSchema, ticketSchema }