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
    const [channels] = await conn.query('SELECT id, app_id, name, public_key, private_key FROM channels WHERE id = ? AND deleted_dt IS NULL', channel_id);
    const channel = channels[0];
    if (!channel) {
      console.log('no channel');
      await conn.query('ROLLBACK');
      return { error: 'Incorrect channel id' };
    }

    await conn.query('UPDATE channels SET key_expire_dt = ? WHERE id = ?', [key_expire_dt, channel.id]);
    channel.id = id;
    channel.channel_key = channelKey;
    channel.public_key = pushKey.publicKey;
    channel.private_key = pushKey.privateKey;
    await conn.query('INSERT INTO channels SET ?', channel);
    console.log('COMMIT');
    await conn.query('COMMIT');
    return channel;
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

const deleteChannel = async (channel_id) => {
  const [results] = await pool.query('UPDATE channels SET deleted_dt = NOW() WHERE id = ?', channel_id);
  const deleted = results.affectedRows > 0;
  return deleted;
};

const verifyChannelWithUser = async (user_id, channel_id) => {
  console.log(user_id, channel_id);
  const [results] = await pool.query(
    'SELECT apps.user_id AS user_id FROM channels INNER JOIN apps ON channels.app_id = apps.id AND apps.user_id = ? WHERE channels.id = ? and channels.deleted_dt IS NULL',
    [user_id, channel_id]
  );
  const verified = results.length > 0;
  return verified;
};

const getChannelDetail = async (channel_id) => {
  const [results] = await pool.query(
    `SELECT c.id, c.app_id, c.channel_key, c.public_key, c.private_key, 
    apps.name AS app_name, apps.default_icon AS icon, apps.contact_email AS email 
    FROM channels AS c INNER JOIN apps ON c.app_id = apps.id WHERE c.id = ? AND c.deleted_dt IS NULL`,
    channel_id
  );
  return results[0];
};

const getChannelById = async (channel_id) => {
  const [results] = await pool.query(`SELECT * FROM channels WHERE id = ? AND deleted_dt IS NULL`, channel_id);
  return results[0];
};

const getChannels = async (app_id) => {
  const [results] = await pool.query(`SELECT * FROM channels WHERE app_id = ? AND deleted_dt is NULL ORDER BY created_dt DESC`, app_id);
  return results;
};

const getChannelsByUser = async (user_id) => {
  const [results] = await pool.query(
    `SELECT c.id, c.name, a.id AS app_id, a.name AS app_name, a.default_icon AS icon FROM notify.channels AS c INNER JOIN notify.apps AS a on c.app_id = a.id  WHERE a.user_id = ? AND c.deleted_dt iS NULL `,
    user_id
  );
  return results;
};

module.exports = {
  createChannel,
  deleteChannel,
  updateChannelKey,
  getChannelDetail,
  verifyChannelWithUser,
  getChannelById,
  getChannels,
  getChannelsByUser,
};
