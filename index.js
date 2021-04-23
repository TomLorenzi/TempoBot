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

app.get('/newCraft', (req, res) => {
    res.sendStatus(200);
    const craftId = req.query.craftId;
    const itemName = req.query.itemName;
    let craftChannel = client.channels.cache.get(config.broadcastChannel);

    const craftEmbed = new Discord.MessageEmbed()
        .setTitle(`Un nouveau craft à été créé`)
        .setColor('#9123ff')
        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
        .addField(`Item :`, itemName)
        .addField(`Voir le craft :`, `${config.serverUrl}/craft/id/${craftId}`);

    craftChannel.send(craftEmbed);
    let customChannel = client.channels.cache.get(config.customChannel);
    customChannel.send(craftEmbed);

    //Example to fetch channel
    /*client.channels.fetch('829389652351385641')
        .then(channel => channel.send('slt'));*/
    
});

app.get('/notifications', function (req, res) {
    res.sendStatus(200);
    if (req.query.key !== config.symfonyKey) {
        return;
    }
    const itemEmbed = new Discord.MessageEmbed()
        .setTitle(`Un nouveau craft pour un item auquel vous êtes abonné à été créé`)
        .setColor('#9123ff')
        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
        .addField(`Item :`, req.query.itemName)
        .addField(`Voir le craft :`, `${config.serverUrl}/craft/id/${req.query.craftId}`);
    
        Object.keys(req.query.discordIdList).forEach(discordId => {
        client.users.fetch(discordId).then(
            user => user.send(itemEmbed)
        )
    });
});

client.on("ready", () => {
    // Vérification que bot ready
    console.log(`Bot is running`);

    client.user.setActivity(`Bot by Nira`);
});

client.on("message", async message => {
    if(message.author.bot) return;

    const id = message.member.id;

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    if (command === 'craft') {
        if (config.commandChannel !== message.channel.id && config.customChannel !== message.channel.id) {
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

        http.get(`${config.serverUrl}/api/getCraftItem?apiKey=${config.apiKey}&itemName=${itemName}`, (resp) => {
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

    if ('follow' === command) {
        if (config.commandChannel !== message.channel.id && config.customChannel !== message.channel.id) {
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

        http.get(`${config.serverUrl}/api/followItem?apiKey=${config.apiKey}&discordId=${id}&itemName=${itemName}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                
                const response = JSON.parse(data);
            
                const subscribeEmbed = new Discord.MessageEmbed();
                if (response.success) {
                    subscribeEmbed
                        .setTitle('Abonnement confirmé')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#32CD32')
                        .addField('Abonement réussit', response.message);
                } else {
                    subscribeEmbed
                        .setTitle('Erreur')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#ff0000')
                        .addField('Abonnement échoué', response.message);
                }
                
                message.channel.send(subscribeEmbed);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    if ('stop' === command) {
        if (config.commandChannel !== message.channel.id && config.customChannel !== message.channel.id) {
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

        http.get(`${config.serverUrl}/api/stopFollowItem?apiKey=${config.apiKey}&discordId=${id}&itemName=${itemName}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                
                const response = JSON.parse(data);
            
                const subscribeEmbed = new Discord.MessageEmbed();
                if (response.success) {
                    subscribeEmbed
                        .setTitle('Supression confirmé')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#32CD32')
                        .addField('Suppression réussit', response.message);
                } else {
                    subscribeEmbed
                        .setTitle('Erreur')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#ff0000')
                        .addField('Suppression échoué', response.message);
                }
                
                message.channel.send(subscribeEmbed);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    if ('list' === command) {
        if (config.commandChannel !== message.channel.id && config.customChannel !== message.channel.id) {
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

        http.get(`${config.serverUrl}/api/followList?apiKey=${config.apiKey}&discordId=${id}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                
                const response = JSON.parse(data);
            
                const subscribeEmbed = new Discord.MessageEmbed();
                if (response.success) {
                    let formattedMessage = '';
                    response.subscriptions.forEach(sub => {
                        formattedMessage += `- ${sub}\n`
                    });
                    subscribeEmbed
                        .setTitle('Liste des abonnements')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#32CD32')
                        .addField('Liste', formattedMessage);
                } else {
                    subscribeEmbed
                        .setTitle('Erreur')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#ff0000')
                        .addField('Erreur', response.message);
                }
                
                message.channel.send(subscribeEmbed);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    if ('reset' === command) {
        if (config.commandChannel !== message.channel.id && config.customChannel !== message.channel.id) {
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

        http.get(`${config.serverUrl}/api/resetFollow?apiKey=${config.apiKey}&discordId=${id}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                
                const response = JSON.parse(data);
            
                const subscribeEmbed = new Discord.MessageEmbed();
                if (response.success) {
                    subscribeEmbed
                        .setTitle('Suppressions des abonnements')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#32CD32')
                        .addField('Succès', response.message);
                } else {
                    subscribeEmbed
                        .setTitle('Erreur')
                        .setAuthor('TempoBot', 'https://i.imgur.com/1VxMWX9.jpg')
                        .setColor('#ff0000')
                        .addField('Suppression échoué', response.message);
                }
                
                message.channel.send(subscribeEmbed);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
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