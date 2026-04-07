const formatString = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Monta os objetos da query do db
function filterFields(data){
    let filter = {}
    Object.keys(data).forEach(function(key){
        if(data[key] !== undefined && data[key] !== "" && data[key] !== null) filter[key] = new RegExp(formatString(data[key]), 'i')
    })

    return filter
}

module.exports = filterFields