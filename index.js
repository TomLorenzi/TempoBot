const config = require("./config.json");
const express = require('express');
const app = express();

const request = require('request');
const https = require('https');

// Load up the discord.js library
const Discord = require("discord.js");


const client = new Discord.Client();

app.listen(8080, () => {
    console.log('Serveur à l\'écoute')
});

app.get('/parkings', (req,res) => {
    
})

client.on("ready", () => {
    // Vérification que bot ready
    console.log(`Le bot fonctionne, avec ${client.users.size} utilisateurs, dans ${client.channels.size} channels de ${client.guilds.size} serveur(s).`);

    client.user.setActivity(`Bot by Nira`);
});

client.on("message", async message => {
    if(message.author.bot) return;

    const id = message.member.id;

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if(message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    if (command === 'craft') {
        if ('829389652351385641' !== message.channel.id) {
            return;
        }
        let itemName = '';
        let i = 0;
        args.forEach(namePart => {
            itemName += namePart;
            i++;
            if (args.length > i) {
                itemName += ' ';
            }
        });
        
        message.channel.send(itemName);
    }

    if(command === 'ping') {
        if (message.author.id !== "286982756469047296") {
            return;
        }

        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latence ${m.createdTimestamp - message.createdTimestamp}ms. Latence de l'API : ${Math.round(client.ping)}ms`);
    }
});

client.login(config.token);