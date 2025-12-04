import Permission from '../models/permission.model.js';

/**
 * Middleware to check if a user has a specific permission for their role.
 * Usage: checkPermission('user', 'viewBookings')
 *
 * This middleware should be used AFTER the protect middleware to ensure req.user exists.
 */
export const checkPermission = (role, permissionKey) => {
  return async (req, res, next) => {
    try {
      // Admins always have full access
      if (req.user?.role === 'admin') {
        return next();
      }

      // If the user's role doesn't match the required role, deny access
      if (req.user?.role !== role) {
        return res.status(403).json({
          message: 'Access denied. This feature is not available for your role.',
        });
      }

      // Find the permission in the database
      const permission = await Permission.findOne({
        role,
        key: permissionKey,
      });

      // If permission doesn't exist, default to false (deny access)
      if (!permission) {
        return res.status(403).json({
          message: 'This feature is disabled by the admin.',
        });
      }

      // Check if the permission is enabled
      if (!permission.value) {
        return res.status(403).json({
          message: 'This feature is disabled by the admin.',
        });
      }

      // Permission is enabled, allow access
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        message: 'Error checking permissions',
      });
    }
  };
};

/**
 * Middleware to check permission based on user's role dynamically.
 * Maps user role to permission key:
 * - user -> 'updateProfile'
 * - supplier -> 'manageProducts'
 * Usage: checkProfilePermission()
 */
export const checkProfilePermission = () => {
  return async (req, res, next) => {
    try {
      // Admins always have full access
      if (req.user?.role === 'admin') {
        return next();
      }

      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Map role to permission key
      const permissionMap = {
        user: 'updateProfile',
        supplier: 'manageProducts',
      };

      const permissionKey = permissionMap[userRole];
      if (!permissionKey) {
        return res.status(403).json({
          message: 'Access denied. This feature is not available for your role.',
        });
      }

      // Find the permission in the database
      const permission = await Permission.findOne({
        role: userRole,
        key: permissionKey,
      });

      // If permission doesn't exist, default to false (deny access)
      if (!permission) {
        return res.status(403).json({
          message: 'This feature is disabled by the admin.',
        });
      }

      // Check if the permission is enabled
      if (!permission.value) {
        return res.status(403).json({
          message: 'This feature is disabled by the admin.',
        });
      }

      // Permission is enabled, allow access
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        message: 'Error checking permissions',
      });
    }
  };
};

/**
 * Helper function to check multiple permissions (OR logic - user needs at least one)
 */
export const checkAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === 'admin') {
        return next();
      }

      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if user has at least one of the required permissions
      for (const { role, key } of permissions) {
        if (userRole !== role) continue;

        const permission = await Permission.findOne({ role, key });
        if (permission && permission.value) {
          return next();
        }
      }

      // No permission found, deny access
      return res.status(403).json({
        message: 'This feature is disabled by the admin.',
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        message: 'Error checking permissions',
      });
    }
  };
};
