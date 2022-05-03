let selectedApp;

function changeApp() {
  const app = $('#app-select').val();
  $('#channel-select').empty();
  selectedApp = channelGroupByApp[app];
  const channels = selectedApp['channels'];
  console.log(channels);
  channels.forEach((element) => {
    $('#channel-select').append(
      $('<option/>') //add option tag in select
        .val(element) //set value for option to post it
        .text(element)
    );
  });
  $('.selectpicker').selectpicker('refresh');
}
changeApp();
function onSubmmit(event) {
  event.preventDefault();

  let data = new FormData(event.target);
  const channel_id = data.get('channel').split(']-').pop();
  console.log('channel_id', channel_id);
  console.log('sendTime', data.get('sendTime'));
  const time = new Date(data.get('sendTime'));
  console.log('sendTime', time);

  const sendTimeOpt = data.get('sendTimeOpt');
  axios
    .post(`/management/notifications/${sendTimeOpt}`, {
      channel_id: channel_id,
      name: data.get('name'),
      title: data.get('title'),
      body: data.get('body'),
      sendType: data.get('sendType'),
      sendTime: time,
      icon: data.get('icon'),
      config: data.get('config'),
    })
    .then((res) => {
      console.log(res.data);
      pushSuccess(res.data.data.id);
    })
    .catch((err) => {
      console.log(err);
      pushFail();
    });
}

// document.querySelector('#notification-form').addEventListener('submit', onSubmmit);
$('#notification-form').on('submit', onSubmmit);

$('#json-btn').click((event) => {
  event.preventDefault();
  let text = $('#input-config').val();
  let textedJson;
  try {
    text = JSON.parse($('#input-config').val());
    console.log(text);
    textedJson = JSON.stringify(text, undefined, 2);
    $('#input-config').val(textedJson);
  } catch (error) {
    alert('Invalid JSON Format');
  }
});

$('#icon-btn').click((event) => {
  event.preventDefault();
  let default_icon = selectedApp.icon;
  $('#input-icon').val(default_icon);
});

$('#send-realtime').on('checked', function () {
  alert(this.value);
});

$('.form-check-inline').change(function () {
  let text = jQuery(this).children('input').val();
  if (text === 'realtime') {
    $('.datetimepicker-input').prop('disabled', true);
  } else {
    $('.datetimepicker-input').prop('disabled', false);
  }
});
