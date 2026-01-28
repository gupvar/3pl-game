// Simple Web Audio API Synthesizer for Game Sounds

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;

        // Resume context if suspended (browser policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playSuccess() {
        this.playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 100);
    }

    playError() {
        this.playTone(150, 'sawtooth', 0.3, 0.15);
    }

    playClick() {
        this.playTone(400, 'triangle', 0.05, 0.05);
    }

    playTruckStart() {
        // Imitate engine rumble
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.5); // Rev up

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    playMoney() {
        this.playTone(1200, 'sine', 0.1, 0.05);
        setTimeout(() => this.playTone(1600, 'sine', 0.2, 0.05), 100);
    }
}

export const sounds = new SoundManager();
