const pool = require("../db")
const crypto = require('crypto');

exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.query
    const hash = crypto.createHash('sha256').update(password).digest('base64');
    try {
        const result = await pool.query("SELECT user_id FROM users WHERE email = $1 and pwd = $2", [email, hash]);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.createUser = async (req, res) => {
    const data = req.body;
    if (!data.email || !data.username || !data.password || !data.role_id) {
        return res.status(400).json({ error: "Отсутствуют необходимые поля" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return res.status(400).json({ error: "Некорректный email" });
    }

    try {
        const hash = crypto.createHash('sha256').update(data.password).digest('base64');
        const result = await pool.query("SELECT create_user($1, $2, $3, $4)", [data.email, data.username, hash, data.role_id]);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    if (data.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return res.status(400).json({ error: "Некорректный email" });
        }
        await pool.query('UPDATE users SET email = $1 WHERE user_id = $2', [data.email, id]);
    }
    if (data.username) {
        await pool.query('UPDATE users SET username = $1 WHERE user_id = $2', [data.username, id]);
    }
    if (data.pwd) {
        const hash = crypto.createHash('sha256').update(data.pwd).digest('base64');
        await pool.query('UPDATE users SET pwd = $1 WHERE user_id = $2', [hash, id]);
    }
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
