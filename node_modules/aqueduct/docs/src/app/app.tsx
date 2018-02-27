import { Events } from 'app/events/events';
import { Home } from 'app/home';
import { getPath, paths } from 'common/paths';
import * as React from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { Footer } from './footer';
import { NavBar } from './nav-bar';

interface IAppProps {

}

@withRouter
export class App extends React.Component<IAppProps> {
  public render() {
    return (
      <div className='app'>
        <NavBar />
        <Switch>
          <Route path={getPath(paths.home)} component={Home} />
          <Route path={getPath(paths.events)} component={Events} />
          <Redirect to={getPath(paths.home)} />
        </Switch>
        <Footer />
      </div>
    );
  }
}
