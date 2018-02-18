import React, { PropTypes } from 'react';
import MaterialSlider from 'material-ui/Slider';

export default function Slider(props) {
  const { value, error, onChange, wrapperClassName, errorClassName, ...rest } = props;

  return (
    <div className={wrapperClassName}>
      <MaterialSlider
        value={+value}
        onChange={(e, value) => onChange(value, e)}
        {...rest}
      />
      {error &&
        <div className={errorClassName}>{error}</div>
      }
    </div>
  );
}

Slider.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  error: PropTypes.string,
  onChange: PropTypes.func,
  errorClassName: PropTypes.string,
  wrapperClassName: PropTypes.string
};

Slider.defaultProps = {
  errorClassName: 'error'
};
