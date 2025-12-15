import { sequelize } from "../../src/db/connectDB.js";

const getSchema = async (req, res) => {
  const [schema] = await sequelize.query(`
    SELECT 
    'Table Name: ' || table_name || ', Column Names with data types: ' || 
    STRING_AGG(column_name || ' - ' || data_type, ', ') AS schema_info
    FROM information_schema.columns 
    WHERE table_name = 'Halal Food Thailand'
    GROUP BY table_name;
  `);
  res.status(201).json({ schema: schema });
};

export default getSchema;
