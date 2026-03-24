import Permission from '../models/permission.model.js';

// Single source of truth for role/permission definitions
const rolePermissionDefinitions = {
  user: {
    label: 'Normal User',
    description: 'Controls what clients can do in the self-service portal.',
    permissions: [
      {
        key: 'viewBookings',
        label: 'View bookings',
        description: 'Allows access to the My Bookings page and related widgets.',
        defaultValue: true,
      },
      {
        key: 'submitRequests',
        label: 'Submit booking requests',
        description: 'Enables access to booking request forms and modals.',
        defaultValue: true,
      },
      {
        key: 'updateProfile',
        label: 'Update personal info',
        description: 'Allows editing contact info and uploading profile pictures.',
        defaultValue: true,
      },
    ],
  },
  supplier: {
    label: 'Supplier',
    description: 'Controls actions available in the supplier portal.',
    permissions: [
      {
        key: 'viewBookings',
        label: 'View assigned bookings',
        description: 'Access dashboards and tables that list assigned weddings.',
        defaultValue: true,
      },
      {
        key: 'manageProducts',
        label: 'Manage services & availability',
        description: 'Allow edits to supplier profile, pricing, and availability.',
        defaultValue: true,
      },
      {
        key: 'generateReports',
        label: 'Generate performance reports',
        description: 'Shows reporting shortcuts in the supplier dashboard.',
        defaultValue: true,
      },
    ],
  },
  admin: {
    label: 'Admin',
    description: 'Read-only overview of system-wide permissions.',
    permissions: [
      {
        key: 'manageSystem',
        label: 'Manage system',
        description: 'Admins always keep full access and cannot be limited.',
        readOnly: true,
        defaultValue: true,
      },
    ],
  },
};

// Build values map from Permission docs
const buildValuesFromDocs = (docs) => {
  const values = {};
  docs.forEach((doc) => {
    if (!values[doc.role]) values[doc.role] = {};
    values[doc.role][doc.key] = doc.value;
  });
  return values;
};

// Seed DB with defaults if missing
const ensureDefaultsSeeded = async () => {
  const tasks = [];

  Object.entries(rolePermissionDefinitions).forEach(([role, config]) => {
    config.permissions.forEach((permissionDef) => {
      const defaultValue =
        permissionDef.defaultValue !== undefined ? permissionDef.defaultValue : true;

      tasks.push(
        Permission.findOneAndUpdate(
          { role, key: permissionDef.key },
          {
            $setOnInsert: {
              role,
              key: permissionDef.key,
              label: permissionDef.label,
              description: permissionDef.description || '',
              readOnly: Boolean(permissionDef.readOnly),
              defaultValue,
              value: defaultValue,
            },
          },
          { new: true, upsert: true }
        )
      );
    });
  });

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
};

// GET /api/permissions
// Returns only the boolean values; the UI structure is static on the frontend.
export const getPermissions = async (_req, res) => {
  try {
    await ensureDefaultsSeeded();
    const docs = await Permission.find({});
    const values = buildValuesFromDocs(docs);

    return res.json({ values });
  } catch (error) {
    console.error('Error fetching permissions', error);
    // Fallback: still respond with an empty map so the UI can fall back to defaults.
    return res.status(200).json({
      values: {},
      error: 'Failed to load stored permission values; using defaults only.',
    });
  }
};

// PUT /api/permissions  { role, key, value:boolean }
export const updatePermission = async (req, res) => {
  try {
    const { role, key, value } = req.body || {};

    if (!role || !key || typeof value !== 'boolean') {
      return res.status(400).json({
        message: 'role, key and boolean value are required',
      });
    }

    const roleDef = rolePermissionDefinitions[role];
    const permissionDef = roleDef?.permissions.find((p) => p.key === key);

    if (!permissionDef) {
      return res.status(400).json({ message: `Unknown permission ${role}.${key}` });
    }

    if (permissionDef.readOnly) {
      return res
        .status(400)
        .json({ message: 'This permission is read-only and cannot be changed' });
    }

    const defaultValue =
      permissionDef.defaultValue !== undefined ? permissionDef.defaultValue : true;

    // Simpler and more explicit upsert: find, then create or update.
    let permission = await Permission.findOne({ role, key });

    if (!permission) {
      permission = new Permission({
        role,
        key,
        label: permissionDef.label,
        description: permissionDef.description || '',
        readOnly: Boolean(permissionDef.readOnly),
        defaultValue,
        value,
      });
    } else {
      permission.label = permissionDef.label;
      permission.description = permissionDef.description || '';
      permission.readOnly = Boolean(permissionDef.readOnly);
      permission.defaultValue = defaultValue;
      permission.value = value;
    }

    await permission.save();

    return res.json({
      role: permission.role,
      key: permission.key,
      value: permission.value,
    });
  } catch (error) {
    console.error('Error updating permission', error);
    return res.status(500).json({ message: 'Failed to update permission', error: error.message });
  }
};

// POST /api/permissions/reset
export const resetPermissions = async (_req, res) => {
  try {
    await Permission.deleteMany({});
    await ensureDefaultsSeeded();
    const docs = await Permission.find({});
    const values = buildValuesFromDocs(docs);

    return res.json({ values });
  } catch (error) {
    console.error('Error resetting permissions', error);
    return res.status(500).json({ message: 'Failed to reset permissions to defaults' });
  }
};
