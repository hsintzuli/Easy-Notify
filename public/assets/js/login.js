$('.error-msg').on('show', function () {
  $('.login-form .btn').prop('disabled', true);
  $('.signup-form .btn').prop('disabled', true);
});

$('.error-msg .closebtn').on('click', function () {
  $('.login-form .btn').prop('disabled', false);
  $('.signup-form .btn').prop('disabled', false);
  $('.error-msg').hide();
});

$('.login-form').hide();
$('.signup-form').show();
$('.signup').addClass('clicked');

$('.login').on('click', function () {
  $('.signup-form').hide();
  $('.login-form').show();
  $('.login').addClass('clicked');
  $('.signup').removeClass('clicked');
});

$('.signup').on('click', function () {
  $('.login-form').hide();
  $('.signup-form').show();
  $('.signup').addClass('clicked');
  $('.login').removeClass('clicked');
});

function onSignUp(event) {
  event.preventDefault();
  let data = new FormData(event.target);

  // Post to User sign up API
  // eslint-disable-next-line no-undef
  axios
    .post('/api/1.0/user/signup', {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
    })
    .then((res) => {
      window.location.href = '/management/apps';
    })
    .catch((err) => {
      console.log(err);
    });
}

function onLogin(event) {
  event.preventDefault();
  let data = new FormData(event.target);
  // Post to User sign in API
  // eslint-disable-next-line no-undef
  axios
    .post('/api/1.0/user/signin', {
      email: data.get('email'),
      password: data.get('password'),
    })
    .then((res) => {
      window.location.href = '/management/apps';
    })
    .catch((err) => {
      console.log(err);
    });
}
document.querySelector('.signup-form').addEventListener('submit', onSignUp);
document.querySelector('.login-form').addEventListener('submit', onLogin);
