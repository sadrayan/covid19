import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts';
import variablePie from 'highcharts/modules/variable-pie';
import config from '../config.js';
import { applyFilter } from '../../../dashboard/DataProcess';
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

  getCountryChartDatajj() {
    let countryList = Object.values(this.state.countryFilter)
    let series = []
    var colorsPallete = ['#F45722', '#474D84']
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


  getCountryChartData() {
    let series = []
    let caseDataPoints = this.props.data
    console.log(caseDataPoints)
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
      // caseCountry =  (caseCountry)
      caseCountry = caseCountry.slice(0, 10)
      console.log(caseCountry)

      let total = caseCountry.reduce((cnt, a) => cnt + a[1], 0)
      console.log(total)
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
        height: 350
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
        <HighchartsReact options={this.getCountryChartData()} />
      </Widget>
    );
  }
}
