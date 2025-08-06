import express from 'express';
import Dataset from '../models/Dataset.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/datasets - Get all datasets
router.get('/', async (req, res) => {
  try {
    const { search, format, tags, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = { isPublic: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (format) {
      query.format = format;
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const datasets = await Dataset.find(query)
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Dataset.countDocuments(query);
    
    res.json({
      success: true,
      data: datasets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/datasets/:id - Get dataset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const dataset = await Dataset.findById(id).lean();
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }
    
    res.json({
      success: true,
      data: dataset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/datasets - Create new dataset (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const datasetData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const dataset = new Dataset(datasetData);
    await dataset.save();
    
    res.status(201).json({
      success: true,
      data: dataset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/datasets/:id - Update dataset (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const dataset = await Dataset.findByIdAndUpdate(
      id,
      { ...updateData, dateUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }
    
    res.json({
      success: true,
      data: dataset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/datasets/:id - Delete dataset (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const dataset = await Dataset.findByIdAndDelete(id);
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 