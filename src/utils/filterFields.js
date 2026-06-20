const formatString = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Monta os objetos da query do db
function filterFields(data){
    let filter = {}
    
    for(const key in data){
        if(data[key] !== undefine && data[key] !== "" && data[key] !== null) filter[key] = new RegExp(formatString(data[key]), 'i')
    }

    return filter
}

module.exports = filterFields