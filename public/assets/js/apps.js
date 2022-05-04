let focusAppId = '';
function clickArchive(event) {
  event.preventDefault();
  focusAppId = $(event.target).parents('td').children('.id').text();
  console.log(focusAppId);
}

function archiveApp(event) {
  event.preventDefault();
  console.log(focusAppId);
  axios
    .delete(`/api/1.0/apps?app_id=${focusAppId}`)
    .then((res) => {
      console.log(res);
      window.location.href = `/management/apps`;
    })
    .catch((err) => {
      console.log(err);
    });
}
$('.btn-archive').on('click', clickArchive);
$('#archive').on('click', archiveApp);
$(document).ready(function () {
  $('.nav-sidebar a').removeClass('active');
  $('#sending-li').addClass('menu-open');
  $('#sending-nav').addClass('active');
  $('#app-nav').addClass('active');
});
