function removeUndefinedFields(data){
    let updates = {}
    for(const key in data){
        let value = data[key]
        if(data[key] !== undefined) updates[key] = value
    }
    return updates
}

function filterUpdates(updateData, userData){
    let updates = {}
    for(const key in updateData){
        if(updateData[key] != userData[key]) updates[key] = updateData[key]
    }
    
    return updates
}

const schemaValidation = (data, schema) => {
    let errors = {}

    for(const key in data){
        const value = data[key]
        const rules = schema[key]
        if(!rules) continue;

        const failedRule = rules.find(item => item.test(value, data))
        
        if(failedRule){
            errors[key] = failedRule.message
        }
    }
    return errors
}

module.exports = { 
    removeUndefinedFields, 
    schemaValidation,
    filterUpdates
}