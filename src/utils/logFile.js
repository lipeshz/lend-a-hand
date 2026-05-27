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

async function loggingMessageConstructor(message, data){
    return currentDate + "\n" + message + "\n" + data.requester + "\n" + data.user
}

module.exports = { loggingMessage, loggingMessageConstructor }