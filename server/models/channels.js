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

  const [result] = await pool.query('INSERT INTO channels SET ?', channel);
  return channel;
};

const updateChannelKey = async (channel_id, key_expire_dt) => {
  const id = nanoid();
  const pushKey = webpush.generateVAPIDKeys();
  const channelKey = uuidv4();
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [channels] = await conn.query('SELECT id, app_id, name, description, public_key, private_key FROM channels WHERE id = ?', channel_id);
    const channel = channels[0];
    if (!channel) {
      await conn.query('ROLLBACK');
      return { error: 'Incorrect channel id' };
    }

    await conn.query('UPDATE channels SET key_expire_dt = ? WHERE id = ?', [key_expire_dt, channel.id]);
    channel.id = id;
    channel.channel_key = channelKey;
    channel.public_key = pushKey.publicKey;
    channel.private_key = pushKey.privateKey;
    await conn.query('INSERT INTO channels SET ?', channel);
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
  const [results] = await pool.query('DELETE FROM channels WHERE id = ?', channel_id);
  const deleted = results.affectedRows > 0;
  return deleted;
};

const verifyChannelWithUser = async (user_id, channel_id) => {
  console.log(user_id, channel_id);
  const [results] = await pool.query(
    'SELECT apps.user_id AS user_id FROM channels LEFT JOIN apps ON channels.app_id = apps.id WHERE channels.id = ? and apps.user_id = ?',
    [channel_id, user_id]
  );
  const verified = results.length > 0;
  return verified;
};

const getChannelDetail = async (channel_id) => {
  const [results] = await pool.query(
    `SELECT c.id, c.app_id, c.channel_key, c.public_key, c.private_key, 
    apps.name AS app_name, apps.default_icon AS icon, apps.contact_email AS email 
    FROM channels AS c LEFT JOIN apps ON c.app_id = apps.id WHERE c.id = ?`,
    channel_id
  );
  return results[0];
};

const getChannelById = async (channel_id) => {
  const [results] = await pool.query(`SELECT * FROM channels WHERE id = ?`, channel_id);
  return results[0];
};

module.exports = {
  createChannel,
  deleteChannel,
  updateChannelKey,
  getChannelDetail,
  verifyChannelWithUser,
  getChannelById,
};
