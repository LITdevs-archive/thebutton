const rateLimit = require("express-rate-limit");
const express = require('express')
var session = require('express-session')
var Recaptcha = require('express-recaptcha').RecaptchaV3;
require('dotenv').config()
const button = require('./button')

var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY, {callback: "cb", "action": "buttonDEV"});
const app = express()
const port = 83
button.init()
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1 // limit each IP to 100 requests per windowMs
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}))

app.set('view engine', 'ejs');

app.get("/health", function(req, res){
	res.send({healthLevel: button.healthLevel(), isAlive: button.isAlive(), health: button.health()})
})

app.get('*', recaptcha.middleware.render, function(req, res){
	res.render(__dirname + '/index.ejs', { captcha: res.recaptcha, health: button.healthLevel(), isAlive: button.isAlive() })
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