const LABEL_SIZE = 14;
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

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
  afterDraw: function (chart) {
    if (!chart.data.datasets[0].data || chart.data.datasets[0].data.length === 0) {
      // No data is present
      var ctx = chart.chart.ctx;
      var width = chart.chart.width;
      var height = chart.chart.height;
      chart.clear();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "16px normal 'Helvetica Nueue'";
      ctx.fillText('No data to display.It seems this channel has 0 subscriber', width / 2, height / 2);
      ctx.restore();
    }
  },
});

// chart1
let data1 = {
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
let data2 = {
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
    edit_disabled: true,
    update_disabled: true,
  },
  2: {
    bg: 'badge-warning',
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
  4: {
    bg: 'badge-info',
    bgString: 'Waiting',
    edit_disabled: false,
    update_disabled: true,
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
      updateStatus(notification);
      updateChart(notification);
      $('#report-card').show();
    })
    .catch((err) => {
      alert(err);
      window.location.href = '/management/reports';
    });
}
const diffFromNow = (time) => {
  const targetTime = new Date(time);
  const now = new Date();
  return (targetTime.getTime() - now.getTime()) / 1000;
};

function updateForm(notification) {
  $('#notification-name').text(notification.name);
  $('#input-title').val(notification.content.title);
  $('#input-body').val(notification.content.body);
  $('#input-icon').val(notification.content.icon);
  $('#input-config').val(notification.content.config);
  $('#' + notification.type).prop('selected', true);
  // $('#icon').attr('src', notification.content.config.icon);
  if (notification.scheduled_dt) {
    $('#send-scheduled').prop('checked', true);
    SENDTIME = new Date(notification.scheduled_dt);
    $('#datetimepicker1').data('datetimepicker').date(new Date(notification.scheduled_dt));
  } else {
    $('#send-realtime').prop('checked', true);
    SENDTIME = new Date(notification.created_dt);
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

function updateStatus(notification) {
  let status = notification.status;
  if (status === 1 && diffFromNow(notification.scheduled_dt) > 3 * 60) {
    status = 4;
  }
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
  $('#updateTime').text('Update Time: ' + moment(notification.updated_dt).format('YYYY-MM-D HH:mm:ss'));
  if (notification.targets_num > 0) {
    sentChart.data.datasets[0].data[0] = notification.sent_num;
    sentChart.data.datasets[0].data[1] = notification.targets_num > notification.sent_num ? notification.targets_num - notification.sent_num : 0;
    sentChart.options.elements.center.text = Math.floor((notification.sent_num / notification.targets_num) * 100) + '%';
  }

  if (notification.sent_num > 0) {
    deliveredChart.data.datasets[0].data[0] = notification.received_num;
    deliveredChart.data.datasets[0].data[1] = notification.sent_num > notification.received_num ? notification.sent_num - notification.received_num : 0;
    deliveredChart.options.elements.center.text = Math.floor((notification.received_num / notification.sent_num) * 100) + '%';
  }
  sentChart.update();
  deliveredChart.update();
  $('#result').show();
}
$(document).ready(function () {
  $('.nav-sidebar a').removeClass('active');
  $('#reporting-nav').addClass('active');
  $('#datetimepicker1').datetimepicker({ format: 'YYYY-MM-D HH:mm' });
  loadPage();
});

function onPut(event) {
  event.preventDefault();

  let data = new FormData(event.target);
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
    Toast.fire({
      icon: 'error',
      title: 'Invalid JSON Format',
    });
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
