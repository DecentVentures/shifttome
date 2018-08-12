import * as React from 'react';
import { Component } from 'react';
import { ShapeShiftService, Currency, MarketInfo } from '../../services/ShapeShift';
let clipboard = require('clipboard-js');
import './AddressBox.css';
/*
 *import * as CopyToClipboard from "react-copy-to-clipboard";
 */

export interface State {
  currencyImage: string;
  copied: boolean;
  marketInfo: MarketInfo[];
}
export interface Props {
  address: string;
  currency: string;
  baseCurrency: string;
}
export class AddressBox extends Component<Props> {
  state: State = {
    currencyImage: '',
    copied: false,
    marketInfo: []
  };

  coins: Currency[];
  constructor(props: Props) {
    super(props);
    this.onClipboard = this.onClipboard.bind(this);
  }

  async componentDidMount() {
    const currencyImage = await ShapeShiftService.getImageForCurrency(this.props.currency, true);
    const marketInfo = await ShapeShiftService.getMarketInfoForBase('ETH');
    this.setState({currencyImage, marketInfo});
  }

  public onClipboard() {
    clipboard.copy(this.props.address);
    this.setState({copied: true});
    setTimeout(() => this.setState({copied: false}), 1000);
  }

  public render() {
    const market = this.state.marketInfo.find( m => m.pair === `${this.props.currency}_${'ETH'}`);
    const maybeMarketInfo = market ? 
      (<div className="market-info"><span> Min: {market.min} </span> <span> Max: {market.limit} </span></div> )
      : '';
    const messageOrContent = this.state.copied ?  (<div className="message">copied</div>) : (
      <div>
      <img src={this.state.currencyImage} />
      <span className="currency-code">{this.props.currency}: </span>
      <span className="address" onClick={this.onClipboard}>{this.props.address}</span>
      {maybeMarketInfo}
      </div>
    );
    return (
      <div className="address-box">
      {messageOrContent}
      </div>
    );
  }
}
