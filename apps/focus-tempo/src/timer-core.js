/**
 * TimerCore — pure countdown logic with callbacks.
 */

export class TimerCore {
    constructor() {
        this.duration = 0;
        this.remaining = 0;
        this._intervalId = null;
        this.isRunning = false;

        /** @type {((remaining: number, duration: number) => void) | null} */
        this.onTick = null;
        /** @type {(() => void) | null} */
        this.onComplete = null;
    }

    setDuration(seconds) {
        this.duration = seconds;
        this.remaining = seconds;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        this._intervalId = setInterval(() => {
            this.remaining--;
            if (this.onTick) this.onTick(this.remaining, this.duration);

            if (this.remaining <= 0) {
                this._stop();
                if (this.onComplete) this.onComplete();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        this._stop();
    }

    reset() {
        this._stop();
        this.remaining = this.duration;
        if (this.onTick) this.onTick(this.remaining, this.duration);
    }

    _stop() {
        this.isRunning = false;
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }
}
