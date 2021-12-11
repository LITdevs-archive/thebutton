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
		name: "Absolute Noob",
		maxHealth: 360,
		minHealth: 291,
	},
	{
		name: "Kind of a cool person",
		maxHealth: 290,
		minHealth: 221
	},
	{
		name: "Cool person",
		maxHealth: 220,
		minHealth: 161
	},
	{
		name: "MEDIC",
		maxHealth: 160,
		minHealth: 101
	},
	{
		name: "Saviour",
		maxHealth: 100,
		minHealth: 41
	},
	{
		name: "h",
		maxHealth: 40,
		minHealth: 1
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
	}, 60000)
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
	healthLevel: healthLevel
}