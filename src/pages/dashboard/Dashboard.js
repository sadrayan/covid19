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
import CaseTypeStat from '../widgets/components/charts/CaseTypeStats';

Amplify.configure(awsconfig)

var nf = new Intl.NumberFormat();


class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectCountryData: [{ value: 'All', label: 'All' }],
      countryFilter: 'All'
    };

    this.statsElement = React.createRef()
    this.mapElement = React.createRef()
    this.overalMainChartElement = React.createRef()
    this.overalPieChartElement = React.createRef()
  }

  async componentDidMount() {
    // await getDataPoints()

    // const data = await API.get('covidapi', '/casePoint/totalStat')

    const selectCountryResult = await API.get('covidapi', '/casePoint/overviewStats')
    // console.log(selectCountryResult.body)
    let selectCountryData = selectCountryResult.body.map(el => {
      return { value: el.country, label: `${el.country}  ${nf.format(el.confirmed)}` }
    })
    selectCountryData.unshift({ value: 'All', label: 'All' })

    let caseDataPoints = await getLatestData()

    this.setState({ caseDataPoints: caseDataPoints, selectCountryData: selectCountryData })
  }


  handleFilterUpdate = (event) => {
    this.statsElement.current.getStatData(event.value)
    this.overalMainChartElement.current.getStatData(event.value)
    this.overalPieChartElement.current.getStatData(event.value)
    // this.mapElement.current.getMapData()
    this.setState({ countryFilter: event.value })
    
  }

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
              <Map ref={this.mapElement} caseDataPoints={applyFilter(this.state.caseDataPoints, this.state.countryFilter)} />
            </Widget>
          </Col>

          <Col xl={3} lg={3} md={6} xs={12} >

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

            <CaseTypeStat ref={this.statsElement} />

          </Col>
        </Row>


        <Row >
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <CountryCompareChart selectCountryData={this.state.selectCountryData} />
          </Col>
          <Col lg={4} xs={12} >
            <CaseCountryPieChart  />
          </Col>
        </Row>

        <Row>
          <Col lg={1} />
          <Col lg={6} xs={12}>
            <OveralMainChart ref={this.overalMainChartElement} />
          </Col>
          <Col lg={4} xs={12}>
            <PieChart ref={this.overalPieChartElement}  />
          </Col>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
