'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bindDialogState = bindDialogState;

var _reactFormBase = require('react-form-base');

function bindDialogState(component) {
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'form';

  return _extends({}, (0, _reactFormBase.bindState)(component, key), {
    open: Boolean(component.state && component.state[key + 'Open'])
  });
}