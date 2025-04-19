import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThreshold {
  name: string;
  threshold: number;
  severity: 'warning' | 'error';
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThreshold[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly DEFAULT_THRESHOLDS: PerformanceThreshold[] = [
    { name: 'render_time', threshold: 100, severity: 'warning' },
    { name: 'api_response_time', threshold: 500, severity: 'warning' },
    { name: 'image_load_time', threshold: 2000, severity: 'warning' },
  ];

  private constructor() {
    this.thresholds = this.DEFAULT_THRESHOLDS;
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.recordMetric(name, duration);
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.recordMetric(name, duration);
    return result;
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    this.checkThresholds(metric);
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find(t => t.name === metric.name);
    if (threshold && metric.value > threshold.threshold) {
      const message = `Performance threshold exceeded for ${metric.name}: ${metric.value}ms (threshold: ${threshold.threshold}ms)`;

      if (threshold.severity === 'warning') {
        logger.warn('performance', message, metric);
      } else {
        logger.error('performance', message, metric);
      }
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    return name ? this.metrics.filter(m => m.name === name) : this.metrics;
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  setThreshold(name: string, threshold: number, severity: 'warning' | 'error'): void {
    const existing = this.thresholds.findIndex(t => t.name === name);
    if (existing >= 0) {
      this.thresholds[existing] = { name, threshold, severity };
    } else {
      this.thresholds.push({ name, threshold, severity });
    }
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getThresholds(): PerformanceThreshold[] {
    return [...this.thresholds];
  }

  // Method to destroy the monitor instance (useful for testing)
  destroy(): void {
    this.clearMetrics();
    this.thresholds = this.DEFAULT_THRESHOLDS;
    // @ts-ignore
    PerformanceMonitor.instance = null;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
