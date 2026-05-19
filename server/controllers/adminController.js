const User = require('../models/User');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');
const { calculateSheetProgress } = require('../utils/progressCalculator');
const { logAudit } = require('../middleware/auditLogger');

/**
 * GET /api/admin/dashboard
 */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const quarter = req.query.quarter || 'Q1';

    const [totalUsers, employees, managers, sheets] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'employee', isActive: true }),
      User.countDocuments({ role: 'manager', isActive: true }),
      GoalSheet.find({ year }).populate('employee', 'name department'),
    ]);

    const completionStats = {
      draft: sheets.filter((s) => s.status === 'draft').length,
      submitted: sheets.filter((s) => s.status === 'submitted').length,
      approved: sheets.filter((s) => s.status === 'approved').length,
      rejected: sheets.filter((s) => s.status === 'rejected').length,
      rework: sheets.filter((s) => s.status === 'rework').length,
      locked: sheets.filter((s) => s.isLocked).length,
    };

    const progressData = sheets.map((s) => ({
      _id: s._id,
      employee: s.employee?.name,
      department: s.employee?.department,
      status: s.status,
      isLocked: s.isLocked,
      progress: calculateSheetProgress(s.goals, quarter),
      goalCount: s.goals.length,
    }));

    const avgProgress =
      progressData.length > 0
        ? Math.round(
            (progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length) * 100
          ) / 100
        : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        employees,
        managers,
        goalSheets: sheets.length,
        avgProgress,
        completionStats,
      },
      progressData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('manager', 'name email')
      .select('-password')
      .sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/users
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, manager, employeeId } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Password@123',
      role: role || 'employee',
      department,
      manager: manager || null,
      employeeId,
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.password;

    if (req.body.password) {
      const user = await User.findById(req.params.id).select('+password');
      user.password = req.body.password;
      await user.save();
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'name email')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 */
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user, message: 'User deactivated.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/goals/:sheetId/unlock
 */
exports.unlockGoalSheet = async (req, res, next) => {
  try {
    const sheet = await GoalSheet.findById(req.params.sheetId);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    sheet.isLocked = false;
    sheet.status = 'rework';
    await sheet.save();

    await logAudit({
      goalSheetId: sheet._id,
      changedBy: req.user._id,
      action: 'unlock',
      description: 'Admin unlocked approved goals for editing',
    });

    res.json({ success: true, goalSheet: sheet, message: 'Goal sheet unlocked.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, goalSheetId } = req.query;
    const filter = goalSheetId ? { goalSheet: goalSheetId } : {};

    const logs = await AuditLog.find(filter)
      .populate('changedBy', 'name email role')
      .populate('goalSheet', 'year')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await AuditLog.countDocuments(filter);

    res.json({ success: true, logs, total, page: parseInt(page, 10) });
  } catch (error) {
    next(error);
  }
};
