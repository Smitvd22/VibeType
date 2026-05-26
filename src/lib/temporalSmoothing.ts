export class TemporalSmoother<T> {
  private history: T[] = [];
  private windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  add(value: T) {
    this.history.push(value);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }
  }

  getMode(): T | null {
    if (this.history.length === 0) return null;
    
    const counts = new Map<T, number>();
    for (const val of this.history) {
      counts.set(val, (counts.get(val) || 0) + 1);
    }

    let mode = this.history[0];
    let maxCount = 0;
    for (const [val, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mode = val;
      }
    }
    return mode;
  }
  
  clear() {
    this.history = [];
  }
}
