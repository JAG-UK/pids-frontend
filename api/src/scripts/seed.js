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
    
    const formatCounts = {};
    const tagCounts = {};
    
    datasets.forEach(dataset => {
      formatCounts[dataset.format] = (formatCounts[dataset.format] || 0) + 1;
      dataset.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    console.log('\nFormats:');
    Object.entries(formatCounts).forEach(([format, count]) => {
      console.log(`  ${format}: ${count}`);
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