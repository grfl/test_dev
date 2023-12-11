const moment = require('moment')
const fs = require('fs');

function getAvailableSpots(calendar, date, duration ) {
	let rawdata = fs.readFileSync('./calendars/calendar.' + calendar + '.json');
	let data = JSON.parse(rawdata);
	const dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
	let durationBefore = data.durationBefore;
	let durationAfter = data.durationAfter;
    let formatter = []

    if(data.slots[date] !== undefined){
        freeSlots = getFreeSlots(data.slots[date], data.sessions[date])
        availableMinutes = getAvailableMinutes(freeSlots, dateISO, duration)
        formatter = setFormatter(availableMinutes, durationBefore, durationAfter, duration, dateISO)    
    }

    return formatter
}

function getFreeSlots(slots, sessions){
    if(sessions !== undefined) {
        sessions.forEach(function (session) {
            slots = slots.filter(({ start }) => start !== session.start)       
        })
    }
    return slots
}

function getAvailableMinutes(slots, dateISO, duration){
    let msSlot = 0
    let msDuration = moment.duration(duration, 'minutes').asMilliseconds()
    let firstSlot = []
    slots.forEach(function(slot){
        msSlot = (moment(dateISO + ' ' + slot.end) - moment(dateISO + ' ' + slot.start).valueOf())
        if( msSlot >= msDuration ) {
            firstSlot = slot
            return
        }
    })
    return firstSlot
}

function setFormatter(availableMinutes, durationBefore, durationAfter, duration, dateISO){
    let startHourFirst = getMomentHour(availableMinutes.start, dateISO)
    startHour = startHourFirst.format('HH:mm')
    endHour = addMinutes(startHourFirst, durationBefore + duration + durationAfter)
    clientStartHour = addMinutes(startHourFirst, durationBefore)
    clientEndHour = addMinutes(startHourFirst, duration)

    return [{
        startHour: moment.utc(dateISO + ' ' + startHour).toDate(),
        endHour: moment.utc(dateISO + ' ' + endHour).toDate(),
        clientStartHour: moment.utc(dateISO + ' ' + clientStartHour).toDate(),
        clientEndHour: moment.utc(dateISO + ' ' + clientEndHour).toDate()
    }]
}

function getMomentHour(hour, dateISO) {
    let finalHourForAdd = moment(dateISO + ' ' + hour)
    return finalHourForAdd;
}

function addMinutes(hour, minutes) {
    let result = moment(hour).add(minutes, 'minutes').format('HH:mm')
    return result;
}

module.exports = { getAvailableSpots }