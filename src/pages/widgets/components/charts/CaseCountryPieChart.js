import React, { PureComponent } from 'react';
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts';
import variablePie from 'highcharts/modules/variable-pie';
import config from '../config.js';
import { API } from 'aws-amplify'
const colors = config.chartColors;

variablePie(Highcharts);

export default class CaseCountryPieChart extends PureComponent {

  state = {
    pie: { title: false, }
  }

  async componentDidMount() {
    let series = []

    let caseCountry = await API.get('covidapi', '/casePoint/overviewStats')

    caseCountry = caseCountry.body.map(el => { return [el.country, el.confirmed] })
    caseCountry = caseCountry.slice(0, 10) // choose top most infected regions
    let total = caseCountry.reduce((cnt, a) => cnt + a[1], 0)

    series = caseCountry.map(el => {
      return {
        name: el[0],
        y: total,
        z: el[1]
      }
    })

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
      series: [{
        minPointSize: 10,
        innerSize: '20%',
        zMin: 0,
        name: 'countries',
        data: series,
      }]
    }

    this.setState({ pie: pie })
  }


  render() {
    return (
      <Widget
        title={<h5>Top <span className="fw-semi-bold">10 Impacted Countries</span></h5>}
        close collapse
      >
        <HighchartsReact options={this.state.pie} />
      </Widget>
    );
  }
}
