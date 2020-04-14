import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';

/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';

class App extends React.PureComponent {
  render() {
    return (
        <div>
            <HashRouter>
                <Switch>
                    <Route path="/" exact render={() => <Redirect to="/app/dashboard"/>}/>
                    <Route path="/app" dispatch={this.props.dispatch} component={LayoutComponent}/>
                    <Route path="/error" exact component={ErrorPage}/>
                    <Route path="*"  render={() => <Redirect to="/error"/>}/>
                </Switch>
            </HashRouter>
        </div>

    );
  }
}


export default App;
