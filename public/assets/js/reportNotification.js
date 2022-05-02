let searchParams = new URLSearchParams(window.location.search);
const notification_id = searchParams.get('id');
const status = 0;
const statusMap = {
  0: {
    bg: 'badge-info',
    bgString: 'Waiting',
    edit_disabled: false,
    update_disabled: true,
  },
  1: {
    bg: 'badge-info',
    bgString: 'Waiting',
    edit_disabled: false,
    update_disabled: true,
  },
  2: {
    bg: 'badge-waring',
    bgString: 'delivering',
    edit_disabled: true,
    update_disabled: false,
  },
  3: {
    bg: 'badge-success',
    bgString: 'Finished',
    edit_disabled: true,
    update_disabled: false,
  },
};

function loadPage() {
  console.log('Get API: ', `/api/1.0/notifications?id=${notification_id}`);
  axios
    .get(`/management/notifications?id=${notification_id}`)
    .then((res) => {
      let notification = res.data.data;
      updateForm(notification);
      updateStatus(notification.status);
      updateChart(notification);
      $('#report-card').show();
    })
    .catch((err) => {
      console.log(err);
      alert(err);
      window.location.href = '/management/reports';
    });
}

function updateForm(notification) {
  console.log('Update Form', notification);
  $('#notification-name').text(notification.name);
  $('#input-title').val(notification.content.title);
  $('#input-body').val(notification.content.body);
  $('#' + notification.type).prop('selected', true);
  // $('#icon').attr('src', notification.content.config.icon);
  if (notification.scheduled_dt) {
    $('#send-scheduled').prop('selected', true);
    $('#datetimepicker1').data('datetimepicker').date(new Date(notification.scheduled_dt));
  } else {
    $('#send-realtime').prop('selected', true);
    $('#datetimepicker1').data('datetimepicker').date(new Date(notification.created_dt));
  }
}

function onUpdate() {
  axios
    .get(`/api/1.0/notifications?id=${notification_id}`)
    .then((res) => {
      let notification = res.data.data;
      updateChart(notification);
    })
    .catch((err) => {
      console.log(err);
    });
}

function updateStatus(status) {
  const statusObj = statusMap[status];
  $('#status-badge').addClass(statusObj.bg);
  $('#status-badge h6').text(statusObj.bgString);
  $('#edit-btn').prop('disabled', statusObj.edit_disabled);
  $('#update-btn').prop('disabled', statusObj.update_disabled);
}

function updateChart(notification) {
  if (notification.status <= 1) {
    $('#result').hide();
    return;
  }
  console.log('Update Chart', notification);
  $('#updateTime').text('Update Time: ' + moment(notification.updated_dt).format('YYYY-MM-D HH:mm:ss'));
  console.log('targets_num', notification.targets_num);
  console.log('sents_num', notification.sent_num);
  console.log('received_num', notification.received_num);
  console.log(moment(notification.updated_dt).format('YYYY-MM-D HH:mm:ss'));
  sentChart.data.datasets[0].data[0] = notification.sent_num;
  sentChart.data.datasets[0].data[1] = notification.targets_num - notification.sent_num || 0;
  deliveredChart.data.datasets[0].data[0] = notification.received_num;
  deliveredChart.data.datasets[0].data[1] = notification.sent_num - notification.received_num || 0;
  sentChart.options.elements.center.text = Math.floor((notification.sent_num / notification.targets_num) * 100) + '%';
  deliveredChart.options.elements.center.text = Math.floor((notification.received_num / notification.sent_num) * 100) + '%';

  sentChart.update();
  deliveredChart.update();
  $('#result').show();
}
$(document).ready(function () {
  $('#datetimepicker1').datetimepicker({ format: 'YYYY-MM-D HH:mm' });
  loadPage();
});

// document.querySelector('#notification-form').addEventListener('submit', onSubmmit);
$('#update-btn').on('click', onUpdate);
