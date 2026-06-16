function removeUndefinedFields(data){
    // Object.keys(data).forEach(function(key){
    //     if(Object.values(allowedFields).includes(key) && data[key] !== undefined){
    //         updates[key] = data[key]
    //     }
    // });
    updates = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )

    return updates
}

function filterUpdates(updateData, userData){
    let updates = {}
    Object.keys(updateData).forEach(function(key){
        if(updateData[key] != userData[key]) updates[key] = updateData[key]
    })
    
    return updates
}

const schemaValidation = (data, schema) => {
    let errors = {}
    Object.entries(data).forEach(([keys, values]) => {
        const rules = schema[keys]
        const value = values
        let failedRule = {}
        if(schema[keys]) failedRule = rules.find(item => !item.test(value, data))
        if(failedRule){
            errors[keys] = failedRule.message
        }
        
    })
    
    return errors
}

module.exports = { 
    removeUndefinedFields, 
    schemaValidation,
    filterUpdates
}