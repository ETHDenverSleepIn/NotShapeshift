import React, { PropTypes } from 'react';
import MaterialCheckbox from 'material-ui/Checkbox';

export default function Checkbox(props) {
  const { value, error, onChange, wrapperClassName, errorClassName, ...rest } = props;
  const checked = Boolean(value);

  return (
    <div className={wrapperClassName}>
      <MaterialCheckbox
        checked={checked}
        onCheck={(e, value) => onChange(Checkbox.reversedInputValue ? !value : value, e)}
        {...rest}
      />
      {error &&
        <div className={errorClassName}>{error}</div>
      }
    </div>
  );
}

Checkbox.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  error: PropTypes.string,
  onChange: PropTypes.func,
  wrapperClassName: PropTypes.string,
  errorClassName: PropTypes.string
};

Checkbox.defaultProps = {
  errorClassName: 'error'
};
