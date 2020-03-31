import React, { PureComponent } from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import Select from 'react-select';
import config from '../config.js';

import  { API } from 'aws-amplify'
const colors = config.chartColors;
const moment = require('moment')

export default class CountryCompareChart extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      selectedType: 'confirmed',
      countryFromFilter: 'US',
      countryToFilter: 'Italy'
    };
  }

  async componentDidMount() {
    await this.getCountryChartData()
  }

  /**
   * called on ComponentDidMount and eath setState event. 
   */
  async getCountryChartData() {
    let countryList = [this.state.countryFromFilter, this.state.countryToFilter]
    let series = []
    var colorsPallete = [colors.blue, colors.red]
    var countryColor = []
    var categories = []

    for (let country of countryList) {
      const result = await API.get('covidapi', `/casePoint/totalStat/${country}`);

      let caseCountry = result.body.map(el => { return [country, el[this.state.selectedType]] })
      caseCountry = caseCountry.slice(0, 15).reverse() // choose top most infected regions

      countryColor.push(colorsPallete.shift())
      categories.push(result.body.map(el => moment(el.date).utc().format('YYYY-MM-DD')).slice(0,15).reverse())

      series.push({
        name: country,
        data: caseCountry
      })
    }

    let column3D = {
      credits: {
        enabled: false
      },
      colors: countryColor,
      chart: {
        backgroundColor: 'transparent',
        type: 'column',
        options3d: {
          enabled: true,
          alpha: 10,
          beta: 25,
          depth: 70
        }
      },
      exporting: {
        enabled: false
      },
      title: false,
      legend: {
        itemStyle: {
          color: colors.textColor
        }
      },
      subtitle: {
        text: 'Past 15 days',
        style: {
          color: colors.textColor
        }
      },
      plotOptions: {
        column: {
          depth: 25
        }
      },
      xAxis: {
        categories: categories[0],
        labels: {
          skew3d: true,
          style: {
            fontSize: '10px',
            color: colors.textColor
          }
        },
        gridLineColor: colors.gridLineColor
      },
      yAxis: {
        title: {
          text: null
        },
        gridLineColor: colors.gridLineColor
      },
      series: series
    }

    this.setState({chartData : column3D})

    return column3D
  }

  render() {

    return (
      <Widget
        title={<h5>Countries <span className="fw-semi-bold">COVID-19 Cases</span></h5>}
        close collapse
      >

        <Row md="12" className="justify-content-center" style={{ textTransform : 'capitalize'}}>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio1" name="radio1" value="confirmed" defaultChecked 
            onChange={(event) => {  this.setState({ selectedType: event.target.value }, this.getCountryChartData) }} />
            <Label for="radio1">Confirmed</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio2" name="radio1" value="recovered" 
            onChange={(event) => {  this.setState({ selectedType: event.target.value }, this.getCountryChartData) }} />
            <Label for="radio2">Recovered</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio3" name="radio1" value="death"
            onChange={(event) => {  this.setState({ selectedType: event.target.value }, this.getCountryChartData) }} />
            <Label for="radio3">Death</Label>
          </FormGroup>
        </Row>
        <Row>
          <Col xs={6} >
            <Select
              classNamePrefix="react-select"
              className="selectCustomization "
              options={this.props.selectCountryData}
              onChange={(event) => { this.setState({ countryFromFilter: event.value }, this.getCountryChartData) }}
              value={this.props.selectCountryData.filter(el => el.value === this.state.countryFromFilter)[0]}
            />
          </Col>
          <Col xs={6} >
            <Select
              classNamePrefix="react-select"
              className="selectCustomization "
              options={this.props.selectCountryData}
              onChange={(event) => { this.setState({ countryToFilter: event.value }, this.getCountryChartData ) }}
              value={this.props.selectCountryData.filter(el => el.value === this.state.countryToFilter)[0]}
            />
          </Col>
        </Row>

        <HighchartsReact options={this.state.chartData} />
      </Widget>
    );
  }
}
