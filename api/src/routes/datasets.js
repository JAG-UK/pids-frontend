import express from 'express';
import Dataset from '../models/Dataset.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/datasets - Get datasets (filtered by authentication)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, format, tags, page = 1, limit = 10 } = req.query;
    
    console.log('🔍 GET /api/datasets - Auth state:', { 
      hasUser: !!req.user, 
      userRoles: req.user?.roles || [], 
      isAdmin: req.user?.roles?.includes('admin') || false 
    });
    
    // Build query - filter by status based on authentication
    let query = { isPublic: true };
    
    // If user is not authenticated or not admin, only return approved datasets
    if (!req.user || !req.user.roles.includes('admin')) {
      query.status = 'approved';
      console.log('🔒 Filtering to approved datasets only');
    } else {
      console.log('👑 Admin user - returning all datasets');
    }
    
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
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const datasets = await Dataset.find(query)
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Dataset.countDocuments(query);
    
    console.log(`📊 Found ${datasets.length} datasets (total: ${total})`);
    
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
    console.error('❌ Error in GET /api/datasets:', error);
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

// PUT /api/datasets/:id/approve - Approve dataset (admin only)
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const dataset = await Dataset.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        dateUpdated: new Date(),
        verifiedDate: new Date()
      },
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

// PUT /api/datasets/:id/reject - Reject dataset (admin only)
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const dataset = await Dataset.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        dateUpdated: new Date()
      },
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

export default router; 