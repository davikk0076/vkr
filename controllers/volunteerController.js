const pool = require('../db');

exports.createVolunteer = async (req, res) => {
    const { user_id, is_available, location } = req.body;
    const lon = location[0];
    const lat = location[1];
    try {
        const result = await pool.query(
            'INSERT INTO volunteers (user_id, is_available, location) VALUES ($1, $2, (ST_SetSRID(ST_MakePoint($3, $4), 4326))) RETURNING *',
            [user_id, is_available, lat, lon]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating volunteer:', error);
        res.status(500).json({ error: 'Failed to create volunteer' });
    }
};

exports.getLocation = async (req, res) => {
    const user_id = req.params.id;
    try {
        const result = await pool.query(
            'SELECT ST_X(location) AS lon, ST_Y(location) AS lat FROM volunteers WHERE user_id = $1',
            [user_id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching volunteer location:', error);
        res.status(500).json({ error: 'Failed to fetch volunteer location' });
    }
};
