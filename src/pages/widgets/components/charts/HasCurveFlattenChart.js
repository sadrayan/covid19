import React from 'react'
import { Row, Col } from "reactstrap"
import Widget from "../../../../components/Widget/Widget"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import statsStyles from './ChartStyles'
import { API } from 'aws-amplify'
import { ma, } from 'moving-averages'
import config from '../config'
import regression from 'regression'
import annotations from 'highcharts/modules/annotations'
annotations(Highcharts)
const moment = require('moment')
const colors = config.chartColors
var nf = new Intl.NumberFormat()

export default class HasCurveFlatten extends React.PureComponent {


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
    
    const rollingAvgSpan = 5;
    const result = await API.get('covidapi', `/casePoint/totalStat/${countryFilter === 'All' ? '' : countryFilter}`);
    let series = [];

    // calculate Active cases
    result.body.forEach(el => { el.active = el.confirmed - el.recovered - el.deaths })
    // filter by first 100 day. 
    let data = result.body.filter(el => el.confirmed >= 100)
    data = data.map(el => { return [moment(el.date).utc().format('YYYY-MM-DD'), el.active] })
    data.reverse()
    // console.log('data', data)

    // calculate Active Delta cases
    let deltaCasePerDay = this.diff(data.map(el => el[1]))
    console.log('delta', deltaCasePerDay)

    // shift moving average forward to match the last elements
    let movingAvg = ma(deltaCasePerDay, rollingAvgSpan).flat()
    movingAvg.unshift( Array.from({length: rollingAvgSpan -1 }).map(el => 0) )
    movingAvg = movingAvg.flat()
    console.log('moving average', movingAvg)
    let trendUp = (deltaCasePerDay[deltaCasePerDay.length - 1] - movingAvg[movingAvg.length - 1]) >= 0
    // console.log('trendUp', trendUp)

    const regResult = regression.linear(movingAvg.map((el, index) => { return [index, el] }))
    const gradient = regResult.equation[0];
    const yIntercept = regResult.equation[1];
    console.log(regResult, gradient, yIntercept)   
    
    

    let trend = movingAvg.map(el =>  {return 0} )
    for (let i = 1; i <= 10; i++){
      trend.push(regResult.predict([data.length + i])[1])
    }
    console.log('trend' , trend)



    series.push({
      name: 'Trend',
      type: 'scatter',
      data: trend,
      lineWidth: 2,
      dashStyle: "dot",
      color: colors.textColor,
      tooltip: {
        valueSuffix: ' mm'
      }
    })

    series.push({
      name: 'New Active',
      type: 'column',
      color: statsStyles['confirmed']['backgroundColorLighter'],
      data: deltaCasePerDay,
      tooltip: {
        valueSuffix: ' mm'
      }
    })

    series.push({
      name: 'Active (MA)',
      type: 'spline',
      color: colors.red,
      data: movingAvg,
      tooltip: {
        valueSuffix: ' mm'
      }
    })

    // console.log(moment.utc(data[0][0]))

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
        text: 'New Active cases (5-day-average)',
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
        type: 'logarithmic',
        // min: 0,
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
      // annotations: {
      //   visible: false
      // },
      annotations: [{
        visible: true,
        labels: [{
            point: {
                x: trend.length -5,
                y: trend[trend.length -5],
                xAxis: 0,
                yAxis: 0
            },
            text: 'Trend line'
        }],
        labelOptions: {
            x: 40, y: -10
        }
      }],
      plotOptions: {
        series: {
          shadow: false,
          borderWidth: 0,
          marker: {
            enabled: false,
            symbol: 'circle'
          },
          pointStart: moment.utc(data[0][0]).valueOf(),
          pointInterval: 24 * 3600 * 1000, // one day
          tooltip: {
            pointFormatter() {
              return `<span style="color: #595d78">${this.series.name} at ${nf.format(this.y)}</span>`;
            }
          }
        },
      },
      series: series
    };

    // STUPID
    if (this.chartRef.current.chart) {
      // console.log(this.chartRef.current)
      this.chartRef.current.chart.series.forEach(el =>
        el.update({
          pointStart: moment.utc(data[0][0]).valueOf()
        })
      )

    }


    this.setState({ chartOptions: chartOptions, countryFilter: countryFilter, trendUp: trendUp })
  }


  // get the delta on reported cases
  diff(A) { return A.slice(1).map((n, i) => { return n - A[i] }) }

  render() {

    let trendIcon = ''
    this.state.trendUp ?
      trendIcon = <i className="las la-caret-up text-danger" style={{ marginTop: '-15px' }}>UP</i> :
      trendIcon = <i className="las la-caret-down text-success" style={{ marginTop: '-15px' }}>DOWN</i>

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
