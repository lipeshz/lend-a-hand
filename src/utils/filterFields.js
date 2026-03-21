const formatString = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function filterFields(data){
    let filter = {}
    Object.keys(data).forEach(function(key){
        if(data[key] !== undefined && data[key] !== "" && data[key] !== null) filter[key] = new RegExp(formatString(data[key]), 'i')
    })

    return filter
}

module.exports = filterFields