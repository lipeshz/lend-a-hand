const { update } = require("../services/UserService");

function validateFields(data, allowedFields, updates){
    Object.keys(data).forEach(function(key){
        if(Object.values(allowedFields).includes(key) && data[key] !== undefined){
            updates[key] = data[key]
        }
    });
    // console.log(allowedFields)
    // console.log(updates)
    // console.log(data)
    return updates
}

function filterUpdates(updateData, userData){
    let updates = {}
    Object.keys(updateData).forEach(function(key){
        if(updateData[key] != userData[key]) updates[key] = updateData[key]
    })
    
    return updates
}

// Validação dos campos do usuário
const validateUserData = (data, schema, errors) => {
    Object.keys(data).forEach(function(key){
        const rules = schema[key]
        const value = data[key]

        if(rules){
            // rules.forEach(rule => {
            //     if(!rule.test(value, data)){
            //         errors[key] = rule.message
            //     }
            // })
            const failedRule = rules.find(rule => !rule.test(value, data)) // Usar .find() para não sobrepor a mensagem de erro
            if(failedRule)
                errors[key] = failedRule.message // Acessar a message pelo failedRule
        }
    })
    return errors
}

module.exports = { 
    validateFields, 
    validateUserData,
    filterUpdates
}