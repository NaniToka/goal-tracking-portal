/**
 * Idempotent demo user setup — safe to run against production MongoDB.
 * Does not delete existing goal sheets or other users.
 *
 * Run: npm run seed:demo (from server folder, with MONGODB_URI in .env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const DEMO_PASSWORD = 'Demo@123';

const DEMO_USERS = [
  {
    name: 'Sarah Admin',
    email: 'admin@company.com',
    role: 'admin',
    department: 'Human Resources',
    employeeId: 'ADM001',
  },
  {
    name: 'Michael Manager',
    email: 'manager@company.com',
    role: 'manager',
    department: 'Sales',
    employeeId: 'MGR001',
  },
  {
    name: 'John Employee',
    email: 'employee@company.com',
    role: 'employee',
    department: 'Sales',
    employeeId: 'EMP001',
  },
];

async function upsertDemoUser(demo, managerId) {
  let user = await User.findOne({ email: demo.email }).select('+password');
  if (!user) {
    const payload = {
      ...demo,
      password: DEMO_PASSWORD,
    };
    if (demo.email === 'employee@company.com' && managerId) {
      payload.manager = managerId;
    }
    await User.create(payload);
    console.log(`  Created ${demo.email}`);
    return;
  }

  user.name = demo.name;
  user.role = demo.role;
  user.department = demo.department;
  user.employeeId = demo.employeeId;
  user.isActive = true;
  user.password = DEMO_PASSWORD;
  if (demo.email === 'employee@company.com' && managerId) {
    user.manager = managerId;
  }
  await user.save();
  console.log(`  Updated ${demo.email}`);
}

async function ensureDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const managerDemo = DEMO_USERS.find((u) => u.email === 'manager@company.com');
    await upsertDemoUser(managerDemo);
    const manager = await User.findOne({ email: 'manager@company.com' });

    for (const demo of DEMO_USERS) {
      if (demo.email === 'manager@company.com') continue;
      await upsertDemoUser(demo, manager?._id);
    }

    console.log('\n✅ Demo accounts ready (password for all: Demo@123)');
    console.log('  admin@company.com | manager@company.com | employee@company.com\n');
    process.exit(0);
  } catch (error) {
    console.error('ensureDemoUsers failed:', error);
    process.exit(1);
  }
}

ensureDemoUsers();
