import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts';
import variablePie from 'highcharts/modules/variable-pie';
import config from '../config.js';
const colors = config.chartColors;

variablePie(Highcharts);

export default class CaseCountryPieChart extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {};
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
    let series = []
    let caseDataPoints = this.props.data

    if (caseDataPoints['Confirmed']) {
      let confirmedDataPoints = caseDataPoints['Confirmed']
      let caseCountry = new Map()

      let sortedDates = Object.keys(confirmedDataPoints[0]['dataPoints']).sort((a, b) => a - b);
      let lastDate = sortedDates.pop()
      confirmedDataPoints.forEach(el => {
        if (caseCountry.has(el['countryRegion']))
          caseCountry.set(el['countryRegion'], caseCountry.get(el['countryRegion']) + el['dataPoints'][lastDate])
        else
          caseCountry.set(el['countryRegion'], el['dataPoints'][lastDate])
      })
      // sort by case confirmed
      caseCountry = Array.from([...caseCountry.entries()].sort((a, b) => b[1] - a[1]));
      caseCountry = caseCountry.slice(0, 10) // choose top most infected regions

      let total = caseCountry.reduce((cnt, a) => cnt + a[1], 0)

      caseCountry.forEach(el => {
        series.push({
          name: el[0],
          y: total,
          z: el[1]
        })
      })

    }

    let pie = {
      credits: {
        enabled: false
      },
      chart: {
        type: 'variablepie',
        backgroundColor: 'transparent',
        height: 450
      },
      exporting: {
        enabled: false
      },
      title: false,
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
          'Confirmed: <b>{point.z}</b><br/>' +
          'Total (top 10 countries): <b>{point.y}</b><br/>'
      },
      plotOptions: {
        variablepie: {
          borderColor: null,
          dataLabels: {
            style: {
              color: colors.textColor,
              textOutline: null
            }
          }
        }
      },
      colors: [colors.blue, colors.green, colors.orange, colors.red, colors.purple, colors.dark,
      colors.teal, colors.pink, colors.gray, colors.default],
      series: [{
        minPointSize: 10,
        innerSize: '20%',
        zMin: 0,
        name: 'countries',
        data: series,
      }]
    }

    return pie
  }


  render() {

    return (
      <Widget 
        title={<h5>Top <span className="fw-semi-bold">10 Impacted Countries</span></h5>}
        close collapse
      >
        <HighchartsReact  options={this.getCountryChartData()} />
      </Widget>
    );
  }
}
