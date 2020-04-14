import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
// import Hammer from 'rc-hammerjs';

import Dashboard from '../../pages/dashboard';

import { Row, Col } from 'reactstrap';
import s from './Layout.module.scss';

class Layout extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    sidebarStatic: false,
    sidebarOpened: false,
  };

  render() {
    return (
      <div
        className={[
          s.root,
          'sidebar-' + this.props.sidebarPosition,
          'sidebar-' + this.props.sidebarVisibility,
        ].join(' ')}
      >
        <div className={s.wrap}>

            <main className={s.content}>
              <TransitionGroup>
                <CSSTransition
                  key={this.props.location.key}
                  classNames="fade"
                  timeout={200}
                >
                  <Switch>
                    <Route path="/app/dashboard" exact component={Dashboard} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
              <Row>
              <Col lg={1} />
              <Col lg={10}>
                <footer className={s.contentFooter}>
                  Data is owned and managed <a href="https://github.com/CSSEGISandData/COVID-19">Johns Hopkins CSSE</a> public repository <a href="covid19watch.info" >Covid19watch.info</a>
                </footer>
              </Col>
              </Row>
            </main>
        </div>
      </div>
    );
  }
}


export default withRouter(Layout);
