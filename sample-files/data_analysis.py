#!/usr/bin/env python3
"""
Climate Data Analysis Script
Analyzes temperature and precipitation data from NOAA weather stations.
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

def load_climate_data():
    """Load climate data from CSV files."""
    try:
        temp_data = pd.read_csv('january_temps.csv')
        rainfall_data = pd.read_csv('q1_rainfall.csv')
        return temp_data, rainfall_data
    except FileNotFoundError as e:
        print(f"Error loading data: {e}")
        return None, None

def analyze_temperatures(temp_data):
    """Analyze temperature patterns."""
    if temp_data is None:
        return
    
    print("Temperature Analysis:")
    print(f"Average temperature: {temp_data['temperature'].mean():.1f}°F")
    print(f"Temperature range: {temp_data['temperature'].min():.1f}°F - {temp_data['temperature'].max():.1f}°F")
    
    # Group by location
    location_stats = temp_data.groupby('location')['temperature'].agg(['mean', 'std'])
    print("\nTemperature by location:")
    print(location_stats)

def analyze_rainfall(rainfall_data):
    """Analyze rainfall patterns."""
    if rainfall_data is None:
        return
    
    print("\nRainfall Analysis:")
    print(f"Total rainfall: {rainfall_data['rainfall_mm'].sum():.1f} mm")
    print(f"Average monthly rainfall: {rainfall_data['rainfall_mm'].mean():.1f} mm")
    
    # Monthly breakdown
    monthly_rainfall = rainfall_data.groupby('month')['rainfall_mm'].sum()
    print("\nMonthly rainfall totals:")
    print(monthly_rainfall)

def main():
    """Main analysis function."""
    print("Climate Data Analysis")
    print("=" * 50)
    
    # Load data
    temp_data, rainfall_data = load_climate_data()
    
    # Perform analysis
    analyze_temperatures(temp_data)
    analyze_rainfall(rainfall_data)
    
    print("\nAnalysis complete!")

if __name__ == "__main__":
    main()


