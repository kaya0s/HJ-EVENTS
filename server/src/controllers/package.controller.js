import Package from '../models/package.model.js';
import cloudinary from '../utils/cloudinary.js';

// Helper to upload buffer to Cloudinary and return secure_url
const uploadBufferToCloudinary = async (buffer, filename = 'upload') => {
  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'packages' });
  return result.secure_url;
};

/**
 * @desc   Create a package
 * @route  POST /api/packages
 * @access Admin
 */
export const createPackage = async (req, res) => {
  try {
    // Multer parses FormData and puts text fields in req.body
    const data = req.body || {};
    const name = data.name;
    const description = data.description || '';
    const price = data.price;
    const suppliersData = data.suppliers;

    console.log('Request body:', data);
    console.log('Request file:', req.file ? 'File received' : 'No file');

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    let imageURL = '';
    if (req.file && req.file.buffer) {
      try {
        imageURL = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    let supplierIds = [];
    if (suppliersData) {
      try {
        supplierIds = typeof suppliersData === 'string' ? JSON.parse(suppliersData) : suppliersData;
      } catch (e) {
        console.log('Failed to parse suppliers, using empty array');
        supplierIds = [];
      }
    }

    const newPackage = new Package({
      name,
      description,
      price: parseFloat(price),
      imageURL,
      suppliers: supplierIds,
    });

    const savedPackage = await newPackage.save();
    console.log('Package saved with imageURL:', savedPackage.imageURL);
    res.status(201).json({ package: savedPackage });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get all packages
 * @route  GET /api/packages
 * @access Public
 */
export const listPackages = async (req, res) => {
  try {
    const packages = await Package.find({}).populate('suppliers', 'name category').sort('-createdAt');
    res.json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get a single package
 * @route  GET /api/packages/:id
 * @access Public
 */
export const getPackage = async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id).populate('suppliers', 'name category');
    if (!packageItem) return res.status(404).json({ message: 'Package not found' });
    res.json({ package: packageItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Update a package
 * @route  PUT /api/packages/:id
 * @access Admin
 */
export const updatePackage = async (req, res) => {
  try {
    const data = req.body || {};
    const name = data.name;
    const description = data.description || '';
    const price = data.price;
    const suppliersData = data.suppliers;

    const updates = { name, description, price: parseFloat(price) };

    // Handle suppliers
    let supplierIds = [];
    if (suppliersData) {
      try {
        supplierIds = typeof suppliersData === 'string' ? JSON.parse(suppliersData) : suppliersData;
      } catch (e) {
        supplierIds = [];
      }
    }
    updates.suppliers = supplierIds;

    // If file buffer available, upload to cloudinary and set imageURL
    if (req.file && req.file.buffer) {
      try {
        const imageURL = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
        updates.imageURL = imageURL;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    const packageItem = await Package.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('suppliers', 'name category');

    if (!packageItem) return res.status(404).json({ message: 'Package not found' });

    res.json({ package: packageItem });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Delete a package
 * @route  DELETE /api/packages/:id
 * @access Admin
 */
export const deletePackage = async (req, res) => {
  try {
    const packageItem = await Package.findByIdAndDelete(req.params.id);
    if (!packageItem) return res.status(404).json({ message: 'Package not found' });

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Toggle package availability
 * @route  PATCH /api/packages/:id/availability
 * @access Admin
 */
export const toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean value' });
    }

    const packageItem = await Package.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true, runValidators: true }
    ).populate('suppliers', 'name category');

    if (!packageItem) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ package: packageItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
