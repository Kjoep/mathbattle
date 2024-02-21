export function startTiming(maxTime: number) {
    return new Timing(maxTime);
}

export class Timing {

    constructor(public maxTime: number){}

    private startTime = 0;
    private endTime = 0;
    private timeoutHandles: Array<number> = [];
    private timeouts: Array<{ after: number, handler: () => void }> = []
    private atEnd: Array<() => void> = []

    start() {
        if (this.startTime) throw new Error('Already started');
        this.startTime = Date.now();
        this.timeoutHandles = this.timeouts.map(({ after, handler }) => setTimeout(handler, after));
        this.timeoutHandles.push(setTimeout(() => {
            this.end();
            for (const handler of this.atEnd) handler();
        }, this.maxTime));
    }

    onEnd(handler: () => void) {
        console.log('registering end handler');
        this.atEnd.push(handler);
    }

    after(msecs: number, handler: () => void) {
        if (msecs >= this.maxTime) {
            this.atEnd.push(handler);
            return;
        }
        this.timeouts.push({ after: msecs, handler });
        if (this.startTime && !this.endTime) {
            this.timeoutHandles.push(setTimeout(handler, msecs));
        }
    }

    afterPortion(portion: number, handler: () => void) {
        this.after(this.maxTime * portion, handler);
    }

    end() {
        if (this.endTime) throw new Error('Already ended');
        if (!this.startTime) throw new Error('End called before start');
        for (const handle of this.timeoutHandles) clearTimeout(handle);
        this.endTime = Date.now();
    }

    get state(): 'running' | 'paused' {
        if (this.startTime && !this.endTime) return 'running';
        return 'paused';
    }

    get currentTime() {
        if (!this.startTime) return 0;
        if (this.endTime) return this.endTime - this.startTime;
        return Date.now() - this.startTime;
    }

    get timePortion() {
        return this.currentTime / this.maxTime;
    }

}