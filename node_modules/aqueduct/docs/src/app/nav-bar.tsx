import { getPath, paths } from 'common/paths';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import './nav-bar.scss';

interface INavBarProps {

}

@observer
export class NavBar extends React.Component<INavBarProps> {
  private navbarElement?: HTMLDivElement;
  @observable private menuActive = false;
  @observable private isScrolled = false;

  public componentDidMount() {
    document.addEventListener('scroll', this.onResize);
  }

  public componentWillUnmount() {
    document.removeEventListener('scroll', this.onResize);
  }

  public render() {
    return (
      <div className={`navbar fl c ${this.isScrolled ? 'scrolled' : ''}`} ref={this.onNavBarLoad}>
        <div className='navbar-inner fl sb'>
          <div className='fl'>
            <a href='#' className='logo-container'>
              <img src='./images/light-logo.svg' style={{ width: '200px', height: '80px' }} />
            </a>
          </div>
          <div className='fl navbar-menu'>
            <a className='link' href='/rest.html'>Rest API</a>
            <NavLink activeClassName='is-active' to={getPath(paths.events)} className='link'>Events API</NavLink>
            <a className='link' target='_blank' href='https://github.com/ercdex/aqueduct#aqueduct-javascript-sdk'>JavaScript SDK</a>
          </div>
          <div className='navbar-mobile-menu'>
            <i className='fa fa-bars' onClick={this.onClickMenu} />
            {this.menuActive && <div className='link-list'>
              <a className='link' href='/rest.html'>Rest API</a>
              <a className='link' target='_blank' href='https://github.com/ercdex/aqueduct#aqueduct-javascript-sdk'>JavaScript SDK</a>
              <NavLink activeClassName='is-active' to={getPath(paths.events)} onClick={this.onClickMobileMenuItem} className='link'>Events API</NavLink>
            </div>}
          </div></div>
      </div>
    );
  }

  private readonly onClickMenu = () => this.menuActive = !this.menuActive;

  private readonly onClickMobileMenuItem = () => {
    this.menuActive = false;
  }

  private readonly onNavBarLoad = (div: HTMLDivElement) => {
    if (div) {
      this.navbarElement = div;
    }
  }

  private readonly onResize = () => {
    if (this.navbarElement) {
      if (this.navbarElement.clientHeight < (window.pageYOffset || document.documentElement.scrollTop)) {
        this.isScrolled = true;
        return;
      }
    }

    this.isScrolled = false;
  }
}
