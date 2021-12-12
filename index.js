const rateLimit = require("express-rate-limit");
const express = require('express')
var session = require('express-session')
var Recaptcha = require('express-recaptcha').RecaptchaV3;
const { Client, Intents } = require('discord.js');
require('dotenv').config()
const fetch = require('node-fetch');
const button = require('./button')

var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY, {callback: "cb", "action": "buttonDEV"});
const app = express()
const client = new Client({ intents: ["GUILDS", "GUILD_MEMBERS"] });
const port = 83
button.init()
const limiter = rateLimit({
	windowMs: 1000, // 15 minutes
	max: 1 // limit each IP to 100 requests per windowMs
});
const discordUrl = "https://discord.com/api/oauth2/authorize?client_id=876183728970412072&redirect_uri=https%3A%2F%2Fbutton.vukkybox.com%2Fdiscord&response_type=code&scope=identify"

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}))

app.set('view engine', 'ejs');

function roleNameToRoleId(roleName) {
	return new Promise(function(resolve, reject) {
		button.ranks.forEach(rank => {
			if (rank.name == roleName) {
				resolve(rank.role)
			}
		})

	})
}

app.get("/health", function(req, res){
	res.send({healthLevel: button.healthLevel(), isAlive: button.isAlive(), health: button.health()})
})

app.get('/style.css', function(req, res) {
	res.sendFile(__dirname + '/style.css')
})

app.get('/discord', function(req, res) {
	if (!req.session.rank) return res.send("You do not have a rank!")
	let code = req.query.code
	if (code) {
		try {
			fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: process.env.DISCORD_ID,
					client_secret: process.env.DISCORD_SECRET,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `https://button.vukkybox.com/discord`,
					scope: 'identify',
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			})
			.then(res => res.json())
			.then(json => {
				fetch('https://discord.com/api/users/@me', {
					headers: {
						authorization: `${json.token_type} ${json.access_token}`,
					},
				})
				.then(res => res.json())
				.then(json => {
					client.guilds.fetch(process.env.DISCORD_GUILD_ID).then(guild => {
						guild.members.fetch(json.id).then(guildMember => {
							roleNameToRoleId(req.session.rank).then(roleId => {
								guild.roles.fetch(roleId).then(role => {
									guildMember.roles.add(role, "New rank on The Button").then((gm) => {
										res.redirect('/')
									})

								})
							});
							
						})
					});
				})
			})
		} catch (error) {
			res.send(error);
		}
	}
})


app.get('*', recaptcha.middleware.render, function(req, res){
	res.render(__dirname + '/index.ejs', { discordUrl: discordUrl, captcha: res.recaptcha, health: button.healthLevel(), isAlive: button.isAlive(), healthNumber: button.health(), userRank: req.session.rank ? req.session.rank : null })
});


app.post('*', recaptcha.middleware.verify, limiter, function(req, res){ 
	if(req.recaptcha.error == "timeout-or-duplicate") return res.redirect('/?captcha=timeout')
	if (req.recaptcha.data && req.recaptcha.data.score < 0.7) return res.status(403).redirect('/?captcha=failed')
	if (req.recaptcha.error) return res.status(500).send(req.recaptcha.error)
	let resp = button.slapthebutton()
	if(resp.message) return res.send(resp.message)
	req.session.rank = resp.rank.name
	res.redirect('/')
});

app.listen(port, () => {
	console.log(`app listening at ${port}`)
})


client.once('ready', async () => {
	console.log('Discord bot ready.');
});

client.login(process.env.DISCORD_BOT_TOKEN);