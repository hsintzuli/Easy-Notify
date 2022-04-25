function changeApp() {
  const app = $('#app-select').val();
  $('#channel-select').empty();
  const channels = channelGroupByApp[app];
  console.log(channels);
  channels.forEach((element) => {
    $('#channel-select').append(
      $('<option/>') //add option tag in select
        .val(element) //set value for option to post it
        .text(element)
    );
  });
}
changeApp();
function onSubmmit(event) {
  event.preventDefault();

  let data = new FormData(event.target);
  const channel_id = data.get('channel').split('::').pop();
  console.log('channel_id', channel_id);
  console.log('sendTime', data.get('sendTime'));
  const time = new Date(data.get('sendTime'));
  console.log('sendTime', time);

  const sendTimeOpt = data.get('sendTimeOpt');
  axios
    .post(`/api/1.0/notifications/${sendTimeOpt}`, {
      channel_id: channel_id,
      name: data.get('name'),
      title: data.get('title'),
      body: data.get('body'),
      sendType: data.get('sendType'),
      sendTime: time,
      config: {
        icon: 'https://media-exp1.licdn.com/dms/image/C560BAQGioWrn1Pib-Q/company-logo_200_200/0/1588649799420?e=2147483647&v=beta&t=s1pR7nw3HwGYnT-cxC74jc3_HdJbK0OyAgHfIEdZzuo',
      },
      clients_tag: [],
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
