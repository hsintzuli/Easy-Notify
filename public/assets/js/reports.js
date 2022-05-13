$(document).ready(function () {
  $('.nav-sidebar a').removeClass('active');
  $('#reporting-nav').addClass('active');
  let start = moment().subtract(1, 'months');
  let end = moment();
  let app_id = $('#app-select').children(':selected').attr('data-id');
  if (!app_id) {
    return Swal.fire({
      title: 'Not yet have an App',
      text: 'Create an App now',
      icon: 'info',
      confirmButtonText: 'OK',
      width: '450px',
    }).then(function () {
      window.location = `/management/create/app`;
    });
  }

  $('#reportrange').daterangepicker(
    {
      startDate: start,
      endDate: end,
      maxDate: end,
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'This Year': [moment().subtract(1, 'year').startOf('year'), moment().endOf('year')],
      },
    },
    cb
  );
  function cb(start, end) {
    $('#reportrange span').html(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
  }
  cb(start, end);

  let table = $('#report-table').DataTable({
    responsive: true,
    processing: true,
    language: {
      processing: '<img src="/assets/img/loading.gif" alt="Processing"/>',
      emptyTable: 'No data available. Create a notification now.',
    },
    serverSide: false,
    rowId: 'id',
    ajax: {
      url: `/api/1.0/notifications?app_id=${app_id}&start_date=${start}&end_date=${end}`,
      type: 'GET',
      dataType: 'json',
      complete: function (data) {
        console.log(data);
      },
      error: function (error) {
        console.log(error);
        alert(JSON.stringify(error));
      },
    },
    columns: [
      { data: 'channel' },
      { data: 'name' },
      {
        data: 'status',
        render: function (data, type, row, meta) {
          let status;
          switch (data) {
            case 3:
              status = 'Finished';
              break;
            case 2:
              status = 'Delivering';
              break;
            case 1:
            case 0:
              status = 'Waiting';
              break;
            default:
              status = data;
          }
          return status;
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          let date = '';
          if (row['scheduled_dt'] === null) {
            date = row['created_dt'];
          } else {
            date = row['scheduled_dt'];
          }
          return moment(date).format('YYYY-MM-DD HH:mm');
        },
      },
      { data: 'type' },
      {
        data: 'created_dt',
        render: function (data, type, row, meta) {
          return moment(data).format('YYYY-MM-DD HH:mm');
        },
      },
    ],
  });

  $('#reload-data').click(() => {
    let dates = $('#reportrange span').text();
    [star, end] = dates.split(' - ');
    start = new Date(start);
    end = new Date(end);
    app_id = $('#app-select').children(':selected').attr('data-id');
    table.ajax.url(`/api/1.0/notifications?app_id=${app_id}&start_date=${start}&end_date=${end}`).load();
  });

  $('#report-table').on('click', 'tbody td', function () {
    if (table.rows().count() === 0) {
      return;
    }
    let id = table.row(this).id();
    window.location.href = `/management/reports/notifications?id=${id}`;
  });
});
