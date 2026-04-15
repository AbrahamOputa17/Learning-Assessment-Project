const { query } = require('../config/database');

const UserModel = {
  /**
   * Find a user by ID (excludes password).
   */
  async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, avatar, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by email (includes password for auth).
   */
  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ name, email, password, role = 'student' }) {
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, avatar, created_at, updated_at`,
      [name, email, password, role]
    );
    return result.rows[0];
  },

  /**
   * Update a user's profile.
   */
  async update(id, fields) {
    const allowed = ['name', 'avatar'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, avatar, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  /**
   * Update password.
   */
  async updatePassword(id, hashedPassword) {
    await query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      id,
    ]);
  },
};

module.exports = UserModel;
