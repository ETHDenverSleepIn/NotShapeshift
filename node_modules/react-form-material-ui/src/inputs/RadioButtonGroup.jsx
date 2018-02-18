import React, { PropTypes } from 'react';
import { RadioButton, RadioButtonGroup as MaterialRadioButtonGroup } from 'material-ui/RadioButton';

export default function RadioButtonGroup(props) {
  const { value, error, onChange, wrapperClassName, errorClassName, options, children, ...rest } = props;

  const radioItems = children || (options || []).map((opt, i) => {
    const { value, label } = typeof opt === 'object' ? opt : { value: opt, label: opt };

    return <RadioButton key={i} value={value} label={label.toString()} />;
  });


  return (
    <div className={wrapperClassName}>
      <MaterialRadioButtonGroup
        valueSelected={value}
        onChange={(e, value) => onChange(value, e)}
        {...rest}
      >
        {radioItems}
      </MaterialRadioButtonGroup>
      {error &&
        <div className={errorClassName}>{error}</div>
      }
    </div>
  );
}

RadioButtonGroup.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.bool
  ]),
  error: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
      PropTypes.shape({
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.bool
        ]),
        label: PropTypes.string
      })
    ])
  ),
  wrapperClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  children: PropTypes.node
};

RadioButtonGroup.defaultProps = {
  errorClassName: 'error'
};
