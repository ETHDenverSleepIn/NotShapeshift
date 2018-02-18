import React, { PropTypes } from 'react';
import MaterialSelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default function SelectField(props) {
  const { value, error, onChange, options, includeBlank, children, ...rest } = props;
  let optionItems = children;

  if (!optionItems) {
    optionItems = options || [];
    if (includeBlank && value) {
      optionItems = [{ value: '', text: props[includeBlank] }, ...optionItems];
    }

    optionItems = optionItems.map((opt, i) => {
      const { value, text } = typeof opt === 'object' ? opt : { value: opt, text: opt };

      return <MenuItem key={i} value={value} primaryText={text.toString()} />;
    });
  }

  return (
    <MaterialSelectField
      value={value}
      onChange={(e, i, nextVal) => (value !== nextVal) && onChange(nextVal, i, e)}
      errorText={error}
      {...rest}
    >
      {optionItems}
    </MaterialSelectField>
  );
}

SelectField.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  error: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ]),
        text: PropTypes.string
      })
    ])
  ),
  includeBlank: PropTypes.oneOf(['floatingLabelText', 'hintText']),
  children: PropTypes.node
};
