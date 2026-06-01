const { appendFile } = require('fs/promises')
const path = require('path');
const { show } = require('../services/UserService');
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
    const reqData = JSON.stringify(data, null, 2)
    .replace(/[{}[\]",]/g, '')
    .trim();
    
    let dataMessage = reqData
    let returnMessage = `DATE: ${currentDate}\n` +
    `STATUS: ${message}\n` +
    `ACTION: ${action}\n` +
    `REQUEST INFO: \n ${dataMessage}\n`

    return returnMessage
}

module.exports = { loggingMessage, loggingMessageConstructor }