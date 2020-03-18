import React from 'react';
import {  Row,  Col,  Progress} from 'reactstrap';

import Widget from '../../components/Widget';

import Map from './components/am4chartMap/am4chartMap';
import AnimateNumber from 'react-animated-number';

import s from './Dashboard.module.scss';


class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      graph: null,
      checkedArr: [false, false, false],
    };
    this.checkTable = this.checkTable.bind(this);
  }

  checkTable(id) {
    let arr = [];
    if (id === 0) {
      const val = !this.state.checkedArr[0];
      for (let i = 0; i < this.state.checkedArr.length; i += 1) {
        arr[i] = val;
      }
    } else {
      arr = this.state.checkedArr;
      arr[id] = !arr[id];
    }
    if (arr[0]) {
      let count = 1;
      for (let i = 1; i < arr.length; i += 1) {
        if (arr[i]) {
          count += 1;
        }
      }
      if (count !== arr.length) {
        arr[0] = !arr[0];
      }
    }
    this.setState({
      checkedArr: arr,
    });
  }

  render() {
    return (
      <div className={s.root}>
        <h1 className="page-title">COVID-19 &nbsp;
          <small>
            <small>Dashboard</small>
          </small>
        </h1>

        <Row>
          <Col lg={7}>
            <Widget className="bg-transparent">
              <Map />
            </Widget>
          </Col>
          <Col lg={1} />


        </Row>

        

        <Row>
          <Col lg={4} xs={12}>
            <Widget
              title={<h6> USERBASE GROWTH </h6>}
              close settings
            >
              <div className="stats-row">
                <div className="stat-item">
                  <h6 className="name">Overall Growth</h6>
                  <p className="value">76.38%</p>
                </div>
                <div className="stat-item">
                  <h6 className="name">Montly</h6>
                  <p className="value">10.38%</p>
                </div>
                <div className="stat-item">
                  <h6 className="name">24h</h6>
                  <p className="value">3.38%</p>
                </div>
              </div>
              <Progress color="success" value="60" className="bg-custom-dark progress-xs" />
              <p>
                <small>
                  <span className="circle bg-default text-white">
                    <i className="fa fa-chevron-up" />
                  </span>
                </small>
                <span className="fw-semi-bold">&nbsp;17% higher</span>
                &nbsp;than last month
              </p>
            </Widget>
          </Col>
          <Col lg={4} xs={12}>
            <Widget
              title={<h6> TRAFFIC VALUES </h6>}
              close settings
            >
              <div className="stats-row">
                <div className="stat-item">
                  <h6 className="name">Overall Values</h6>
                  <p className="value">17 567 318</p>
                </div>
                <div className="stat-item">
                  <h6 className="name">Montly</h6>
                  <p className="value">55 120</p>
                </div>
                <div className="stat-item">
                  <h6 className="name">24h</h6>
                  <p className="value">9 695</p>
                </div>
              </div>
              <Progress color="danger" value="60" className="bg-custom-dark progress-xs" />
              <p>
                <small><span className="circle bg-default text-white"><i className="fa fa-chevron-down" /></span></small>
                <span className="fw-semi-bold">&nbsp;8% lower</span>
                &nbsp;than last month
              </p>
            </Widget>
          </Col>
          <Col lg={4} xs={12}>
            <Widget
              title={<h6> RANDOM VALUES </h6>}
              close settings
            >
              <div className="stats-row">
                <div className="stat-item">
                  <h6 className="name fs-sm">Overcome T.</h6>
                  <p className="value">104.85%</p>
                </div>
                <div className="stat-item">
                  <h6 className="name fs-sm">Takeoff Angle</h6>
                  <p className="value">14.29&deg;</p>
                </div>
                <div className="stat-item">
                  <h6 className="name fs-sm">World Pop.</h6>
                  <p className="value">7,211M</p>
                </div>
              </div>
              <Progress color="bg-primary" value="60" className="bg-custom-dark progress-xs" />
              <p>
                <small><span className="circle bg-default text-white"><i className="fa fa-plus" /></span></small>
                <span className="fw-semi-bold">&nbsp;8 734 higher</span>
                &nbsp;than last month
              </p>
            </Widget>
          </Col>

        </Row>

      </div>
    );
  }
}

export default Dashboard;
