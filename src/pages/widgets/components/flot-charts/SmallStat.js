import React from 'react';
import { Row, Col } from 'reactstrap';
import HighchartsReact from 'highcharts-react-official'

import Widget from '../../../../components/Widget/Widget';

class SmallStat extends  React.Component {

  constructor(props) {
    super(props);
    this.state = {  };
    
  }

  generateRandomData = (labels) => {
    function random() {
      return (Math.floor(Math.random() * 30)) + 10;
    }

    const data = [];
    let maxValueIndex = 5;

    for (let i = 0; i < labels.length; i += 1) {
      const randomSeries = [];
      for (let j = 0; j < 25; j += 1) {
        randomSeries.push([j, Math.floor(maxValueIndex * j) + random()]);
      }
      maxValueIndex -= 1;
      data.push({
        data: randomSeries,
        name: 'Light Blue',
        color: 'rgba(244,87,34,1)',
        fillColor: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, 'rgba(244,87,34,.8)'],
            [1, 'rgba(244,87,34, 0)']
          ]
        },
        type: 'areaspline',
        fillOpacity: 1,
        lineWidth: 2
      });
    }
    return data;
  }

  render() {
    const options = {
      credits: {
        enabled: false
      },
      title: false,
      chart: {
        height: 120,
        margin: 0,
        backgroundColor: 'rgba(0,0,0,0)'
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillOpacity: 1
        },
        series: {
          marker: {
            enabled: false,
            symbol: 'circle'
          },
          states: {
            hover: {
              lineWidth: 1
            }
          }
        },
      },
      legend: false,
      xAxis: {
        visible: false,
        minPadding: 0,
        maxPadding: 0
      },
      yAxis: {
        visible: false,
        minPadding: 0,
        maxPadding: 0
      }
    };

    let { title } = this.props;

    return (
      <>

        <Widget title={<Row> <Col xs={4}> <h6> {title} </h6> </Col> </Row>}  className="p-0 ">
            <HighchartsReact options={{
              ...options,
              series: this.generateRandomData([{ name: 'Visitors', color: '#1870DC' }])
            }} />
        </Widget>

      </>
    );
  }
}

export default SmallStat;
