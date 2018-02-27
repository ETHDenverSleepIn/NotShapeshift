import * as React from 'react';
import './home.scss';

interface IHomeProps {}

export class Home extends React.Component<IHomeProps> {
  public render() {
    return (
      <div className='home p-bottom'>
        <div className='top'>
          <div className='section-container header-container'>
            <h1>
              A protocol and tool set for sharing
              global, decentralized liquidity on the Ethereum network, built by <strong><a
                href='https://www.ercdex.com'
                target='_blank'
              >ERC dEX.</a></strong>
            </h1>
            <div className='getStarted'>
              <div className='icon-container'>
                <i className='fa fa-arrow-circle-down' />
              </div>
              <div>
                <h1>Get started instantly</h1>
                <code>$ npm install aqueduct</code>
              </div>
            </div>
          </div>
        </div>
        <div className='section-container rest-container fl sb'>
          <div className='three-quarters-width'>
            <h1>JavaScript SDK Quick Start</h1>
            <p className='three-quarters-width'>
              We've developed a best in class developer toolset that makes
              integrating with our APIs and Event feeds simple.
            </p>
          </div>
          <div className='half-width fl vc'>
            <a
              href='https://github.com/ercdex/aqueduct#overview'
              target='_blank'
              className='button'
            >
              Get the SDK
            </a>
          </div>
        </div>

        <div className='section-container blue-container fl sb'>
          <div className='three-quarters-width'>
            <h1>REST API Documentation</h1>
            <p className='three-quarters-width'>
              Our API provides full access to shared networked liquidity,
              historical data, and more
            </p>
          </div>
          <div className='half-width fl vc'>
            <a href='/rest.html' target='_blank' className='button'>
              Review the Docs
            </a>
          </div>
        </div>

        <div className='section-container rest-container fl sb'>
          <div className='three-quarters-width'>
            <h1>WebSocket Events API</h1>
            <p className='three-quarters-width'>
              Markets are an event-driven domain. We publish the latest updates
              to our network using a simple WebSockets API.

            </p>
          </div>
          <div className='half-width fl vc'>
            <a href='/#/events' target='_blank' className='button'>
              Learn about Events API
            </a>
          </div>
        </div>
        <div className='section-container blue-container fl sb'>
          <div className='three-quarters-width'>
            <h1>Relayer Affiliates & Liquidity Partners</h1>
            <p className='three-quarters-width'>
              If you're operating your own relayer or are interested in providing larger pools
              of liquidity, <a className='text' href='mailto:partners@ercdex.com'>contact our team</a> for partnership opportunities,
              including enhanced analytics for your liquidity, and a modified fee sharing/discount structure.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
