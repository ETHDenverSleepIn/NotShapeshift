import React, { PropTypes } from 'react';
import MaterialAutoComplete from 'material-ui/AutoComplete';

export default function AutoComplete(props) {
  const { value, error, onChange, ...rest } = props;

  return (
    <MaterialAutoComplete
      searchText={value}
      onUpdateInput={(value, ds, params) => onChange(value, ds, params)}
      errorText={error}
      {...rest}
    />
  );
}

AutoComplete.propTypes = {
  value: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func
};
