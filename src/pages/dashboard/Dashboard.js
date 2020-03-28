import React from 'react';
import { Row, Col, FormGroup } from 'reactstrap';
import Select from 'react-select';
import Widget from '../../components/Widget';

import Map from './components/am4chartMap/am4chartMap';
import { getLatestData, getCountryList, generateData, generatePieData, applyFilter } from './DataProcess'
import SmallStat from '../widgets/components/charts/SmallStat';

import s from './Dashboard.module.scss';
import formStyle from '../forms/elements/Elements.module.scss'
import OveralMainChart from '../widgets/components/charts/OveralMainChart';
import PieChart from '../widgets/components/charts/PieChart';
import CountryCompareChart from '../widgets/components/charts/CountryCompareChart';
import CaseCountryPieChart from '../widgets/components/charts/CaseCountryPieChart';

import Amplify, { API } from 'aws-amplify'
import awsconfig from "../../aws-exports"

Amplify.configure(awsconfig)

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectCountryData: [{ value: 'All', label: 'All' }],
      countryFilter: 'All'
    };
  }

  async componentDidMount() {
    // await getDataPoints()

    const data = await API.get('covidapi', '/casePoint/totalStat')
    console.log(data)


    let caseDataPoints = await getLatestData()
    let selectCountryData = getCountryList(caseDataPoints)
    this.setState({ caseDataPoints: caseDataPoints, selectCountryData: selectCountryData })
  }


  handleFilterUpdate = (event) => { this.setState({ countryFilter: event.value }); }

  render() {
    return (
      <div className={s.root}>
        <Row>
          <Col lg={1} />
          <Col lg={7}>
            <h1 className="page-title">COVID19Watch<small>.info</small> </h1>
          </Col>
          <Col xl={3} lg={3} md={6} xs={12}>
            <h2 className="page-title" style={{ textAlign: 'center' }} ><small><small>{new Date().toUTCString()}</small></small>  </h2>
          </Col>
        </Row>

        <Row>
          <Col lg={1} />
          <Col lg={7}>
            <Widget className="bg-transparent">
              <Map caseDataPoints={applyFilter(this.state.caseDataPoints, this.state.countryFilter)} />
            </Widget>
          </Col>

          <Col xl={3} lg={3} md={6} xs={12} className='align-self-center'>

            <FormGroup row>
              <Col className={formStyle.select2}>
                <Select
                  classNamePrefix="react-select"
                  className="selectCustomization"
                  options={this.state.selectCountryData}
                  onChange={this.handleFilterUpdate}
                  defaultValue={this.state.selectCountryData[0]}
                />
              </Col>
            </FormGroup>

            {generateData(this.state.caseDataPoints, this.state.countryFilter).map((stats, idx) => (
              <SmallStat key={idx}
                title={stats['name']}
                data={[stats]}
                percentage={stats.percentage}
                increase={stats.increase} />
            ))}

          </Col>
        </Row>


        <Row >
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <CountryCompareChart data={this.state.caseDataPoints} selectCountryData={this.state.selectCountryData} />
          </Col>
          <Col lg={4} xs={12} >
            <CaseCountryPieChart data={this.state.caseDataPoints} />
          </Col>
        </Row>

        <Row>
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <OveralMainChart data={generateData(this.state.caseDataPoints, this.state.countryFilter)} />
          </Col>
          <Col lg={4} xs={12}>
            <PieChart data={generatePieData(this.state.caseDataPoints, this.state.countryFilter)} />
          </Col>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
