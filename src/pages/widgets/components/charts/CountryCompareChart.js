import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import Select from 'react-select';
import config from '../config.js';
import { applyFilter } from '../../../dashboard/DataProcess';
const colors = config.chartColors;

export default class CountryCompareChart extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      selectedType: 'Confirmed',
      countryFilter: {
        countryFromFilter: 'US',
        countryToFilter: 'Italy'
      }
    };
  }
  static propTypes = {
    data: PropTypes.any.isRequired,
    isReceiving: PropTypes.bool
  };

  static defaultProps = {
    data: [],
    isReceiving: false
  };

  handleChange = (event) => {
    this.setState({ selectedType: event.target.value });
  };

  getCountryChartData() {
    let countryList = Object.values(this.state.countryFilter)
    let series = []
    var colorsPallete = [ colors.blue, colors.red ] 
    var countryColor = []
    var categories = []

    if (this.props['data']['Confirmed']) {

      countryList.forEach(country => {
        let countryCasePoints = applyFilter(this.props['data'], country)
        let data = []
        let sortedDates = Object.keys(countryCasePoints[this.state.selectedType][0]['dataPoints']).sort((a, b) => a - b);
        sortedDates = sortedDates.slice(Math.max(sortedDates.length - 15, 0))

        sortedDates.forEach(caseDate => {
          let totalPerDay = countryCasePoints[this.state.selectedType].map(datapoint => datapoint['dataPoints'][caseDate])
          data.push([caseDate, parseInt(totalPerDay.reduce((a, b) => a + b))])
        })
        countryColor.push(colorsPallete.shift())
        categories.push(sortedDates)

        series.push({
          name: country,
          data: data
        })
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

    return column3D
  }

  render() {

    return (
      <Widget
        title={<h5>Countries <span className="fw-semi-bold">COVID-19 Cases</span></h5>}
        close collapse
      >

        <Row md="12" className="justify-content-center">
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" name="radio1" id="radio1" value="Confirmed" defaultChecked onChange={this.handleChange} />
            <Label for="radio1">Confirmed</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio3" name="radio1" value="Death" onChange={this.handleChange} />
            <Label for="radio3">Death</Label>
          </FormGroup>
        </Row>
        <Row>
          <Col xs={6} >
            <Select
              classNamePrefix="react-select"
              className="selectCustomization "
              options={this.props.selectCountryData}
              onChange={(event) => { this.setState({ countryFilter: { ...this.state.countryFilter, countryFromFilter: event.value } }) }}
              value={ this.props.selectCountryData.filter(el => el.value === this.state.countryFilter.countryFromFilter)[0] }
            />
          </Col>
          <Col xs={6} >
            <Select
              classNamePrefix="react-select"
              className="selectCustomization "
              options={this.props.selectCountryData}
              onChange={(event) => { this.setState({ countryFilter: { ...this.state.countryFilter, countryToFilter: event.value } }) }}
              value={  this.props.selectCountryData.filter(el => el.value === this.state.countryFilter.countryToFilter)[0] }
            />
          </Col>
        </Row>

        <HighchartsReact options={this.getCountryChartData()} />
      </Widget>
    );
  }
}
