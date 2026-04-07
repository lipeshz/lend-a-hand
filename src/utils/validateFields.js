function validateFields(data, allowedFields){
    let updates = {}
    Object.keys(data).forEach(function(key){
        if(allowedFields.includes(key) && data[key] !== undefined){
            updates[key] = data[key]
        }
    });
    // console.log(allowedFields)
    // console.log(updates)
    // console.log(data)
    return updates
}

// Validação dos campos do usuário
const validateUserData = (data, schema) => {
    let errors = {}
    Object.keys(data).forEach(function(key){
        const rules = schema[key]
        const value = data[key]

        if(rules){
            rules.forEach(rule => {
                if(!rule.test(value, data)){
                    errors.key = rule.message
                }
            })
        }
    })
}

module.exports = validateFields, validateUserData