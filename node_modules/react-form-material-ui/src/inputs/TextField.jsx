import React, { PropTypes } from 'react';
import MaterialTextField from 'material-ui/TextField';

export default function TextField(props) {
  const { value, error, onChange, ...rest } = props;

  return (
    <MaterialTextField
      value={value || ''}
      onChange={(e) => onChange(e.target.value, e)}
      errorText={error}
      {...rest}
    />
  );
}

TextField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.string,
  onChange: PropTypes.func
};
