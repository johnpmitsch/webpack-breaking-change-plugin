import { jquery as $, uuid } from 'my-meta-package';

$(document).ready(() => {
  $('#welcome').text('welcome!');
  $('#uuid').text("Your uuid is: " + uuid());
});
