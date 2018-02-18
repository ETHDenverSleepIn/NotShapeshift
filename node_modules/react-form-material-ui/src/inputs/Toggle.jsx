import React, { PropTypes } from 'react';
import MaterialToggle from 'material-ui/Toggle';

export default function Toggle(props) {
  const { value, error, onChange, wrapperClassname, errorClassName, ...rest } = props;
  const toggled = Boolean(value);

  return (
    <div className={wrapperClassname}>
      <MaterialToggle
        toggled={toggled}
        onToggle={(e, value) => onChange(value, e)}
        {...rest}
      />
      {error &&
        <div className={errorClassName}>{error}</div>
      }
    </div>
  );
}

Toggle.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  error: PropTypes.string,
  onChange: PropTypes.func,
  wrapperClassname: PropTypes.string,
  errorClassName: PropTypes.string
};

Toggle.defaultProps = {
  errorClassName: 'error'
};
