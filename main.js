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

function secToTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    // padStart(2, '0') ensures 1:0:0 becomes 1:00:00
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
    return secToTime(duration);
}



// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    let start = timeToSec(startTime);
    let end = timeToSec(endTime);
    let idleTime = 0;
    
    if (start < 28800) idleTime += 28800 - start;
    if (end > 79200) idleTime += end - 79200;

    return secToTime(idleTime);
}


// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================

function getActiveTime(shiftDuration, idleTime) {
    let activeSeconds = timeToSec(shiftDuration) - timeToSec(idleTime);
    return secToTime(activeSeconds);
}



// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================


function metQuota(date, activeTime) {
    const activeSeconds = timeToSec(activeTime);
    const [y, m, d] = date.split('-').map(Number);
    // Special period: April 10 to April 20
    const isSpecial = (m === 4 && d >= 10 && d <= 20);
    const threshold = isSpecial ? (6 * 3600) : (8 * 3600 + 24 * 60);
    return activeSeconds >= threshold;
}


// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================

function addShiftRecord(textFile, shiftObj) {
    const data = fs.readFileSync(textFile, "utf8").trim().split("\n");
    const records = data.slice(1); 

    // Check if  driverID and date exists
    const exists = records.some(line => {
        const cols = line.split(",");
        return cols[0] === shiftObj.driverID && cols[2] === shiftObj.date;
    });
    if (exists) return {};

    // Calculate the 4 required values and set default bonus
    const shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    const idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    const activeTime = getActiveTime(shiftDuration, idleTime);
    const quotaMet = metQuota(shiftObj.date, activeTime);

    const newEntry = {
        ...shiftObj,//spread operator
        shiftDuration,
        idleTime,
        activeTime,
        metQuota: quotaMet,
        hasBonus: false
    };

    // Convert to CSV string line
    const newLine = Object.values(newEntry).join(",");

    // Find insertion point: After the last record of this driverID
    let lastIdx = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i].startsWith(shiftObj.driverID + ",")) {
            lastIdx = i;
        }
    }

    if (lastIdx === -1) {
        data.push(newLine); // Append at the end if driver is new
    } else {
        data.splice(lastIdx + 1, 0, newLine); // Insert after last record of this driver
    }

    fs.writeFileSync(textFile, data.join("\n") + "\n");
    return newEntry;
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
    let data = fs.readFileSync(textFile, "utf8").trim().split("\n");
    
    for (let i = 1; i < data.length; i++) {
        let cols = data[i].split(",");
        // Match DriverID and Date
        if (cols[0] === driverID && cols[2] === date) {
            cols[9] = String(newValue); // Update the HasBonus column
            data[i] = cols.join(",");
            break;
        }
    }
    fs.writeFileSync(textFile, data.join("\n") + "\n");
}


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================


function countBonusPerMonth(textFile, driverID, month) {
    let data = fs.readFileSync(textFile, "utf8").trim().split("\n");
    let records = data.slice(1);
    let driverExists = false;
    let count = 0;


    let formattedMonth = String(month).padStart(2, '0');

    for (let line of records) {
        let cols = line.split(",");
        if (cols[0] === driverID) {
            driverExists = true;
            if (cols[2].includes(`-${formattedMonth}-`) && cols[9] === "true") {
                count++;
            }
        }
    }
    return driverExists ? count : -1;
}



// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================


function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    let data = fs.readFileSync(textFile, "utf8").trim().split("\n");
    let totalSeconds = 0;
    let formattedMonth = String(month).padStart(2, '0');

    for (let i = 1; i < data.length; i++) {
        let cols = data[i].split(",");
        if (cols[0] === driverID && cols[2].includes(`-${formattedMonth}-`)) {
            totalSeconds += timeToSec(cols[7]); // 7 is ActiveTime
        }
    }
    return secToTime(totalSeconds);
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
    const data = fs.readFileSync(textFile, "utf8").trim().split("\n");
    const formattedMonth = String(month).padStart(2, '0');
    
    let shiftCount = 0;
    for (let i = 1; i < data.length; i++) {
        let cols = data[i].split(",");
        if (cols[0] === driverID && cols[2].includes(`-${formattedMonth}-`)) {
            shiftCount++;
        }
    }

    let effectiveDays = shiftCount - bonusCount;
    let totalReqSeconds = effectiveDays * (8 * 3600 + 24 * 60); 
    
    return secToTime(totalReqSeconds);
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
    const rates = fs.readFileSync(rateFile, "utf8").trim().split("\n");
    let driverLine = rates.find(line => line.startsWith(driverID)).split(",");
    let baseSalary = parseInt(driverLine[2]);

    let actualSec = timeToSec(actualHours);
    let reqSec = timeToSec(requiredHours);

    if (actualSec < (0.9 * reqSec)) {
        let deficiencySeconds = reqSec - actualSec;
        let deficiencyHours = deficiencySeconds / 3600;
        
        let deduction = deficiencyHours * 7.5; 
        return Math.floor(baseSalary - deduction);
    }
    
    return baseSalary;
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
