import React from 'react';
import { Row, Col } from "reactstrap";
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import statsStyles from './ChartStyles'
import { API } from 'aws-amplify'
import { ma, } from 'moving-averages'
const moment = require('moment')
var nf = new Intl.NumberFormat();

export default class OveralMainChart extends React.PureComponent {


  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      countryFilter: 'All'
    }
  }

  async componentDidMount() {

    // call first time with All
    await this.getStatData(this.state.countryFilter);
  }

  /**
   * analysis done on Active cases and the moving average for trend
   * @param {*} countryFilter 
   */
  async getStatData(countryFilter) {
    const result = await API.get('covidapi', `/casePoint/totalStat/${countryFilter === 'All' ? '' : countryFilter}`);
    let series = [];

    // calculate Active cases
    result.body.forEach(el => { el.active = el.confirmed - el.recovered - el.deaths })
    let data = result.body.map(el => { return [moment(el.date).utc().format('YYYY-MM-DD'), el.active] })

    data.reverse();
    console.log('data', data)

    // calculate Active Delta cases
    // Bump them to next date on chart
    let deltaCasePerDay = this.diff(data.map(el => el[1]))
    deltaCasePerDay.unshift(0)
    let movingAvg = ma(deltaCasePerDay, 2).flat()
    console.log('delta', deltaCasePerDay)
    console.log('moving average', movingAvg)
    let trendUp = (deltaCasePerDay[deltaCasePerDay.length - 1] - movingAvg[movingAvg.length - 1]) >= 0
    console.log('trendUp', trendUp)


    series.push({
      name: 'New Active',
      type: 'column',
      color: statsStyles['active']['backgroundColorLighter'],
      data: deltaCasePerDay,
      tooltip: {
        valueSuffix: ' mm'
      }
    })

    series.push({
      name: 'Active (MA)',
      type: 'spline',
      color: statsStyles['active']['backgroundColor'],
      data: movingAvg,
      tooltip: {
        valueSuffix: ' mm'
      }
    })

    console.log(moment.utc(data[0][0]))

    let chartOptions = {
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
      subtitle: {
        text: 'New Active cases (2-day-average)',
        style: {
          color: '#595d78'
        }
      },
      legend: {
        verticalAlign: 'bottom',
        itemStyle: {
          color: "rgba(244, 244, 245, 0.9)"
        },
        itemHoverStyle: {
          color: "rgba(244, 244, 245, 0.6)"
        }
      },
      yAxis: {
        title: false,
        min: 0,
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
          pointStart: moment.utc(data[0][0]).valueOf(),
          pointInterval: 24 * 3600 * 1000, // one day
          tooltip: {
            pointFormatter() {
              return `<span style="color: ${this.color}">${this.series.name} at ${nf.format(this.y)}</span>`;
            }
          }
        },
      },
      series: series
    };

    // STUPID
    if (this.chartRef.current.chart) {
      console.log(this.chartRef.current)
      this.chartRef.current.chart.series.forEach(el =>
        el.update({
          pointStart: moment.utc(data[0][0]).valueOf()
        })
      )

    }


    this.setState({ chartOptions: chartOptions, countryFilter: countryFilter, trendUp: trendUp })
  }


  // get the delta on reported cases
  diff(A) { return A.slice(1).map(function (n, i) { return n - A[i] }) }

  render() {
    
    let trendIcon = <i className="las la-caret-down text-success" style={{ marginTop: '-15px' }}>DOWN</i>
    
    if (this.state.trendUp)
      trendIcon = <i className="las la-caret-up text-danger" style={{ marginTop: '-15px' }}>UP</i>


    return (
      <Widget
        bodyClass="mt"
        className="mb-xlg"
        style={{ textTransform: 'capitalize' }}
        collapse
        close
        title={
          <Row>
            <Col xs={12} sm={5}>
              <h5>
                <span className="fw-semi-bold">Has the curve flattened?</span>
              </h5>
            </Col>
            <Col xs={12} sm={7}>
              <div className="chart-legend" />
            </Col>
          </Row>
        }
      >
        <div className="d-flex justify-content-right align-items-center mb ">
          <h4>{this.state.countryFilter}: {trendIcon}</h4>
        </div>
        <HighchartsReact
          ref={this.chartRef}
          allowChartUpdate={true}
          options={this.state.chartOptions} />
      </Widget>
    );
  }
}
