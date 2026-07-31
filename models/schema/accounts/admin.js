import { Sequelize, sequelize } from "../../index.js";

const AdminAccount = sequelize.define("admin_accounts", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  first_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  last_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

export default AdminAccount;
