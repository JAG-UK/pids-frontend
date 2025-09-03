import mongoose from 'mongoose';
import Dataset from '../models/Dataset.js';

const mockDatasets = [
  {
    title: "Climate Research Data",
    description: "Comprehensive climate data collected from various research stations across the globe. Includes temperature, humidity, and atmospheric pressure readings.",
    format: "CSV",
    size: 2048576,
    tags: ["climate", "research", "environmental"],
    dateCreated: new Date("2024-01-15"),
    dateUpdated: new Date("2024-01-15"),
    fileStructure: [
      {
        name: "temperature_data.csv",
        type: "file",
        size: 1024000,
        path: "/temperature_data.csv",
        content: `Date,Station,Latitude,Longitude,Temperature_C,Humidity_Percent,Pressure_hPa
2024-01-01,Station_A,40.7128,-74.0060,15.2,65,1013.25
2024-01-01,Station_B,34.0522,-118.2437,18.5,58,1012.80
2024-01-01,Station_C,51.5074,-0.1278,8.9,72,1014.50
2024-01-02,Station_A,40.7128,-74.0060,12.8,68,1012.90
2024-01-02,Station_B,34.0522,-118.2437,17.2,61,1011.45
2024-01-02,Station_C,51.5074,-0.1278,7.5,75,1013.80
2024-01-03,Station_A,40.7128,-74.0060,14.1,63,1014.20
2024-01-03,Station_B,34.0522,-118.2437,19.8,55,1010.90
2024-01-03,Station_C,51.5074,-0.1278,9.2,70,1015.10
2024-01-04,Station_A,40.7128,-74.0060,13.5,67,1013.60
2024-01-04,Station_B,34.0522,-118.2437,16.9,59,1012.15
2024-01-04,Station_C,51.5074,-0.1278,8.1,73,1014.90`
      },
      {
        name: "humidity_data.csv",
        type: "file",
        size: 1024576,
        path: "/humidity_data.csv",
        content: `Date,Station,Morning_Humidity,Afternoon_Humidity,Evening_Humidity,Dew_Point
2024-01-01,Station_A,72,45,68,8.5
2024-01-01,Station_B,65,38,62,12.2
2024-01-01,Station_C,78,52,75,4.8
2024-01-02,Station_A,75,48,71,7.2
2024-01-02,Station_B,68,41,65,11.8
2024-01-02,Station_C,81,55,78,3.9
2024-01-03,Station_A,70,43,69,9.1
2024-01-03,Station_B,62,35,60,13.5
2024-01-03,Station_C,76,49,74,5.2
2024-01-04,Station_A,73,46,70,8.8
2024-01-04,Station_B,66,39,63,12.9
2024-01-04,Station_C,79,53,76,4.5`
      }
    ],
    isPublic: true,
    status: 'approved',
    createdBy: "admin"
  },
  {
    title: "Urban Traffic Patterns",
    description: "Traffic flow data from major metropolitan areas. Contains vehicle counts, speed measurements, and congestion indicators.",
    format: "JSON",
    size: 1536000,
    tags: ["traffic", "urban", "transportation"],
    dateCreated: new Date("2024-02-20"),
    dateUpdated: new Date("2024-02-20"),
    fileStructure: [
      {
        name: "traffic_flow.json",
        type: "file",
        size: 1536000,
        path: "/traffic_flow.json",
        content: `{
  "metadata": {
    "dataset_name": "Urban Traffic Patterns",
    "collection_date": "2024-02-20",
    "version": "1.0",
    "description": "Traffic flow data from major metropolitan areas"
  },
  "locations": [
    {
      "id": "NYC_001",
      "name": "Manhattan Bridge",
      "coordinates": {
        "latitude": 40.7061,
        "longitude": -73.9969
      },
      "traffic_data": [
        {
          "timestamp": "2024-02-20T08:00:00Z",
          "vehicle_count": 1247,
          "average_speed": 28.5,
          "congestion_level": "moderate",
          "incidents": 0
        },
        {
          "timestamp": "2024-02-20T09:00:00Z",
          "vehicle_count": 1892,
          "average_speed": 22.1,
          "congestion_level": "high",
          "incidents": 1
        },
        {
          "timestamp": "2024-02-20T10:00:00Z",
          "vehicle_count": 1654,
          "average_speed": 25.8,
          "congestion_level": "moderate",
          "incidents": 0
        }
      ]
    },
    {
      "id": "LA_001",
      "name": "Hollywood Freeway",
      "coordinates": {
        "latitude": 34.1016,
        "longitude": -118.3267
      },
      "traffic_data": [
        {
          "timestamp": "2024-02-20T08:00:00Z",
          "vehicle_count": 2156,
          "average_speed": 35.2,
          "congestion_level": "low",
          "incidents": 0
        },
        {
          "timestamp": "2024-02-20T09:00:00Z",
          "vehicle_count": 2987,
          "average_speed": 18.9,
          "congestion_level": "high",
          "incidents": 2
        },
        {
          "timestamp": "2024-02-20T10:00:00Z",
          "vehicle_count": 2678,
          "average_speed": 24.3,
          "congestion_level": "moderate",
          "incidents": 1
        }
      ]
    }
  ],
  "summary": {
    "total_locations": 2,
    "total_records": 6,
    "average_vehicle_count": 1935.67,
    "average_speed": 25.98,
    "most_congested_hour": "09:00",
    "total_incidents": 4
  }
}`
      }
    ],
    isPublic: true,
    status: 'approved',
    createdBy: "admin"
  },
  {
    title: "Cat Photography Collection",
    description: "A curated collection of high-quality cat photographs from various breeds and settings. Perfect for machine learning training or artistic reference.",
    format: "JPEG",
    size: 52428800,
    tags: ["photography", "cats", "images", "animals"],
    dateCreated: new Date("2024-03-10"),
    dateUpdated: new Date("2024-03-10"),
    fileStructure: [
      {
        name: "images",
        type: "directory",
        size: 0,
        path: "/images",
        children: [
          {
            name: "persian_cat.jpg",
            type: "file",
            size: 2048576,
            path: "/images/persian_cat.jpg"
          },
          {
            name: "siamese_cat.jpg",
            type: "file",
            size: 1876544,
            path: "/images/siamese_cat.jpg"
          },
          {
            name: "orange_tabby.jpg",
            type: "file",
            size: 2150400,
            path: "/images/orange_tabby.jpg"
          }
        ]
      },
      {
        name: "metadata.json",
        type: "file",
        size: 1024,
        path: "/metadata.json",
        content: `{
  "collection_info": {
    "name": "Cat Photography Collection",
    "description": "High-quality cat photographs for ML training",
    "total_images": 3,
    "total_size_mb": 9.9,
    "date_created": "2024-03-10"
  },
  "images": [
    {
      "filename": "persian_cat.jpg",
      "breed": "Persian",
      "age": "3 years",
      "setting": "indoor",
      "tags": ["fluffy", "white", "portrait"]
    },
    {
      "filename": "siamese_cat.jpg",
      "breed": "Siamese",
      "age": "2 years",
      "setting": "outdoor",
      "tags": ["elegant", "brown", "action"]
    },
    {
      "filename": "orange_tabby.jpg",
      "breed": "Orange Tabby",
      "age": "4 years",
      "setting": "indoor",
      "tags": ["large", "orange", "sleeping"]
    }
  ],
  "statistics": {
    "breeds": ["Persian", "Siamese", "Orange Tabby"],
    "settings": ["indoor", "outdoor"],
    "average_age": 3.0,
    "most_common_breed": "Mixed"
  }
}`
      }
    ],
    isPublic: true,
    status: 'approved',
    createdBy: "admin"
  },
  {
    title: "Financial Market Analysis",
    description: "Historical stock market data with technical indicators and trading signals. Includes price movements, volume analysis, and market sentiment metrics.",
    format: "CSV",
    size: 4194304,
    tags: ["finance", "trading", "stocks", "analysis"],
    dateCreated: new Date("2024-01-30"),
    dateUpdated: new Date("2024-01-30"),
    fileStructure: [
      {
        name: "market_data.csv",
        type: "file",
        size: 4194304,
        path: "/market_data.csv",
        content: `Date,Symbol,Open,High,Low,Close,Volume,Market_Cap,PE_Ratio,Dividend_Yield
2024-01-01,AAPL,185.50,187.20,184.30,186.80,45678900,2.95T,28.5,0.52
2024-01-01,GOOGL,142.30,144.10,141.80,143.90,23456700,1.82T,25.2,0.00
2024-01-01,MSFT,375.20,378.50,374.10,377.40,18923400,2.81T,32.1,0.78
2024-01-02,AAPL,186.80,188.90,185.60,187.50,52345600,2.96T,28.7,0.52
2024-01-02,GOOGL,143.90,145.70,143.20,144.80,25678900,1.83T,25.4,0.00
2024-01-02,MSFT,377.40,380.20,376.80,379.60,20123400,2.82T,32.3,0.78
2024-01-03,AAPL,187.50,189.30,186.20,188.70,48912300,2.97T,28.9,0.52
2024-01-03,GOOGL,144.80,146.40,144.10,145.90,26789000,1.84T,25.6,0.00
2024-01-03,MSFT,379.60,382.10,378.90,381.30,21567800,2.83T,32.5,0.78
2024-01-04,AAPL,188.70,190.50,187.80,189.40,51234500,2.98T,29.1,0.52
2024-01-04,GOOGL,145.90,147.20,145.30,146.60,27890100,1.85T,25.8,0.00
2024-01-04,MSFT,381.30,383.80,380.50,382.70,22987600,2.84T,32.7,0.78`
      }
    ],
    isPublic: true,
    status: 'approved',
    createdBy: "admin"
  },
  {
    title: "Medical Imaging Dataset",
    description: "Collection of medical scans including X-rays, CT scans, and MRI images. Anonymized patient data for research purposes.",
    format: "DICOM",
    size: 104857600,
    tags: ["medical", "imaging", "healthcare", "research"],
    dateCreated: new Date("2024-02-15"),
    dateUpdated: new Date("2024-02-15"),
    fileStructure: [
      {
        name: "xray_scans",
        type: "directory",
        size: 0,
        path: "/xray_scans",
        children: [
          {
            name: "scan001.dcm",
            type: "file",
            size: 2097152,
            path: "/xray_scans/scan001.dcm"
          },
          {
            name: "scan002.dcm",
            type: "file",
            size: 2097152,
            path: "/xray_scans/scan002.dcm"
          }
        ]
      },
      {
        name: "ct_scans",
        type: "directory",
        size: 0,
        path: "/ct_scans",
        children: [
          {
            name: "ct001.dcm",
            type: "file",
            size: 4194304,
            path: "/ct_scans/ct001.dcm"
          }
        ]
      },
      {
        name: "patient_data.json",
        type: "file",
        size: 2048,
        path: "/patient_data.json",
        content: `{
  "dataset_info": {
    "name": "Medical Imaging Dataset",
    "description": "Anonymized medical scans for research",
    "total_scans": 3,
    "total_size_mb": 8.0,
    "date_created": "2024-02-15"
  },
  "scans": [
    {
      "id": "scan001",
      "type": "xray",
      "body_part": "chest",
      "patient_age": 45,
      "diagnosis": "normal",
      "anonymized_id": "P001"
    },
    {
      "id": "scan002",
      "type": "xray",
      "body_part": "chest",
      "patient_age": 62,
      "diagnosis": "pneumonia",
      "anonymized_id": "P002"
    },
    {
      "id": "ct001",
      "type": "ct",
      "body_part": "head",
      "patient_age": 38,
      "diagnosis": "normal",
      "anonymized_id": "P003"
    }
  ],
  "statistics": {
    "scan_types": ["xray", "ct"],
    "body_parts": ["chest", "head"],
    "average_age": 48.3,
    "diagnoses": ["normal", "pneumonia"]
  }
}`
      }
    ],
    isPublic: true,
    status: 'approved',
    createdBy: "admin"
  },
  {
    title: "Comprehensive Sample Dataset",
    description: "A comprehensive collection of sample files demonstrating various file types and formats. Includes PDF documents, JSON data, CSS stylesheets, TypeScript code, Python scripts, and more. Perfect for testing file previews and downloads.",
    size: 15728640,
    tags: ["sample", "demo", "testing", "documentation", "code", "data"],
    dateCreated: new Date("2024-01-10"),
    dateUpdated: new Date("2024-01-10"),
    fileStructure: [
      {
        name: "documents",
        type: "directory",
        size: 0,
        path: "/documents",
        children: [
          {
            name: "sample-pdf-1.pdf",
            type: "file",
            size: 2097152,
            path: "/documents/sample-pdf-1.pdf"
          },
          {
            name: "README.md",
            type: "file",
            size: 1024,
            path: "/documents/README.md",
            content: `# Comprehensive Sample Dataset

This dataset contains various file types for testing purposes:

## File Types Included:
- **PDF Documents**: Sample PDF files
- **JSON Data**: Structured data files
- **CSS Stylesheets**: Web styling files
- **TypeScript Code**: TypeScript source files
- **Python Scripts**: Python code files
- **HTML Pages**: Web page files
- **Configuration Files**: YAML, JSON configs

## Usage:
This dataset is designed to test file previews, downloads, and various file type handling in the PIDS system.

## File Structure:
- \`/documents/\` - PDF and documentation files
- \`/data/\` - JSON and CSV data files
- \`/code/\` - Source code files
- \`/styles/\` - CSS and styling files
- \`/config/\` - Configuration files

Each file type demonstrates different preview capabilities and download handling.`
          }
        ]
      },
      {
        name: "data",
        type: "directory",
        size: 0,
        path: "/data",
        children: [
          {
            name: "demographics.json",
            type: "file",
            size: 2048,
            path: "/data/demographics.json",
            content: `{
  "metadata": {
    "dataset": "Demographics Sample",
    "version": "1.0",
    "description": "Sample demographic data for testing"
  },
  "data": [
    {
      "id": 1,
      "age": 25,
      "gender": "female",
      "location": "New York",
      "income": 75000
    },
    {
      "id": 2,
      "age": 32,
      "gender": "male",
      "location": "Los Angeles",
      "income": 85000
    },
    {
      "id": 3,
      "age": 28,
      "gender": "female",
      "location": "Chicago",
      "income": 65000
    }
  ],
  "summary": {
    "total_records": 3,
    "average_age": 28.3,
    "average_income": 75000
  }
}`
          },
          {
            name: "photo_metadata.json",
            type: "file",
            size: 1536,
            path: "/data/photo_metadata.json",
            content: `{
  "photos": [
    {
      "id": "photo_001",
      "filename": "cat1.jpg",
      "camera": "Canon EOS R5",
      "settings": {
        "aperture": "f/2.8",
        "shutter_speed": "1/200",
        "iso": 400,
        "focal_length": "85mm"
      },
      "location": "Studio",
      "tags": ["portrait", "indoor", "professional"]
    },
    {
      "id": "photo_002",
      "filename": "cat2.jpg",
      "camera": "Sony A7R IV",
      "settings": {
        "aperture": "f/4.0",
        "shutter_speed": "1/500",
        "iso": 200,
        "focal_length": "50mm"
      },
      "location": "Outdoor Garden",
      "tags": ["action", "outdoor", "natural_light"]
    }
  ]
}`
          }
        ]
      },
      {
        name: "code",
        type: "directory",
        size: 0,
        path: "/code",
        children: [
          {
            name: "data_analysis.py",
            type: "file",
            size: 3072,
            path: "/code/data_analysis.py",
            content: `#!/usr/bin/env python3
"""
Data Analysis Script
Sample Python script for data processing and analysis
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Any

class DataAnalyzer:
    """A class for performing data analysis tasks."""
    
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.data = None
        
    def load_data(self) -> pd.DataFrame:
        """Load data from CSV file."""
        try:
            self.data = pd.read_csv(self.data_path)
            print(f"Loaded {len(self.data)} records")
            return self.data
        except FileNotFoundError:
            print(f"Error: File {self.data_path} not found")
            return None
    
    def analyze_temperature(self) -> Dict[str, Any]:
        """Analyze temperature data."""
        if self.data is None:
            return {"error": "No data loaded"}
        
        analysis = {
            "mean_temp": self.data['Temperature_C'].mean(),
            "max_temp": self.data['Temperature_C'].max(),
            "min_temp": self.data['Temperature_C'].min(),
            "std_temp": self.data['Temperature_C'].std()
        }
        
        return analysis
    
    def plot_temperature_trend(self, save_path: str = None):
        """Create temperature trend plot."""
        plt.figure(figsize=(12, 6))
        plt.plot(self.data['Date'], self.data['Temperature_C'])
        plt.title('Temperature Trend Over Time')
        plt.xlabel('Date')
        plt.ylabel('Temperature (°C)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
        else:
            plt.show()

if __name__ == "__main__":
    analyzer = DataAnalyzer("temperature_data.csv")
    data = analyzer.load_data()
    
    if data is not None:
        analysis = analyzer.analyze_temperature()
        print("Temperature Analysis:", analysis)
        analyzer.plot_temperature_trend()
`
          },
          {
            name: "chart-utils.js",
            type: "file",
            size: 4096,
            path: "/code/chart-utils.js",
            content: `/**
 * Chart Utilities
 * JavaScript utilities for creating and managing charts
 */

class ChartUtils {
    constructor() {
        this.charts = new Map();
        this.defaultColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
    }

    /**
     * Create a line chart
     * @param {string} containerId - DOM element ID
     * @param {Array} data - Chart data
     * @param {Object} options - Chart options
     */
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return null;
        }

        const chart = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                ...options
            }
        };

        this.charts.set(containerId, chart);
        return chart;
    }

    /**
     * Create a bar chart
     * @param {string} containerId - DOM element ID
     * @param {Array} data - Chart data
     * @param {Object} options - Chart options
     */
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return null;
        }

        const chart = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                ...options
            }
        };

        this.charts.set(containerId, chart);
        return chart;
    }

    /**
     * Update chart data
     * @param {string} containerId - Chart container ID
     * @param {Array} newData - New chart data
     */
    updateChart(containerId, newData) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.data = newData;
            // Trigger chart update (implementation depends on chart library)
            console.log('Chart updated:', containerId);
        }
    }

    /**
     * Destroy a chart
     * @param {string} containerId - Chart container ID
     */
    destroyChart(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            // Clean up chart resources
            this.charts.delete(containerId);
            console.log('Chart destroyed:', containerId);
        }
    }

    /**
     * Get random color from palette
     * @returns {string} Color hex code
     */
    getRandomColor() {
        return this.defaultColors[Math.floor(Math.random() * this.defaultColors.length)];
    }

    /**
     * Format number for display
     * @param {number} value - Number to format
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted number
     */
    formatNumber(value, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartUtils;
}

// Global instance
window.ChartUtils = new ChartUtils();
`
          }
        ]
      },
      {
        name: "styles",
        type: "directory",
        size: 0,
        path: "/styles",
        children: [
          {
            name: "styles.css",
            type: "file",
            size: 2048,
            path: "/styles/styles.css",
            content: `/* Comprehensive Sample Dataset Styles */

/* Base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

/* Header styles */
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
}

.header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Card styles */
.card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5rem;
}

/* Button styles */
.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
}

.btn:hover {
    background: #2980b9;
}

.btn-secondary {
    background: #95a5a6;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

/* Form styles */
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #2c3e50;
}

.form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* Grid layout */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
}

/* Animation classes */
.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Utility classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
`
          }
        ]
      },
      {
        name: "config",
        type: "directory",
        size: 0,
        path: "/config",
        children: [
          {
            name: "config.yaml",
            type: "file",
            size: 1024,
            path: "/config/config.yaml",
            content: `# Application Configuration
# Comprehensive Sample Dataset Configuration

# Database settings
database:
  host: localhost
  port: 27017
  name: pids_database
  connection_pool_size: 10
  timeout: 30

# API settings
api:
  host: 0.0.0.0
  port: 3000
  cors_origins:
    - http://localhost:3000
    - http://localhost:8080
  rate_limit:
    window_ms: 900000
    max_requests: 100

# File storage settings
storage:
  type: minio
  endpoint: localhost:9000
  access_key: minioadmin
  secret_key: minioadmin
  bucket: pids-files
  region: us-east-1

# Authentication settings
auth:
  provider: keycloak
  realm: pids
  client_id: pids-frontend
  public_key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
  token_verify_url: http://localhost:8081/realms/pids/protocol/openid-connect/token/introspect

# Logging settings
logging:
  level: info
  format: json
  output: stdout
  file:
    enabled: false
    path: /var/log/pids/app.log
    max_size: 10MB
    max_files: 5

# Feature flags
features:
  file_preview: true
  file_download: true
  admin_panel: true
  public_datasets: true
  search: true
  filtering: true

# Security settings
security:
  helmet_enabled: true
  rate_limiting: true
  cors_enabled: true
  content_security_policy: true
`
          }
        ]
      }
    ],
    isPublic: true,
    status: 'approved',
    createdBy: "admin"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pids');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Dataset.deleteMany({});
    console.log('🗑️  Cleared existing datasets');

    // Insert mock data
    const datasets = await Dataset.insertMany(mockDatasets);
    console.log(`✅ Seeded ${datasets.length} datasets`);

    // Display summary
    console.log('\n📊 Database Summary:');
    console.log(`Total datasets: ${datasets.length}`);
    
    const tagCounts = {};
    
    datasets.forEach(dataset => {
      dataset.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    console.log('\nTop Tags:');
    Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count}`);
      });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 