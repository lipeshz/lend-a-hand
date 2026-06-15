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
    Object.keys(data).forEach(key => {
        const rules = schema[key]
        const value = data[key]
    
        const failedRule = rules.find(item => !item.test(value, data))
        if(failedRule){
            errors[key] = failedRule.message
            return errors
        }
        
    })
    
    return errors
}

module.exports = { 
    removeUndefinedFields, 
    schemaValidation,
    filterUpdates
}