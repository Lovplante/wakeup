export function getNextAlarmDate(hour, minute) {
    const now = new Date();
    const alarm = new Date();
    alarm.setHours(hour, minute, 0, 0);

    // wenn schon vorbeigegangen ist die zeit, wird auf morgen gesetzt
    if (alarm <= now) {
        alarm.setDate(alarm.getDate() + 1);
    }

    return alarm;
};

function getMsUntil(date) {
    return date.getTime() - Date.now();
};

export function scheduleAlarm(alarmDate, onAlarm) {
    // wie viele ms noch bis der alarm schiessen soll
    const msUntilAlarm = getMsUntil(alarmDate);

    console.log(`Alarm set for ${alarmDate}. Will trigger in ${(msUntilAlarm)/1000} s`);

    // checked jede sekunde obdie weckzeit erreicht ist, dadurch zuverlaessiger
    const timeoutId = setInterval(() => {
        if (Date.now() >= alarmDate.getTime()) {
        clearInterval(timeoutId);
        if (onAlarm) onAlarm();
        }
    }, 1000);

    return timeoutId;
}