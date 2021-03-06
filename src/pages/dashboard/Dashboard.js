import React from 'react';
import { Row, Col, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';

import s from './Dashboard.module.scss';
// eslint-disable-next-line
import formStyle from '../forms/elements/Elements.module.scss'
import HasCurveFlatten from '../widgets/components/charts/HasCurveFlattenChart';
import PieChart from '../widgets/components/charts/PieChart';
import CountryCompareChart from '../widgets/components/charts/CountryCompareChart';
import ForecastChart from '../widgets/components/charts/ForecastChart';
import CaseCountryPieChart from '../widgets/components/charts/CaseCountryPieChart';
import CaseTypeStat from '../widgets/components/charts/CaseTypeStats';
import CaseRollingAvgChart from '../widgets/components/charts/CaseRollingAvgChart';
import Map from './components/am4chartMap/am4chartMap';

import Amplify, { API } from 'aws-amplify'
import awsconfig from "../../aws-exports"

Amplify.configure(awsconfig)

var nf = new Intl.NumberFormat();
const moment = require('moment')

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectCountryData: [{ value: 'All', label: 'All' }],
      countryFilter: 'All'
    };

    this.statsElement = React.createRef()
    this.mapElement = React.createRef()
    this.hasCurveFlattenElement = React.createRef()
    this.overalPieChartElement = React.createRef()
  }

  async componentDidMount() {
    const selectCountryResult = await API.get('covidapi', '/casePoint/overviewStats')

    let selectCountryData = selectCountryResult.body.map(el => {
      return { value: el.country, label: `${el.country}  ${nf.format(el.confirmed)}` }
    })
    selectCountryData.unshift({ value: 'All', label: 'All' })

    this.setState({ selectCountryData: selectCountryData })
  }


  handleFilterUpdate = (event) => {
    this.statsElement.current.getStatData(event.value)
    this.hasCurveFlattenElement.current.getStatData(event.value)
    this.overalPieChartElement.current.getStatData(event.value)
    this.mapElement.current.getMapData(event.value)
    this.setState({ countryFilter: event.value })
    
  }

  render() {
    return (
      <div className={s.root}>
        <Row>
          <Col lg={1}/>
          <Col lg={7}>
            <h1 className="page-title">COVID19Watch<small>.info</small> </h1>
          </Col>
          <Col xl={3} lg={3} md={6} xs={12}>
            <h2 className="page-title" style={{ textAlign: 'center' }} ><small><small>{moment.utc().format('llll') } GMT</small></small>  </h2>
          </Col>
          
        </Row>

        <Row>
          <Col lg={1}/>
          <Col lg={7}>
            <Map ref={this.mapElement} countryFilter={this.state.countryFilter} />
          </Col>

          <Col xl={3} lg={3} md={12} xs={12} >
            <FormGroup row>
              <Label md="4" for="default-select">Country: </Label>
              <Col md="8" className={s.select2}>
                <Select
                  classNamePrefix="react-select"
                  className="selectCustomization"
                  options={this.state.selectCountryData}
                  onChange={this.handleFilterUpdate}
                  defaultValue={this.state.selectCountryData[0]}
                />
              </Col>
            </FormGroup>
            <CaseTypeStat ref={this.statsElement} />
          </Col>
          
        </Row>

        <Row >
          <Col lg={1} />
          <Col lg={10} xs={12}>
            <ForecastChart selectCountryData={this.state.selectCountryData} />
          </Col>
        </Row>


        <Row >
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <HasCurveFlatten ref={this.hasCurveFlattenElement} />
          </Col>
          <Col lg={4} xs={12} >
            <CaseCountryPieChart  />
          </Col>
        </Row>

        <Row>
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <CaseRollingAvgChart selectCountryData={this.state.selectCountryData} />
          </Col>
          <Col lg={4} xs={12}>
            <PieChart ref={this.overalPieChartElement}  />
          </Col>
        </Row>
        <Row>
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <CountryCompareChart selectCountryData={this.state.selectCountryData} />
          </Col>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
