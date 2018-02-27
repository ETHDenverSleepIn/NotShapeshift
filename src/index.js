import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { getOrders } from './lib';

console.log(getOrders('MLN', 'WETH', 42));

class DropDown extends React.Component {
  state = {
    selectedOption: '',
  }
  handleChange = (selectedOption) => {
    if(selectedOption != null){
      this.setState({ selectedOption });
      console.log(`Selected: ${selectedOption.label}`);
    } else{
      selectedOption = '';
      this.setState({selectedOption});
    }
  }
  render() {
    const { selectedOption } = this.state;
    const value = selectedOption && selectedOption.value;

    return (
      <Select
        name="form-field-name"
        value={value}
        onChange={this.handleChange}
        options={[
          { value: 'zrx', label: 'ZRX' },
          { value: 'mln', label: 'MLN' },
        ]}
      />
    );
  }
}
//////////
ReactDOM.render(
  <DropDown />,
  document.getElementById('dropdown'),
);
