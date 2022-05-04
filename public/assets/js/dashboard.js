function loadData(start_date, end_date, chart) {
  axios
    .post('/api/1.0/user/subscriptions', { start_date, end_date })
    .then((res) => {
      let label, data;
      console.log('Received sunscriptions', res);
      label = res.data.data.map((element) => element.dates);
      data = res.data.data.map((element) => element.subscription);
      console.log(label, data);
      chart.config.data.labels = label;
      chart.config.data.datasets[0].data = data;
      chart.update();
    })
    .catch((err) => {
      console.log(err);
    });
}
$(function () {
  $('.nav-sidebar a').removeClass('active');
  $('#dashboard-nav').addClass('active');
  let start = moment().subtract(7, 'days');
  let end = moment();

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
    $('#reportrange span').trigger('change');
  }

  const areaChartCanvas = $('#userChart').get(0).getContext('2d');
  const areaChartData = {
    labels: [],
    datasets: [
      {
        label: 'Digital Goods',
        backgroundColor: 'rgba(60,141,188,0.9)',
        borderColor: 'rgba(60,141,188,0.8)',
        pointRadius: false,
        pointColor: '#3b8bba',
        pointStrokeColor: 'rgba(60,141,188,1)',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(60,141,188,1)',
        data: '',
      },
    ],
  };

  var areaChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      x: {
        type: 'time',
      },
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: true,
          },
        },
      ],
    },
  };
  // This will get the first returned node in the jQuery collection.
  const mychart = new Chart(areaChartCanvas, {
    type: 'line',
    data: areaChartData,
    options: areaChartOptions,
  });

  cb(start, end);
  loadData(start, end, mychart);

  $('#reportrange span').change(() => {
    let dates = $('#reportrange span').text();
    let [start_date, end_date] = dates.split(' - ');
    start_date = new Date(start_date);
    end_date = new Date(end_date);
    loadData(start_date, end_date, mychart);
  });
});
