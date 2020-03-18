import React from 'react';
import { Row, Col } from 'reactstrap';
import HighchartsReact from 'highcharts-react-official'

import Widget from '../../../../components/Widget/Widget';
import s from '../changes-chart/ChangesChart.module.scss';


class SmallStat extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};

  }

  render() {
    const options = {
      credits: {
        enabled: false
      },
      title: false,
      chart: {
        height: 80,
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

    let { title, percentage, increase, data } = this.props;

    title = <Row>
      <Col xs={4}> <h5> {title} 13323</h5>
        <div className="d-flex align-items-start h3">
          <h6>{percentage}%</h6>
          <i className={`la la-arrow-right ml-sm text-${increase ? 'success' : 'danger'} 
          rotate-${increase ? '315' : '45'}`} />
        </div>
      </Col>
    </Row>

    return (
      < >
        <Widget title={title} className="p-0" style={{ marginBottom: '10px' }}>

          <HighchartsReact options={{
            ...options,
            series: data
          }} />
        </Widget>

{/* 
        <Widget className="widget-chart-changes p-0" >

          <div className={s.changesChart}>
            <div className={`${s.chart} `}>
              <p className={s.chartValue}><i className="fa fa-caret-up" /> 352.79</p>
              <p className={s.chartValueChange}>+2.04 (1.69%)</p>
              <HighchartsReact options={{
            ...options,
            series: data
          }} />
            </div>
          </div>
        </Widget> */}
      </>
    );
  }
}

export default SmallStat;
