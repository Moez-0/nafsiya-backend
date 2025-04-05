const mongoose = require('mongoose');
const University = require('./models/University');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to DB
connectDB();

// Import data
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

const importData = async () => {
  try {
    await University.deleteMany();
    await University.insertMany(universities);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();