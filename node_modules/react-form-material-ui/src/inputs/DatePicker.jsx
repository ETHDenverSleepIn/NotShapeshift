import React, { PropTypes } from 'react';
import MaterialDatePicker from 'material-ui/DatePicker';

export default function DatePicker(props) {
  const { value, error, wrapperClassName, errorClassName, onChange, ...rest } = props;
  const pickerValue = value || null;

  return (
    <div className={wrapperClassName}>
      <MaterialDatePicker value={pickerValue} onChange={(e, value) => onChange(value, e)} {...rest} />
      {error &&
        <div className={errorClassName}>{error}</div>
      }
    </div>
  );
}

DatePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  error: PropTypes.string,
  wrapperClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  onChange: PropTypes.func
};

DatePicker.defaultProps = {
  errorClassName: 'error'
};
