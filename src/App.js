import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import Web3 from 'web3'
import RaisedButton from 'material-ui/RaisedButton';

var web3 = require('web3');
var ethAmount=0;

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedToken: 'ZRX',
    };
  }
  getInitialState() {
    return {amount: 'Hello!'};
  }
  componentDidMount() {
    this.web3 = new Web3(web3.currentProvider);
    window.addEventListener('load', this.handleLoad.bind(this));
  }
  handleLoad() {
    if (typeof web3 === 'undefined') {
      console.log("web3")
      document.getElementById('meta-mask-required').innerHTML = 'You need <a href="https://metamask.io/">MetaMask</a> browser plugin to run this example'
    }
  }
  // sendTransactionRequest(){
  //   console.log("sending "+ethAmount)
  //   web3.eth.sendTransaction({
  //     from: web3.eth.accounts[0],
  //     to: 's',
  //     value: web3.toWei(ethAmount, 'ether')
  //   }, function(error, result) {
  //     if (!error) {
  //       document.getElementById('response').innerHTML = 'Success: <a href="https://testnet.etherscan.io/tx/' + result + '"> View Transaction </a>'
  //     } else {
  //       document.getElementById('response').innerHTML = '<pre>' + error + '</pre>'
  //     }
  //   })
  // }
  render() {
    return (
        <MuiThemeProvider>
        <div className="App">
          <AppBar
            title="App Name"
            iconClassNameRight="muidocs-icon-navigation-expand-more"
          />
          <DropDownMenu value={this.state.selectedToken} onChange={this.handleChange.bind(this)}>
            <MenuItem value="ZRX" primaryText="ZRX" />
            <MenuItem value="REP" primaryText="REP" />
            <MenuItem value="MLN" primaryText="MLN" />
          </DropDownMenu>
          <TextField hintText="Amount willing to trade" type="text" id="amount"
                value={this.state.amount} onChange={this.handleAmountChange.bind(this)} />
          <RaisedButton label="Buy"  onClick={this.handleSubmission.bind(this)}/>
      </div>
      </MuiThemeProvider>
    );
  }
  handleChange(event, index, value) {
     this.setState({
       selectedToken: value,
     });
  }
  handleAmountChange(event, index, value) {
    this.setState({amount: event.target.value});
    ethAmount=event.target.value;
    console.log(ethAmount);
  }
  handleSubmission(event, index, value){
    console.log("clicked and sending request");
    window.web3.eth.sendTransaction({
      from: window.web3.eth.accounts[0],
      to: '0x6c85E27E0b01733f5d22425582A6CBD2B4a1C041',
      value: window.web3.toWei(ethAmount, 'ether')
    }, function(error, result) {
      if (!error) {
        document.getElementById('response').innerHTML = 'Success: <a href="https://testnet.etherscan.io/tx/' + result + '"> View Transaction </a>'
      } else {
        document.getElementById('response').innerHTML = '<pre>' + error + '</pre>'
      }
    })
  }
}

export default App;
