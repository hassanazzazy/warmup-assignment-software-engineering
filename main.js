const fs = require("fs");


// Helper to transform "hh:mm:ss am/pm" to seconds
function timeToSec(timeString) {
    if (!timeString) return 0;
    const parts = timeString.trim().split(" ");
    const [hours, minutes, seconds] = parts[0].split(':').map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (parts.length > 1) { 
        const mod = parts[1].toLowerCase();
        if (mod === "pm" && hours < 12) totalSeconds += 12 * 3600;
        if (mod === "am" && hours === 12) totalSeconds -= 12 * 3600;
    }
    return totalSeconds;
}

// Helper to transform seconds back to "h:mm:ss"
function secToTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let duration = timeToSec(endTime) - timeToSec(startTime);
    hours = duration/3600;
    minutes = (duration - hours*3600)/60;
    seconds = duration - (hours*3600 + minutes*60)

    return ` ${hours}:${minutes}:${seconds}`;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {//between 8am and 10pm
    let idleTime = 0;
    if(timeToSec(startTime) < 28800){
        idleTime += 28800 - timeToSec(startTime);
    }
    if(timeToSec(endTime) > 79200){
        idleTime += timeToSec(endTime) - 79,200;
    }

    hours = idleTime/3600;
    minutes = (idleTime - hours*3600)/60;
    seconds = idleTime - (hours*3600 + minutes*60)

    return ` ${hours}:${minutes}:${seconds}`;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    activeTime = timeToSec(shiftDuration) - timeToSec(idleTime)

    hours = activeTime/3600;
    minutes = (activeTime - hours*3600)/60;
    seconds = activeTime - (hours*3600 + minutes*60)

    return ` ${hours}:${minutes}:${seconds}`;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================

//  another helper function for dates


function metQuota(date, activeTime) {
    const activeSeconds = timeToSec(activeTime);
    const [y, m, d] = date.split('-').map(Number);
    
    const isSpecial = (y === 2025 && m === 4 && d >= 10 && d <= 30);
    const requiredSeconds = isSpecial ? (6 * 3600) : (8 * 3600 + 24 * 60);

    return activeSeconds >= requiredSeconds;
}


// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {

}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
