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

module.exports = validateFields