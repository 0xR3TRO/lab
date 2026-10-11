/**
 * timer.js — Countdown timer for quiz questions
 */
let timerId = null;
let remaining = 0;
let onTickCb = null;
let onExpireCb = null;

export function startTimer(seconds, onTick, onExpire) {
    stopTimer();
    remaining = seconds;
    onTickCb = onTick;
    onExpireCb = onExpire;
    onTickCb(remaining);

    timerId = setInterval(() => {
        remaining--;
        onTickCb(remaining);
        if (remaining <= 0) {
            stopTimer();
            if (onExpireCb) onExpireCb();
        }
    }, 1000);
}

export function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

export function getRemaining() {
    return remaining;
}
