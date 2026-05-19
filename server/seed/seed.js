/**
 * Seed script — demo accounts and sample goal data
 * Run: npm run seed (from server folder, with MONGODB_URI in .env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const GoalSheet = require('../models/GoalSheet');

const DEMO_PASSWORD = 'Demo@123';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await GoalSheet.deleteMany({});
    await User.deleteMany({});

    const admin = await User.create({
      name: 'Sarah Admin',
      email: 'admin@company.com',
      password: DEMO_PASSWORD,
      role: 'admin',
      department: 'Human Resources',
      employeeId: 'ADM001',
    });

    const manager = await User.create({
      name: 'Michael Manager',
      email: 'manager@company.com',
      password: DEMO_PASSWORD,
      role: 'manager',
      department: 'Sales',
      employeeId: 'MGR001',
    });

    const employee1 = await User.create({
      name: 'John Employee',
      email: 'employee@company.com',
      password: DEMO_PASSWORD,
      role: 'employee',
      department: 'Sales',
      manager: manager._id,
      employeeId: 'EMP001',
    });

    const employee2 = await User.create({
      name: 'Emily Chen',
      email: 'emily@company.com',
      password: DEMO_PASSWORD,
      role: 'employee',
      department: 'Sales',
      manager: manager._id,
      employeeId: 'EMP002',
    });

    const year = new Date().getFullYear();

    const initQA = () =>
      ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => ({
        quarter: q,
        achievement: q === 'Q1' ? 75 : 0,
        status: q === 'Q1' ? 'on_track' : 'not_started',
        progress: q === 'Q1' ? 75 : 0,
      }));

    await GoalSheet.create({
      employee: employee1._id,
      year,
      status: 'approved',
      isLocked: true,
      approvedAt: new Date(),
      approvedBy: manager._id,
      goals: [
        {
          title: 'Increase quarterly revenue',
          description: 'Drive new business and upsell existing accounts',
          thrustArea: 'Revenue Growth',
          unitOfMeasurement: 'percentage',
          target: 100,
          weightage: 40,
          quarterlyAchievements: initQA(),
        },
        {
          title: 'Customer satisfaction score',
          description: 'Maintain NPS above target',
          thrustArea: 'Customer Experience',
          unitOfMeasurement: 'numeric',
          target: 85,
          weightage: 30,
          quarterlyAchievements: initQA().map((q) => ({
            ...q,
            achievement: q.quarter === 'Q1' ? 82 : 0,
            progress: q.quarter === 'Q1' ? 96.47 : 0,
          })),
        },
        {
          title: 'Reduce support ticket backlog',
          description: 'Zero-based: zero open tickets at month end',
          thrustArea: 'Operational Excellence',
          unitOfMeasurement: 'zero_based',
          target: 0,
          weightage: 30,
          quarterlyAchievements: initQA().map((q) => ({
            ...q,
            achievement: q.quarter === 'Q1' ? 0 : 5,
            progress: q.quarter === 'Q1' ? 100 : 0,
            status: q.quarter === 'Q1' ? 'completed' : 'not_started',
          })),
        },
      ],
    });

    await GoalSheet.create({
      employee: employee2._id,
      year,
      status: 'submitted',
      goals: [
        {
          title: 'Launch product campaign',
          description: 'Complete campaign by Q2 deadline',
          thrustArea: 'Innovation & R&D',
          unitOfMeasurement: 'timeline',
          target: new Date(year, 5, 30).toISOString(),
          weightage: 50,
          quarterlyAchievements: initQA(),
        },
        {
          title: 'Training completion rate',
          description: 'Complete mandatory compliance training',
          thrustArea: 'People & Culture',
          unitOfMeasurement: 'percentage',
          target: 100,
          weightage: 50,
          quarterlyAchievements: initQA(),
        },
      ],
    });

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Demo accounts (password for all: Demo@123):');
    console.log('  Admin:    admin@company.com');
    console.log('  Manager:  manager@company.com');
    console.log('  Employee: employee@company.com');
    console.log('  Employee: emily@company.com\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
