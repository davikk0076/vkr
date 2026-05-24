const pool = require("../db")

exports.getStaticData = async (req, res) => {
    try {
        const tableName = req.path.replace("/", "");
        const result = await pool.query(`SELECT * FROM ${tableName}`);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
