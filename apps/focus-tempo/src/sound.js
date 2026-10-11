/**
 * SoundManager — generates notification sounds via the Web Audio API.
 */

export class SoundManager {
    constructor() {
        this._ctx = null;
        this.soundType = "bell";
    }

    _getContext() {
        if (!this._ctx) {
            this._ctx = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }
        return this._ctx;
    }

    setSoundType(type) {
        this.soundType = type;
    }

    play() {
        switch (this.soundType) {
            case "chime":
                this._playChime();
                break;
            case "beep":
                this._playBeep();
                break;
            default:
                this._playBell();
                break;
        }
    }

    /* --- Sound generators --- */

    _playBell() {
        const ctx = this._getContext();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, now + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.8);
        });
    }

    _playChime() {
        const ctx = this._getContext();
        const now = ctx.currentTime;
        [880, 1108.73, 1318.51, 1760].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.6);
        });
    }

    _playBeep() {
        const ctx = this._getContext();
        const now = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, now + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.3);
            osc.stop(now + i * 0.3 + 0.15);
        }
    }
}
