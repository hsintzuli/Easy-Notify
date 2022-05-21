require('dotenv').config();
const webpush = require('web-push');
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const { pool } = require('./mysqlcon');

const createChannel = async (app_id, name) => {
  const id = nanoid();
  const pushKey = webpush.generateVAPIDKeys();
  const apiKey = uuidv4();

  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const channel = {
      id: id,
      app_id: app_id,
      name: name,
      public_key: pushKey.publicKey,
      private_key: pushKey.privateKey,
    };

    await pool.query('INSERT INTO channels SET ?', channel);

    const channelKey = {
      channel_key: apiKey,
      channel_id: id,
    };

    await pool.query('INSERT INTO channel_keys SET ?', channelKey);
    console.log('COMMIT');
    await conn.query('COMMIT');
    return { channel };
  } catch (error) {
    console.error('[createChannel] error', error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

const deleteChannel = async (channel_id) => {
  const [results] = await pool.query('UPDATE channels SET deleted_dt = NOW() WHERE id = ?', channel_id);
  return results.affectedRows > 0;
};

const verifyChannelWithUser = async (user_id, channel_id) => {
  console.log(user_id, channel_id);
  const [results] = await pool.query(
    'SELECT apps.user_id AS user_id FROM channels INNER JOIN apps ON channels.app_id = apps.id AND apps.user_id = ? WHERE channels.id = ? and channels.deleted_dt IS NULL',
    [user_id, channel_id]
  );
  return results.length > 0;
};

const getChannelDetail = async (channel_id) => {
  const [results] = await pool.query(
    `SELECT c.id, c.app_id, c.public_key, c.private_key, 
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
    `SELECT c.id, c.name, a.id AS app_id, a.name AS app_name, a.default_icon AS icon FROM notify.channels AS c INNER JOIN notify.apps AS a on c.app_id = a.id  AND a.archived_dt is NULL WHERE a.user_id = ? AND c.deleted_dt iS NULL `,
    user_id
  );
  return results;
};

const getChannelKey = async (channel_key) => {
  const [results] = await pool.query(`SELECT * FROM channel_keys WHERE channel_key = ?`, [channel_key]);
  return results[0];
};

const getChannelsKeys = async (channel_ids) => {
  const [results] = await pool.query(`SELECT * FROM channel_keys WHERE channel_id in (?) ORDER BY  created_dt DESC`, [channel_ids]);
  return results;
};

const getChannelsWithKeys = async (app_id) => {
  let channels = await getChannels(app_id);
  channels = channels.reduce((prev, curr) => {
    prev[curr.id] = curr;
    return prev;
  }, {});
  const keys = await getChannelsKeys(Object.keys(channels));
  console.log('keys', keys);
  keys.forEach((key) => {
    channels[key.channel_id]['keys'] = channels[key.channel_id]['keys'] || [];
    channels[key.channel_id]['keys'].push(key);
  });
  return channels;
};

const rotateChannelKey = async (channel_key, key_expire_dt) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [channelKeys] = await conn.query('SELECT * FROM channel_keys WHERE channel_key = ?  FOR UPDATE', [channel_key]);
    const channelKey = channelKeys[0];

    if (!channelKey) {
      console.log('no channel key');
      await conn.query('ROLLBACK');
      return { error: 'Incorrect channel key' };
    }

    if (channelKey.key_expire_dt) {
      await conn.query('ROLLBACK');
      return { error: 'The channel key can not be update' };
    }

    await conn.query('UPDATE channel_keys SET key_expire_dt = ? WHERE channel_key = ?', [key_expire_dt, channel_key]);
    const newKey = {
      channel_key: uuidv4(),
      channel_id: channelKey.channel_id,
    };
    await conn.query('INSERT INTO channel_keys SET ?', newKey);
    console.log('COMMIT');
    await conn.query('COMMIT');
    return { newKey };
  } catch (error) {
    console.log('[rotateChannelKey] error', error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

const deleteChannelKey = async (channel_key) => {
  const [channelKeys] = await pool.query('SELECT * FROM channel_keys WHERE channel_key = ?', [channel_key]);
  const channelKey = channelKeys[0];
  if (!channelKey) {
    return { error: 'Wrong channel key' };
  }
  if (!channelKey.key_expire_dt) {
    return { error: 'The channel key can not be delete' };
  }
  const [results] = await pool.query('DELETE FROM channel_keys WHERE channel_key = ?', channel_key);
  return results.affectedRows > 0;
};

module.exports = {
  createChannel,
  deleteChannel,
  getChannelDetail,
  verifyChannelWithUser,
  getChannelById,
  getChannels,
  getChannelsByUser,
  getChannelKey,
  getChannelsWithKeys,
  rotateChannelKey,
  deleteChannelKey,
};
