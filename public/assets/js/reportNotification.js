const LABEL_SIZE = 14;
Chart.pluginService.register({
  beforeDraw: function (chart) {
    let width = chart.chart.width;
    let height = chart.chart.height;
    let ctx = chart.chart.ctx;
    ctx.restore();
    let fontSize = (height / 114).toFixed(2);
    ctx.font = fontSize + 'em sans-serif';
    ctx.textBaseline = 'middle';
    var text = chart.config.options.elements.center.text,
      textX = Math.round((width - ctx.measureText(text).width) / 2),
      textY = height / 2 + LABEL_SIZE;
    ctx.fillText(text, textX, textY);
    ctx.save();
  },
});

// chart1
var data1 = {
  labels: ['Delivered', 'Target Clients'],
  datasets: [
    {
      data: [],
      backgroundColor: ['RGB(255, 201, 82, 0.8)'],
    },
  ],
};
let sentChart = new Chart(document.getElementById('deliveryRate'), {
  type: 'doughnut',
  data: data1,
  options: {
    elements: {
      center: {
        text: '75%', //set as you wish
      },
    },
    cutoutPercentage: 75,
    legend: {
      display: true,
      labels: {
        fontSize: LABEL_SIZE,
      },
    },
  },
});

// chart2
var data2 = {
  labels: ['Acked', 'Delivered'],
  datasets: [
    {
      data: [],
      backgroundColor: ['RGB(165, 188, 130)'],
    },
  ],
};
let deliveredChart = new Chart(document.getElementById('receivedRate'), {
  type: 'doughnut',
  data: data2,
  options: {
    elements: {
      center: {
        text: '75%',
      },
    },
    cutoutPercentage: 75,
    legend: {
      display: true,
      labels: {
        fontSize: LABEL_SIZE,
      },
    },
  },
});

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
let notification;
function loadPage() {
  console.log('Get API: ', `/api/1.0/notifications?id=${notification_id}`);
  axios
    .get(`/api/1.0/notifications?id=${notification_id}`)
    .then((res) => {
      notification = res.data.data;
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
  $('#input-icon').val(notification.content.icon);
  $('#input-config').val(notification.content.config);
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
      notification = res.data.data;
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
  $('.form-input').prop('disabled', statusObj.edit_disabled);
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
  $('.nav-sidebar a').removeClass('active');
  $('#reporting-nav').addClass('active');
});

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

function onPut(event) {
  event.preventDefault();

  let data = new FormData(event.target);
  console.log('sendTime', data.get('sendTime'));
  const time = new Date(data.get('sendTime'));
  const sendTimeOpt = data.get('sendTimeOpt');
  axios
    .put(`/api/1.0/notifications?id=${notification_id}`, {
      channel_id: notification.channel_id,
      name: $('#notification-name').text(),
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

function pushSuccess(notification_id) {
  Swal.fire({
    icon: 'success',
    title: 'Update successfully',
    text: 'Check the new notification.',
    showCancelButton: true,
  }).then(function () {
    window.location = `/management/reports/notifications?id=${notification_id}`;
  });
}
function pushFail() {
  Swal.fire({
    icon: 'error',
    title: 'Update failed',
  });
}

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
    console.log(error);
  }
});

function onDelete(event) {
  event.preventDefault();
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`/api/1.0/notifications?id=${notification_id}`)
        .then((res) => {
          window.location = '/management/reports';
        })
        .catch((error) => {
          Swal.fire('Delete fail', error.error, 'error');
        });
    }
  });
}

// document.querySelector('#notification-form').addEventListener('submit', onSubmmit);
$('#update-btn').on('click', onUpdate);
$('#myform').on('submit', onPut);
$('#delete-btn').on('click', onDelete);
