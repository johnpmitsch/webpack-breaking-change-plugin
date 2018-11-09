import $ from "jquery";
import uuidv1 from 'uuid';

$(document).ready(() => {
  $('#welcome').text('welcome!');
  $('#uuid').text(uuidv1());
});
