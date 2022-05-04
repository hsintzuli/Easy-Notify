function onSubmmit(event) {
  event.preventDefault();
  let data = new FormData(event.target);
  axios
    .post('/api/1.0/apps', {
      name: data.get('name'),
      description: data.get('description'),
      contact_email: data.get('email'),
      default_icon: data.get('icon'),
    })
    .then((res) => {
      console.log(res.data);
      // window.location.href = '/management/apps';
    })
    .catch((err) => {
      console.log(err);
    });
}

function previewIcon(event) {
  event.preventDefault();
  $('#showIcon').attr('src', $('#input-icon').val());
}

// document.querySelector('#notification-form').addEventListener('submit', onSubmmit);
$('#app-form').on('submit', onSubmmit);
$('#previewIcon').on('click', previewIcon);
$('#create-channel').on('click', previewIcon);
