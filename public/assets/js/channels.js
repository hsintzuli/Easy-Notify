let searchParams = new URLSearchParams(window.location.search);
const app_id = searchParams.get('app_id');

function copyToClipboard(element) {
  var $temp = $('<input>');
  $('body').append($temp);
  $temp.val($(element).text()).select();
  document.execCommand('copy');
  $temp.remove();
}

function channelUpdate(event) {
  event.preventDefault();
  console.log($(event.target).parents('tr').children('.id').text());
  const channelID = $(event.target).parents('tr').children('.id').text();
  axios
    .put(`/api/1.0/apps/channels?channel_id=${channelID}`)
    .then((res) => {
      console.log(res);
      window.location.href = `/management/channels?app_id=${app_id}`;
    })
    .catch((err) => {
      console.log(err);
    });
}

let focusChannelId = '';
function clickDelete(event) {
  event.preventDefault();
  console.log($(event.target).parents('tr').children('.id').text());
  focusChannelId = $(event.target).parents('tr').children('.id').text();
  console.log(focusChannelId);
}

function deleteChannel(event) {
  event.preventDefault();
  console.log(focusChannelId);
  axios
    .delete(`/api/1.0/apps/channels?channel_id=${focusChannelId}`)
    .then((res) => {
      console.log(res);
      window.location.href = `/management/channels?app_id=${app_id}`;
    })
    .catch((err) => {
      console.log(err);
    });
}

function channelCreate(event) {
  event.preventDefault();
  const name = $('#channel-name').val();
  axios
    .post(`/api/1.0/apps/channels`, {
      app_id: app_id,
      name: name,
    })
    .then((res) => {
      console.log(res);
      window.location.href = `/management/channels?app_id=${app_id}`;
    })
    .catch((err) => {
      console.log(err);
    });
}

$('.btn-update').on('click', channelUpdate);
$('.btn-delete').on('click', clickDelete);
$('#delete').on('click', deleteChannel);
$('#btn-create').on('click', channelCreate);
