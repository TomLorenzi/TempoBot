const config = require("./config.json");
const express = require('express');
const app = express();

const request = require('request');
const https = require('https');
const http = require('http');

// Load up the discord.js library
const Discord = require("discord.js");


const client = new Discord.Client();

app.listen(8080, () => {
    console.log('Serveur à l\'écoute')
});

app.get('/test', (req, res) => {
    const craftId = req.query.craftId;
    const itemName = req.query.itemName;
    let craftChannel = client.channels.cache.get('829389652351385641');

    const craftEmbed = new Discord.MessageEmbed()
                .setTitle(`Un nouveau craft à été créé`)
                .setColor('#9123ff')
                .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                .addField(`Item :`, itemName)
                .addField(`Voir le craft :`, `${config.serverUrl}/craft/id/${craftId}`);

    craftChannel.send(craftEmbed);
    //Example to fetch channel
    /*client.channels.fetch('829389652351385641')
        .then(channel => channel.send('slt'));*/
    res.sendStatus(200);
})

client.on("ready", () => {
    // Vérification que bot ready
    console.log(`Bot is running`);

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
        const encodedItem = encodeURIComponent(itemName);

        http.get(`${config.serverUrl}/api/getCraftItem/${encodedItem}?apiKey=${config.apiKey}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                const itemEmbed = new Discord.MessageEmbed()
                    .setTitle(`Crafts liés à ${itemName}`)
                    .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg');
                const listCraftId = JSON.parse(data);
            
                if (Array.isArray(listCraftId)) {
                    itemEmbed.setColor('#9123ff');
                    listCraftId.forEach(craftId => {
                        let i = 0;
                        if (i >= 5) {
                            itemEmbed.addField(`Voir plus de craft :`, `${config.serverUrl}/item`);
                            return false;
                        }
                        itemEmbed.addField(`Craft ${craftId}`, `${config.serverUrl}/craft/id/${craftId}`);
                        i++;
                    });
                } else {
                    itemEmbed.setColor('#ff0000');
                    itemEmbed.addField('Erreur', listCraftId);
                }
                
                message.channel.send(itemEmbed);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    if ('test' === command) {
        
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