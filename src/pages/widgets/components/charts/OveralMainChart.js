import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from "reactstrap";
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'

var nf = new Intl.NumberFormat();

export default class OveralMainChart extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      
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

  chartData = () => {
    
    let firstDate;
    this.props['data'][0] ? firstDate = new Date(this.props['data'][0]['data'][0][0]).getTime() : firstDate = new Date("2020-01-22").getTime()
    this.chartOptions['plotOptions']['series']['pointStart'] = firstDate
    return {
      ...this.chartOptions,
      series: this.props['data']
    }
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
        pointInterval: 3600000 * 25, // every day
        pointStart: null,
        tooltip: {
          pointFormatter() {
            return `<span style="color: ${this.color}">${this.series.name} at ${nf.format(this.y)}</span>`;
          }
        }
      },
    }
  };

  render() {

    const { isReceiving } = this.state;
    return (
      <Widget
        bodyClass="mt"
        className="mb-xlg"
        fetchingData={isReceiving}
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
              <div className="chart-legend"/>
            </Col>
          </Row>
        }
      >
       <HighchartsReact options={this.chartData()} />
      </Widget>
    );
  }
}
