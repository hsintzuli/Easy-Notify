const SUBSCRIPTION_QUANTITY = 20;
const START_DATE = new Date(2021, 5, 6);
const END_DATE = new Date(2022, 4, 15);
const { nanoid } = require('nanoid');

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const fake_keys = [
  { p256dh: 'BC70lzkj8J4PJDZka1qCGUuegfbtJKK23FsFa2j4_4-2TFD8qDlR1Q3ZZR0UmygBoZUgoU8elqe2-Aq8AQx6fPM', auth: 'MJzYsRV8wGc_-GcpIQrajQ' },
  { p256dh: 'BCemoNbCjHdqcFdWz_aUOZTsGpNilxWI9EKyYeGLNrnYjFvNPGwGefvyjcgkZoNnoKi1EhCeAm0v-6sQ2Ihq_IY', auth: '-4Pnzg1PDzmQR2RKsiWfKA' },
  { p256dh: 'BHBhE36qifHgXiP2mkXraktUP1qianypvsBN80ItpkW2LjblaqKujGQO8M_oHM8jIg-bp5D-gFiI0Fb-gtrUEa4', auth: 'EPiixMzE0jRQlROm-JkfHA' },
  { p256dh: 'BLyv8_fgRgKo8uTpD3n0ggwhQJslHivIq8XTsqUFTruJoaqOR1-Jff9_0zjyqDlK4bRMgf77aVpvjYd-jDIpgSY', auth: 'k2o0TFBERzMETstxX0na3w' },
  { p256dh: 'BLyv8_fgRgKo8uTpD3n0ggwhQJslHivIq8XTsqUFTruJoaqOR1-Jff9_0zjyqDlK4bRMgf77aVpvjYd-jDIpgSY', auth: 'k2o0TFBERzMETstxX0na3w' },
];
const fake_endpoints = [
  'https://fcm.googleapis.com/fcm/send/cyz9NG-WqkY:APA91bH1eXG8lZwVKTqmrnpwFsXvxNUWjplMCm4O_qDH8K9DDvrq5jsL0jDe3NfEGK4IBIJ0LVD8-8ZRbMbJ5EpXxj8rmEkmiqXUbI0z5fZ3n_Tfjf3PikJ6XzOR8Nmigd6ovzeBoDzJ',
  'https://fcm.googleapis.com/fcm/send/ddgYfwVi4NQ:APA91bGFdCOjE9WNw202o-_AjSql3U21eN35GrRLT8O7QywGssUvayiXSEc9MUHgIGPr95N0YSkwBdqao9-0IyDjlUtNeT7BYG_AKCK2PaHNuKjAy4xTVYEPnRDianSQUUghZetW6kDK',
  'https://wns2-sg2p.notify.windows.com/w/?token=BQYAAAApYEvfXubzarzohXlgoKMqxzFOLo3zJXA%2fkjZpyKqtEPl9nq9R%2fzUz0Oqz1fyB6Ra9LviFfadDvDS6hqetsgcTZbFXe7OiOFt9lbOTtXc1sBWrqkkrmqfyOgne0kocxl0%2fz9Ep%2fXDQBZ6D7xera2hTLoEob7ERX2xoJvBRYMdwtMGBvPpiUCUEzulS%2bkd2Lv5OpBL7dQiD93nLqHAicYfOuCaWag9byKNpVsL7j%2buPrEYDt4GGz7dpG7HWEN2Vztsl%2bjmTw8fFdgz8PgzmkYb1m4gAGDtSjq9qs6kQ7o5IvtTxmUMTFGFDBuFQov%2bOLjMlXV%2b1r%2bmwPq9K6qH3YxD7',
  'https://fcm.googleapis.com/fcm/send/daOQHHC78Ro:APA91bHuaXXHsH47lx_KToZeLTyfm0ChW3kei-tqzR6VbYZK_Gllbg3tPpqOajJIKKwWSaYOmWC41aoAMDCJMZrxVVg5jY-e3eRG8DlpP3L73Y1rQW3Xbn72CjNETSzyWWeMqqjxET17',
  'https://wns2-sg2p.notify.windows.com/w/?token=BQYAAAC8AqUYMNERVlwY4jL%2fcZlOFyTvL8v7WoBP6Wya5kh9ETwJbIhWD3i0zNSpAyr0cJCPNmOniRvc4jC0P0Xgn7L9sGLHc31Idw7x7srn4Cj5tazsHCTrmvWy98g%2fmnz%2fGRxvT0OKPw%2fEd3CBKnPPF6JfqsPXhegmP7XfhPj44xCbi%2fUPfZ%2bhLblXNExANZTYH%2bcSnbA6LEFXxpo%2fBfCtsyvHLbLfT1PEmrmWiZLk8hxNGcZIQTFkyyeXYbFcObdyu%2fOnkRSsQLmVOPjgVjsm%2fiDvDYEDavGyy4mLASlhpgnKNe4mve4nNoO5wmm13EC%2fuXg%3d',
];

const getTotalSubscriptions = () => {
  let totalSubscriptions = [];
  for (let i = 0; i < SUBSCRIPTION_QUANTITY; i++) {
    let date = randomDate(START_DATE, END_DATE);
    let rand_int = getRandomInt(5);
    let id = nanoid();
    let channel_id = 'QKCzVKW68QJ5wKJySIw26';
    // let endpoint = fake_endpoints[rand_int] + i.toString();
    let endpoint = `fake-user-${i}`;
    let keys = JSON.stringify(fake_keys[rand_int]);
    let client_tag = `user${i}`;
    let status = 1;
    let created_dt = date;
    let updated_dt = date;
    totalSubscriptions.push([id, channel_id, endpoint, keys, client_tag, status, created_dt, updated_dt]);
  }

  return totalSubscriptions;
};

module.exports = {
  getTotalSubscriptions,
};
