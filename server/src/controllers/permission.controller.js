import Permission from '../models/permission.model.js';

// Server-side source of truth for role/permission definitions.
// This replaces the previous client-side hardcoded map.
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

const ensureDefaultsSeeded = async () => {
  const operations = [];

  Object.entries(rolePermissionDefinitions).forEach(([role, config]) => {
    config.permissions.forEach((permissionDef) => {
      const defaultValue =
        permissionDef.defaultValue !== undefined ? permissionDef.defaultValue : true;

      operations.push({
        updateOne: {
          filter: { role, key: permissionDef.key },
          update: {
            $setOnInsert: {
              role,
              key: permissionDef.key,
              label: permissionDef.label,
              description: permissionDef.description || '',
              readOnly: Boolean(permissionDef.readOnly),
              defaultValue,
              value: defaultValue,
            },
            $set: {
              // Keep label/description/readOnly in sync if they change server-side
              label: permissionDef.label,
              description: permissionDef.description || '',
              readOnly: Boolean(permissionDef.readOnly),
            },
          },
          upsert: true,
        },
      });
    });
  });

  if (operations.length > 0) {
    await Permission.bulkWrite(operations);
  }
};

const buildValuesFromDocs = (docs) => {
  const values = {};
  docs.forEach((doc) => {
    if (!values[doc.role]) values[doc.role] = {};
    values[doc.role][doc.key] = doc.value;
  });
  return values;
};

export const getPermissions = async (req, res) => {
  try {
    await ensureDefaultsSeeded();
    const docs = await Permission.find({});
    const values = buildValuesFromDocs(docs);

    res.json({
      definitions: rolePermissionDefinitions,
      values,
    });
  } catch (error) {
    console.error('Error fetching permissions', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { role, key, value } = req.body || {};

    if (!role || !key || typeof value !== 'boolean') {
      return res.status(400).json({
        message: 'role, key and boolean value are required',
      });
    }

    const permission = await Permission.findOne({ role, key });
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    if (permission.readOnly) {
      return res
        .status(400)
        .json({ message: 'This permission is read-only and cannot be changed' });
    }

    permission.value = value;
    await permission.save();

    res.json({
      role,
      key,
      value: permission.value,
    });
  } catch (error) {
    console.error('Error updating permission', error);
    res.status(500).json({ message: 'Failed to update permission' });
  }
};

export const resetPermissions = async (_req, res) => {
  try {
    await Permission.deleteMany({});
    await ensureDefaultsSeeded();
    const docs = await Permission.find({});
    const values = buildValuesFromDocs(docs);

    res.json({
      definitions: rolePermissionDefinitions,
      values,
    });
  } catch (error) {
    console.error('Error resetting permissions', error);
    res.status(500).json({ message: 'Failed to reset permissions to defaults' });
  }
};
