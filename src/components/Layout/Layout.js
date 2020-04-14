import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Dashboard from '../../pages/dashboard';
import { Row, Col } from 'reactstrap';
import s from './Layout.module.scss';

class Layout extends React.Component {
  static propTypes = {
    sidebarPosition: PropTypes.string,
    sidebarVisibility: PropTypes.string
  };

  static defaultProps = {
    sidebarPosition: 'hide',
    sidebarVisibility: 'hide',
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
