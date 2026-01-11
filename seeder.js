const mongoose = require('mongoose');
const University = require('./models/University');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

/* =======================
   Connect to Database
======================= */
connectDB();

/* =======================
   Universities Data
======================= */
const universities = [
  { name: 'University of Tunis', emailDomain: 'utunis.tn' },
  { name: 'Tunis El Manar University', emailDomain: 'utm.tn' },
  { name: 'University of Carthage', emailDomain: 'ucar.tn' },
  { name: 'University of Sfax', emailDomain: 'usf.tn' },
  { name: 'University of Sousse', emailDomain: 'uc.rnu.tn' },
  { name: 'University of Monastir', emailDomain: 'um.rnu.tn' },
  { name: 'University of Gabès', emailDomain: 'ugb.rnu.tn' },
  { name: 'University of Gafsa', emailDomain: 'ugaf.rnu.tn' },
  { name: 'University of Kairouan', emailDomain: 'uk.rnu.tn' },
  { name: 'University of Manouba', emailDomain: 'uma.tn' },
  { name: 'University of Jendouba', emailDomain: 'uj.rnu.tn' },
  { name: 'University of Kasserine', emailDomain: 'ukas.rnu.tn' },
  { name: 'University of Mahdia', emailDomain: 'umhd.rnu.tn' },
  { name: 'University of Tataouine', emailDomain: 'utat.rnu.tn' },
  { name: 'University of Tozeur', emailDomain: 'utozeur.rnu.tn' },
  { name: 'University of Sidi Bouzid', emailDomain: 'usb.rnu.tn' },
  { name: 'University of Kebili', emailDomain: 'ukebili.rnu.tn' },
  { name: 'University of Medenine', emailDomain: 'umed.rnu.tn' },
  { name: 'University of Zaghouan', emailDomain: 'uz.rnu.tn' },
  { name: 'University of Bizerte', emailDomain: 'ub.rnu.tn' }
];

/* =======================
   Random Helpers
======================= */
const firstNames = [
  'Ahmed', 'Mohamed', 'Youssef', 'Ali', 'Amine', 'Karim', 'Sami',
  'Slim', 'Anis', 'Houssem', 'Firas', 'Rayen', 'Nour', 'Seif',
  'Aya', 'Mariem', 'Sarra', 'Ines', 'Asma', 'Fatma', 'Lina', 'Rim'
];

const lastNames = [
  'BenAli', 'Trabelsi', 'Mejri', 'Haddad', 'Chaabane',
  'Gharbi', 'Mansouri', 'Bouzid', 'Ayadi', 'Hamdi',
  'Jaziri', 'Ferjani'
];

const randomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const generateStudentId = () => {
  const year = Math.floor(Math.random() * (2024 - 2018 + 1)) + 2018;
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${year}${number}`;
};

/* =======================
   Generate 100 Users
======================= */
const generateUsers = async () => {
  const users = [];

  // Fetch real universities with ObjectIds
  const universityDocs = await University.find();

  for (let i = 0; i < 200; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const university = randomItem(universityDocs);

    users.push({
      studentId: generateStudentId(),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${university.emailDomain}`,
      password: 'user12345', // >= 8 chars
      role: 'user',
      phone: `2${Math.floor(1000000 + Math.random() * 9000000)}`,
      university: university._id, // ✅ ObjectId
      isVerified: true
    });
  }

  await User.insertMany(users);
  console.log('✅ 100 Random Users Created');
};

/* =======================
   Import Data
======================= */
const importData = async () => {
  try {
    await University.deleteMany();
    await User.deleteMany({ role: 'user' });

    await University.insertMany(universities);
    console.log('✅ Universities Imported');

    // Create Admin User
    const adminExists = await User.findOne({ email: 'admin@nafsiya.tn' });

    if (!adminExists) {
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@nafsiya.tn',
        password: 'admin12345',
        role: 'admin',
        phone: '00000000',
        isVerified: true
      });
      console.log('✅ Admin User Created');
    }

    await generateUsers();

    console.log('🔥 Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();

