const XLSX = require('xlsx');
const GoalSheet = require('../models/GoalSheet');
const User = require('../models/User');
const { calculateSheetProgress, calculateGoalProgress } = require('../utils/progressCalculator');

function buildReportRows(sheets, quarter) {
  const rows = [];
  sheets.forEach((sheet) => {
    const emp = sheet.employee;
    const overall = calculateSheetProgress(sheet.goals, quarter);

    if (!sheet.goals?.length) {
      rows.push({
        Employee: emp?.name || 'N/A',
        Email: emp?.email || '',
        Department: emp?.department || '',
        Year: sheet.year,
        Status: sheet.status,
        'Goal Title': '-',
        'Thrust Area': '-',
        Unit: '-',
        Target: '-',
        Weightage: 0,
        Quarter: quarter,
        Achievement: 0,
        'Achievement Status': '-',
        'Goal Progress %': 0,
        'Overall Progress %': overall,
        'Planned %': 100,
        'Actual %': overall,
        Variance: overall - 100,
      });
      return;
    }

    sheet.goals.forEach((goal) => {
      const qa = goal.quarterlyAchievements?.find((q) => q.quarter === quarter);
      const progress = calculateGoalProgress(goal, qa);
      rows.push({
        Employee: emp?.name || 'N/A',
        Email: emp?.email || '',
        Department: emp?.department || '',
        Year: sheet.year,
        Status: sheet.status,
        'Goal Title': goal.title,
        'Thrust Area': goal.thrustArea,
        Unit: goal.unitOfMeasurement,
        Target: goal.target,
        Weightage: goal.weightage,
        Quarter: quarter,
        Achievement: qa?.achievement ?? 0,
        'Achievement Status': qa?.status ?? 'not_started',
        'Goal Progress %': progress,
        'Overall Progress %': overall,
        'Planned %': 100,
        'Actual %': overall,
        Variance: Math.round((overall - 100) * 100) / 100,
      });
    });
  });
  return rows;
}

/**
 * GET /api/reports/export
 */
exports.exportReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const quarter = req.query.quarter || 'Q1';
    const format = req.query.format || 'xlsx';

    let filter = { year };
    if (req.user.role === 'manager') {
      const teamIds = await User.find({ manager: req.user._id, role: 'employee' }).distinct('_id');
      filter.employee = { $in: teamIds };
    } else if (req.user.role === 'employee') {
      filter.employee = req.user._id;
    }

    const sheets = await GoalSheet.find(filter).populate('employee', 'name email department');
    const rows = buildReportRows(sheets, quarter);

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=goals-report-${year}-${quarter}.csv`);
      return res.send(csv);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Goals Report');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=goals-report-${year}-${quarter}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/analytics
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const quarter = req.query.quarter || 'Q1';

    const sheets = await GoalSheet.find({ year, status: 'approved' }).populate(
      'employee',
      'name department'
    );

    const byDepartment = {};
    const byStatus = { not_started: 0, on_track: 0, completed: 0 };

    sheets.forEach((sheet) => {
      const dept = sheet.employee?.department || 'Unknown';
      const progress = calculateSheetProgress(sheet.goals, quarter);

      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, totalProgress: 0 };
      }
      byDepartment[dept].count += 1;
      byDepartment[dept].totalProgress += progress;

      sheet.goals.forEach((goal) => {
        const qa = goal.quarterlyAchievements?.find((q) => q.quarter === quarter);
        if (qa?.status && byStatus[qa.status] !== undefined) {
          byStatus[qa.status] += 1;
        }
      });
    });

    const departmentChart = Object.entries(byDepartment).map(([name, data]) => ({
      department: name,
      avgProgress: Math.round((data.totalProgress / data.count) * 100) / 100,
      employees: data.count,
    }));

    const plannedVsActual = sheets.map((s) => ({
      name: s.employee?.name,
      planned: 100,
      actual: calculateSheetProgress(s.goals, quarter),
    }));

    res.json({
      success: true,
      departmentChart,
      achievementStatus: byStatus,
      plannedVsActual: plannedVsActual.slice(0, 20),
    });
  } catch (error) {
    next(error);
  }
};
