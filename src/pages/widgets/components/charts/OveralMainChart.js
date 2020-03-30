import React from 'react';
import { Row, Col } from "reactstrap";
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import statsStyles from './ChartStyles'
import { API } from 'aws-amplify'
const moment = require('moment')
var nf = new Intl.NumberFormat();

export default class OveralMainChart extends React.PureComponent {

  state = {}

  async componentDidMount() {
    // call first time with All
    await this.getStatData('All');
  }

  async getStatData(countryFilter) {
    const result = await API.get('covidapi', `/casePoint/totalStat/${countryFilter === 'All' ? '' : countryFilter}`);
    let statsData = [];
    for (let type of ['confirmed', 'recovered', 'death']) {
      let data = result.body.map(el => { return [moment(el.date).utc().format('YYYY-MM-DD'), el[type]]; });
      // reverse sort by oldest first
      data.reverse();

      statsData.push({
        data: data,
        name: type,
        color: statsStyles[type]['backgroundColor'],
        fillColor: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, statsStyles[type]['backgroundColorLighter']],
            [1, statsStyles[type]['backgroundColorFade']]
          ]
        },
        type: 'areaspline',
        fillOpacity: 1,
        lineWidth: 2
      });
    }

    this.chartOptions['plotOptions']['series']['pointStart'] = moment.utc('2020-01-22').valueOf()
    console.log(statsData[0]['data'][0])

    this.setState({ statsData: statsData })
  }

  chartOptions = {
    credits: {
      enabled: false
    },
    chart: {
      height: 350,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    title: false,
    exporting: {
      enabled: false
    },
    legend: {
      verticalAlign: 'top',
      itemStyle: {
        color: "rgba(244, 244, 245, 0.9)"
      },
      itemHoverStyle: {
        color: "rgba(244, 244, 245, 0.6)"
      }
    },
    yAxis: {
      title: false,
      labels: {
        style: {
          color: "#ffffff"
        }
      }
    },
    xAxis: {
      type: 'datetime',
      labels: {
        overflow: 'justify',
        style: {
          color: "#ffffff"
        }
      }
    },
    annotations: {
      visible: false
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle'
        },
        pointStart: null,
        pointInterval: 24 * 3600 * 1000, // one day
        tooltip: {
          pointFormatter() {
            return `<span style="color: ${this.color}">${this.series.name} at ${nf.format(this.y)}</span>`;
          }
        }
      },
    }
  };

  render() {
    return (
      <Widget
        bodyClass="mt"
        className="mb-xlg"
        collapse
        close
        title={
          <Row>
            <Col xs={12} sm={5}>
              <h5>
                Daily <span className="fw-semi-bold">COVID-19 Cases</span>
              </h5>
            </Col>
            <Col xs={12} sm={7}>
              <div className="chart-legend" />
            </Col>
          </Row>
        }
      >
        <HighchartsReact options={{
          ...this.chartOptions,
          series: this.state.statsData
        }} />
      </Widget>
    );
  }
}
