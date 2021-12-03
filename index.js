const rateLimit = require("express-rate-limit");
const express = require('express')
var Recaptcha = require('express-recaptcha').RecaptchaV3;
require('dotenv').config()

var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY, {callback: "cb", "action": "buttonDEV"});
const app = express()
const port = 81

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('*', recaptcha.middleware.render, function(req, res){
    res.render(__dirname + '/index.ejs', { captcha: res.recaptcha })
});

app.post('*', recaptcha.middleware.verify, function(req, res){
	if (req.recaptcha.data && req.recaptcha.data.score < 0.7) return res.status(403).send('Captcha failed')
	res.render(__dirname + '/index.ejs', {
        error: req.recaptcha.error,
		captcha: false,
        data: JSON.stringify(req.recaptcha.data),
    })
});

app.listen(port, () => {
	console.log(`app listening at ${port}`)
})