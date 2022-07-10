const fs = require("fs")
if(!fs.existsSync("./data.json")){
	let defaultData = {
		health: 360,
		isAlive: true,
		healthLevel: 6
	}
	fs.writeFileSync("./data.json", JSON.stringify(defaultData, null, 4))
}
const data = require("./data.json")

const ranks = [
	{
		name: "A normal Vukky",
		maxHealth: 360,
		minHealth: 291,
		role: "986183600514940978"
	},
	{
		name: "Kind of a cool person",
		maxHealth: 290,
		minHealth: 221,
		role: "986183740126527558"
	},
	{
		name: "Cool person",
		maxHealth: 220,
		minHealth: 161,
		role: "986183886272872468"
	},
	{
		name: "Button fanatic",
		maxHealth: 160,
		minHealth: 101,
		role: "986183997388365834"
	},
	{
		name: "Row-bot",
		maxHealth: 100,
		minHealth: 41,
		role: "986184105051947028"
	},
	{
		name: "niko",
		maxHealth: 40,
		minHealth: 21,
		role: "986184227177496616"
	},
	{
		name: "h",
		maxHealth: 20,
		minHealth: 11,
		role: "995604770888892447"
	},
	{
		name: "no pls",
		maxHealth: 10,
		minHealth: 2,
		role: "995605245176590387"
	},
	{
		name: "touch grass",
		maxHealth: 1,
		minHealth: 1,
		role: "995605690838159360"
	}
]

// Hello, It's me again. I am not sure this is the smartest way but it doesnt actually really matter.
function init() {
	var healthDecrease = setInterval(() => {
		if(data.health <= 1){
			data.isAlive = false
			data.health = 0
			data.healthLevel = "dead"
			clearInterval(healthDecrease)
		} else {
			data.health -= 1
			data.healthLevel = getRank(data.health).name
		}
		console.log("Health decreased! Now: ", data.health)
		fs.writeFileSync("./data.json", JSON.stringify(data, null, 4))
	//}, 30000)
	}, 15000)
}

function getRank(health) {
	for(let rank in ranks){
		if(health >= ranks[rank].minHealth && health <= ranks[rank].maxHealth){
			return ranks[rank]
		}
	}	
}

function slapthebutton() {
	if(data.isAlive){
		let rank = getRank(data.health)
		data.health = 360
		data.healthLevel = getRank(data.health).name
		fs.writeFileSync("./data.json", JSON.stringify(data, null, 4))
		return {rank: rank}
	} else {
		return {message: "Pressing a dead button wont help..."}
	}
}

function isAlive() {
	return data.isAlive
}

function health() {
	return data.health
}

function healthLevel() {
	return data.healthLevel
}

module.exports = {
	getRank,
	init,
	slapthebutton,
	isAlive: isAlive,
	health: health,
	healthLevel: healthLevel,
	ranks: ranks
}
