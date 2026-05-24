const pool = require("../db")

exports.getRequests = async (req, res) => {
    try {
        const result = await pool.query("SELECT request_id, user_id, status_id, type_id, description, priority, created_at, completed_at, ARRAY[ST_Y(location), ST_X(location)] AS coords, district, address FROM help_requests");
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { user_id, status_id, type_id, description, priority, location, address, district } = req.body;
        const lon = location[0];
        const lat = location[1];

        const result = await pool.query(
            `INSERT INTO help_requests (user_id, status_id, type_id, description, priority, location, district, address) VALUES ($1, $2, $3, $4, $5, (ST_SetSRID(ST_MakePoint($6, $7), 4326)), $8, $9) RETURNING *`,
            [user_id, status_id, type_id, description, priority, lat, lon, district, address]
        );

        return res.status(201).json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.acceptRequest = async (req, res) => {
    try {
        const request_id = req.params.id;
        const result = await pool.query(
            `UPDATE help_requests SET status_id = 2 WHERE request_id = $1 RETURNING *`,
            [request_id]
        );
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


exports.completeRequest = async (req, res) => {
    try {
        const request_id = req.params.id;
        const result = await pool.query(
            `UPDATE help_requests SET status_id = 3 WHERE request_id = $1 RETURNING *`,
            [request_id]
        );
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
