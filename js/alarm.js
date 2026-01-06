export function getNextAlarmDate(hour, minute) {
    const now = new Date();
    const alarm = new Date();
    alarm.setHours(hour, minute, 0, 0);

    if (alarm <= now) {
        alarm.setDate(alarm.getDate() + 1);
    }

    return alarm;
};

function getMsUntil(date) {
    return date.getTime() - Date.now();
};

export function scheduleAlarm(alarmDate, onAlarm) {
    // const alarmDate = getNextAlarmDate(hour, minute);
    const msUntilAlarm = getMsUntil(alarmDate);

    console.log(`Alarm set for ${alarmDate}. Will trigger in ${(msUntilAlarm)/1000} s`);

    setTimeout(() => {
        console.log("wakeup B)");
        if (onAlarm) onAlarm();
    }, msUntilAlarm);
}