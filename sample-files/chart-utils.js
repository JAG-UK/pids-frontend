/**
 * Chart Utilities for Climate Data Dashboard
 * Provides functions for creating and updating charts
 */

class ClimateChartManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            temperature: '#ff6b6b',
            rainfall: '#4ecdc4',
            humidity: '#45b7d1'
        };
    }

    /**
     * Create a line chart for time series data
     * @param {string} chartId - DOM element ID for the chart
     * @param {Array} data - Array of data points
     * @param {string} type - Type of data (temperature, rainfall, etc.)
     */
    createLineChart(chartId, data, type) {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            console.error(`Canvas element ${chartId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const chart = {
            type: 'line',
            data: data,
            color: this.colors[type] || '#333',
            ctx: ctx
        };

        this.charts.set(chartId, chart);
        this.renderChart(chart);
    }

    /**
     * Render a chart on its canvas
     * @param {Object} chart - Chart configuration object
     */
    renderChart(chart) {
        const { ctx, data, color } = chart;
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        if (!data || data.length === 0) {
            this.drawNoDataMessage(ctx);
            return;
        }

        // Set up chart dimensions
        const padding = 40;
        const width = ctx.canvas.width - (padding * 2);
        const height = ctx.canvas.height - (padding * 2);

        // Find data range
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;

        // Draw axes
        this.drawAxes(ctx, padding, width, height);

        // Draw data line
        this.drawDataLine(ctx, data, padding, width, height, minValue, valueRange, color);

        // Draw labels
        this.drawLabels(ctx, padding, width, height, data);
    }

    /**
     * Draw chart axes
     */
    drawAxes(ctx, padding, width, height) {
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + height);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding + height);
        ctx.lineTo(padding + width, padding + height);
        ctx.stroke();
    }

    /**
     * Draw the data line
     */
    drawDataLine(ctx, data, padding, width, height, minValue, valueRange, color) {
        if (data.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1)) * width;
            const y = padding + height - ((point.value - minValue) / valueRange) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    /**
     * Draw chart labels
     */
    drawLabels(ctx, padding, width, height, data) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // X-axis labels
        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1)) * width;
            const y = padding + height + 20;
            ctx.fillText(point.label || point.date, x, y);
        });
    }

    /**
     * Draw no data message
     */
    drawNoDataMessage(ctx) {
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    /**
     * Update chart data
     * @param {string} chartId - Chart ID to update
     * @param {Array} newData - New data array
     */
    updateChart(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data = newData;
            this.renderChart(chart);
        }
    }

    /**
     * Get chart statistics
     * @param {string} chartId - Chart ID
     * @returns {Object} Statistics object
     */
    getChartStats(chartId) {
        const chart = this.charts.get(chartId);
        if (!chart || !chart.data) {
            return null;
        }

        const values = chart.data.map(d => d.value);
        return {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            average: values.reduce((a, b) => a + b, 0) / values.length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClimateChartManager;
} else {
    // Browser environment
    window.ClimateChartManager = ClimateChartManager;
}


