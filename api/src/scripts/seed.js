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
        path: "/temperature_data.csv"
      },
      {
        name: "humidity_data.csv",
        type: "file",
        size: 1024576,
        path: "/humidity_data.csv"
      }
    ],
    isPublic: true,
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
        path: "/traffic_flow.json"
      }
    ],
    isPublic: true,
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
            name: "cat1.jpg",
            type: "file",
            size: 2048576,
            path: "/images/cat1.jpg",
            imageUrl: "/api/files/cat1.jpg"
          },
          {
            name: "cat2.jpg",
            type: "file",
            size: 1876544,
            path: "/images/cat2.jpg",
            imageUrl: "/api/files/cat2.jpg"
          },
          {
            name: "cat3.jpg",
            type: "file",
            size: 2150400,
            path: "/images/cat3.jpg",
            imageUrl: "/api/files/cat3.jpg"
          },
          {
            name: "cat4.jpg",
            type: "file",
            size: 1984512,
            path: "/images/cat4.jpg",
            imageUrl: "/api/files/cat4.jpg"
          },
          {
            name: "cat5.jpg",
            type: "file",
            size: 2232320,
            path: "/images/cat5.jpg",
            imageUrl: "/api/files/cat5.jpg"
          }
        ]
      },
      {
        name: "metadata.json",
        type: "file",
        size: 1024,
        path: "/metadata.json"
      }
    ],
    isPublic: true,
    createdBy: "admin"
  },
  {
    title: "Financial Market Analysis",
    description: "Historical stock market data with technical indicators and trading signals. Includes price movements, volume analysis, and market sentiment metrics.",
    format: "Parquet",
    size: 4194304,
    tags: ["finance", "trading", "stocks", "analysis"],
    dateCreated: new Date("2024-01-30"),
    dateUpdated: new Date("2024-01-30"),
    fileStructure: [
      {
        name: "market_data.parquet",
        type: "file",
        size: 4194304,
        path: "/market_data.parquet"
      }
    ],
    isPublic: true,
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
      }
    ],
    isPublic: true,
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