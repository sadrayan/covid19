import React from 'react';
import { Row, Col, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import Widget from '../../components/Widget';

import Map from './components/am4chartMap/am4chartMap';
import { getLatestData, getCountryList } from './DataProcess'
import SmallStat from '../widgets/components/flot-charts/SmallStat';

import s from './Dashboard.module.scss';
import formStyle from '../forms/elements/Elements.module.scss'


class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectCountryData: [],
    };
  }

  async componentDidMount() {
    let caseDataPoints = await getLatestData()
    let selectCountryData = getCountryList(caseDataPoints)
    this.setState({ caseDataPoints: caseDataPoints, selectCountryData: selectCountryData })
  }


  render() {
    return (
      <div className={s.root}>
        <Row>
          <Col lg={1} />
          <Col lg={7}>
            <h1 className="page-title">COVID-19 &nbsp;
              <small> <small>Dashboard</small> </small>
            </h1>
          </Col>
        </Row>

        <Row>
          <Col lg={1} />
          <Col lg={7}>
            <Widget className="bg-transparent">
              <Map />
            </Widget>
          </Col>

          <Col xl={3} lg={3} md={6} xs={12}>

            <FormGroup row>
              <Col className={formStyle.select2}>
                <Select
                  classNamePrefix="react-select"
                  className="selectCustomization"
                  options={this.state.selectCountryData}
                  defaultValue={this.state.selectCountryData[1]}
                />
              </Col>
            </FormGroup>

            <SmallStat title="Confirmed" />
            <SmallStat title="Recovered" />
            <SmallStat title="Death" />
          </Col>
        </Row>

        <Row>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
