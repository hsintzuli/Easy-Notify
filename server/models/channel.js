require('dotenv').config();
const webpush = require('web-push');
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const { pool } = require('./mysqlcon');

const createChannel = async (app_id, name, description) => {
  const id = nanoid();
  const pushKey = webpush.generateVAPIDKeys();
  const channelKey = uuidv4();

  const channel = {
    id: id,
    app_id: app_id,
    name: name,
    description: description,
    channel_key: channelKey,
    public_key: pushKey.publicKey,
    private_key: pushKey.privateKey,
  };

  const [result] = await pool.query('INSERT INTO channel SET ?', channel);
  return channel;
};

const updateChannelKey = async (channel_id, key_expire_dt) => {
  const id = nanoid();
  const pushKey = webpush.generateVAPIDKeys();
  const channelKey = uuidv4();
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [channels] = await conn.query('SELECT id, app_id, name, description, public_key, private_key FROM channel WHERE id = ?', channel_id);
    const channel = channels[0];
    if (!channel) {
      await conn.query('ROLLBACK');
      return { error: 'Incorrect channel id' };
    }

    await conn.query('UPDATE channel SET key_expire_dt = ? WHERE id = ?', [key_expire_dt, channel.id]);
    channel.id = id;
    channel.channel_key = channelKey;
    channel.public_key = pushKey.publicKey;
    channel.private_key = pushKey.privateKey;
    await conn.query('INSERT INTO channel SET ?', channel);

    await conn.query('COMMIT');
    return channel;
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

const deleteChannel = async (channel_id) => {
  await pool.query('DELETE FROM channel WHERE id = ?', channel_id);
  return true;
};

const verifyChannelWithUser = async (user_id, channel_id) => {
  console.log(user_id, channel_id);
  const [results] = await pool.query(
    'SELECT app.user_id AS user_id FROM channel LEFT JOIN app ON channel.app_id = app.id WHERE channel.id = ? and app.user_id = ?',
    [channel_id, user_id]
  );
  console.log(results);
  const verified = results.length > 0;
  return verified;
};

const getChannelById = async (channel_id) => {
  const [results] = await pool.query(
    `SELECT c.id, c.app_id, c.channel_key, c.public_key, c.private_key, 
    app.name AS app_name, app.default_icon AS icon, app.contact_email AS email 
    FROM channel AS c LEFT JOIN app ON c.app_id = app.id WHERE c.id = ?`,
    channel_id
  );
  return results[0];
};

module.exports = {
  createChannel,
  deleteChannel,
  updateChannelKey,
  getChannelById,
  verifyChannelWithUser,
};
