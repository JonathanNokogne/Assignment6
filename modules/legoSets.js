const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING
}, {
  timestamps: false
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING
}, {
  timestamps: false
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return sequelize.sync();
}

function getAllSets() {
  return Set.findAll({ include: [Theme] });
}

function getSetByNum(setNum) {
  return Set.findAll({
    include: [Theme],
    where: { set_num: setNum }
  }).then(sets => {
    if (sets.length > 0) return sets[0];
    else throw new Error('Unable to find requested set');
  });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }
  }).then(sets => {
    if (sets.length > 0) return sets;
    else throw new Error('Unable to find requested sets');
  });
}

function addSet(setData) {
  return Set.create(setData).catch(err => {
    throw new Error(err.errors[0].message);
  });
}

function getAllThemes() {
  return Theme.findAll();
}

function editSet(set_num, setData) {
  return Set.update(setData, { where: { set_num } }).catch(err => {
    throw new Error(err.errors[0].message);
  });
}

function deleteSet(set_num) {
  return Set.destroy({ where: { set_num } }).catch(err => {
    throw new Error(err.errors[0].message);
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
