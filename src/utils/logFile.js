const { appendFile } = require('fs/promises')
const path = require('path');
const currentDate = new Date();

async function loggingMessage(content){
    try{
        const filePath = path.join(__dirname, '../../logfile.txt');
        await appendFile(filePath, content+"\n")
    }catch(error){
        console.error(error)
    }
}

function loggingMessageConstructor(message, data, action){
    let returnMessage = `DATE: ${currentDate}\n` +
    `ERROR: ${message}\n` +
    `ACTION: ${action}\n` +
    `REQUESTER INFO: id: ${data.requester.id}, name: ${data.requester.name}, email: ${data.requester.email}, type: ${data.requester.type}\n`

    if(data.target) returnMessage += `TARGET: id: ${data.target._id}, name: ${data.target.name}, email: ${data.target.email}, type: ${data.target.type}\n`
    if(data.filter) returnMessage += `FILTERS: ${data.filter}\n`
    if(data.updated) returnMessage += `UPDATED: ${Object.keys(data.updated)} \n`

    return returnMessage
}

module.exports = { loggingMessage, loggingMessageConstructor }