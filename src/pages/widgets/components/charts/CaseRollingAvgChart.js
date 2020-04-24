import React from 'react'
import { Row, Col, FormGroup, Label, Input } from 'reactstrap'
import Widget from "../../../../components/Widget/Widget"
import HighchartsReact from 'highcharts-react-official'
import { API } from 'aws-amplify'
var nf = new Intl.NumberFormat();


export default class HasCurveFlatten extends React.PureComponent {


  constructor(props) {
    super(props)
    this.chartRef = React.createRef();
    this.state = {
      rollingAvgType: 'confirmed',
      caseTypeThreshold: {
        confirmed: 100,
        active: 100,
        recovered: 100,
        deaths: 5
      }
    }
  }

  async componentDidMount() {
    let result = await API.get('covidapi', '/casePoint/overviewRollingAvgStats')
    this.setState({ countryCaseRollingAvg: result.body })
    this.getStatData()
  }

  /**
   * analysis done on Active cases and the moving average for trend
   */
  getStatData() {
    const { countryCaseRollingAvg } = this.state
    let series = []
    let labels = []


    for (let country in countryCaseRollingAvg) {
      // console.log(country, this.state.rollingAvgType, countryCaseRollingAvg[country])
      let data = countryCaseRollingAvg[country][this.state.rollingAvgType]
      data = data.map(el => parseInt(el))
      data = data.filter(el => el >= this.state.caseTypeThreshold[this.state.rollingAvgType])
      // console.log(country, this.state.rollingAvgType, data)

      series.push({
        name: country,
        type: 'spline',
        data: data,
        caseType: this.state.rollingAvgType,
        tooltip: {
          valueSuffix: ' mm'
        },
      })
      labels.push({
        point: {
          xAxis: 0,
          yAxis: 0,
          x: data.length,
          y: data[data.length - 1]
        },
        text: country
      })
    }

    // console.log(labels)

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
        text: '7-day rolling average',
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
        labels: {
          style: {
            color: "#ffffff"
          }
        }
      },
      xAxis: {
        tickInterval: 5,
        labels: {
          overflow: 'justify',
          style: {
            color: "#ffffff"
          }
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false,
            symbol: 'circle'
          },
          tooltip: {
            pointFormatter() {
              return `<span style="color: #595d78">${this.series.name} at ${nf.format(this.y)}</span>`;
            }
          }
        },
      },
      series: series
    };

    this.setState({ chartOptions: chartOptions })
  }

  // get the delta on reported cases
  diff(A) { return A.slice(1).map(function (n, i) { return n - A[i] }) }

  render() {
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
              <h6>
                <span>
                  {this.state.rollingAvgType} cases since initial {this.state.caseTypeThreshold[this.state.rollingAvgType]}
                </span>
              </h6>
            </Col>
            <Col xs={12} sm={7}>
              <div className="chart-legend" />
            </Col>
          </Row>
        }
      >

        <Row md="12" className="justify-content-center" >
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio1" name="rollingAvgType" value="confirmed" defaultChecked
              onChange={(event) => { this.setState({ rollingAvgType: event.target.value }, this.getStatData) }} />
            <Label for="radio1">Confirmed</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio2" name="rollingAvgType" value="recovered"
              onChange={(event) => { this.setState({ rollingAvgType: event.target.value }, this.getStatData) }} />
            <Label for="radio2">Recovered</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="radio3" name="rollingAvgType" value="deaths"
              onChange={(event) => { this.setState({ rollingAvgType: event.target.value }, this.getStatData) }} />
            <Label for="radio3">Death</Label>
          </FormGroup>
        </Row>
        <HighchartsReact
          ref={this.chartRef}
          allowChartUpdate={true}
          options={this.state.chartOptions} />
      </Widget>
    );
  }
}
