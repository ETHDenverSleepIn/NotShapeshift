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
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import './orders.js';

var web3 = require('web3');
var ethAmount=0;
var coinType = '';

var order = require('orders.js');
console.log(order.getOrders());

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  titleStyle: {
    color: 'rgb(0, 188, 212)',
  },
};

const tilesData = [
  {
    id: 'zrx',
    img: './zrx.jpg',
    title: 'Ox (ZRX)',
    lowBid: '',
  },
  {
    id: 'mln',
    img: 'mln.jpg',
    title: 'Melon (MLN)',
    lowBid: '',
  },
  {
    id: 'omg',
    img: 'omg.png',
    title: 'OmiseGO (OMG)',
    lowBid: '',
  },
  {
    id: 'ant',
    img: '../public/ant.jpg',
    title: 'Aragon (ANT)',
    lowBid: '',
  },
  {
    id: 'snt',
    img: 'snt.svg',
    title: 'Status (SNT)',
    lowBid: '',
  },
  {
    id: 'bnt',
    img: 'bnt.svg',
    title: 'Bancor (BNT)',
    lowBid: '',
  },
  {
    id:'storj',
    img: 'storj.svg',
    title: 'Storj (STORJ)',
    lowBid: '',
  },

];

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
  render() {
    return (
        <MuiThemeProvider>
        <div className="App">
          <AppBar
            title="App Name"
            iconClassNameRight="muidocs-icon-navigation-expand-more"
          />
          <div style={styles.root}>
            <GridList style={styles.gridList} cols={2.2}>
              {tilesData.map((tile) => (
                <GridTile
                  key={tile.img}
                  title={tile.title}
                  titleStyle={styles.titleStyle}
                  titleBackground="linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                  onTouchTap={this.tileClick.bind(this, tile.id)}
                >
                <img src={tile.img} alt={tile.title}/>
                </GridTile>
              ))}
            </GridList>
          </div>

          <TextField hintText="Amount willing to trade" type="text" id="amount"
                value={this.state.amount} onChange={this.handleAmountChange.bind(this)} />
          <RaisedButton label="Buy"  onClick={this.handleSubmission.bind(this)}/>
      </div>
      </MuiThemeProvider>
    );
  }
  tileClick(event, index, value){
      coinType = event;
      console.log(coinType);
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
