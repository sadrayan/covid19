import React from 'react';
import { Row, Col } from 'reactstrap';
import HighchartsReact from 'highcharts-react-official'
import Widget from '../../../../components/Widget/Widget';
import { API } from 'aws-amplify'
import statsStyles from './ChartStyles'
const moment = require('moment')


var nf = new Intl.NumberFormat();

class CaseTypeStat extends React.Component {

  state = {
    statsData: []
  }

  options = {
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

  getPercentageChange = (oldNumber, newNumber) => {
    var decreaseValue = oldNumber - newNumber;
    return -(decreaseValue / oldNumber) * 100;
  }

  // async componentDidMount() {
  //   let statsData = await this.getStatData();
  //   // hehreeeee
  //   console.log('hereeeeeeeeee')
  //   this.setState({ statsData: statsData })
  //   return statsData
  // }

  async componentWillReceiveProps({props}) {
    console.log('recieve propssss', this.props, this.state)
    this.setState({...this.state, props})
    let statsData = await this.getStatData();
    // hehreeeee
    
    this.setState({ statsData: statsData })
  }

  async getStatData() {
    let { countryFilter } = this.props;
    console.log('countryFilter', countryFilter);
    const result = await API.get('covidapi', `/casePoint/totalStat/${countryFilter === 'All' ? '' : countryFilter}`);
    //
    let statsData = [];
    for (let type of ['confirmed', 'recovered', 'death']) {
      let data = result.body.map(el => { return [moment(el.date).utc().format('YYYY-MM-DD'), el[type]]; });
      // percentage change in last 2 days
      let percentage = this.getPercentageChange(data[1][1], data[0][1]) || 0;
      let total = nf.format(data[0][1]);
      // reverse sort by oldest first
      data.reverse();
      statsData.push({
        data: data,
        name: type,
        value: total,
        percentage: Number(percentage).toFixed(2),
        increase: percentage >= 0,
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
    return statsData;
  }

  render() {

    // let { countryFilter } = this.props;
    
    // console.log('ssssssssss', countryFilter)

    return (
      <>
        {this.state.statsData.map((stats, idx) => (
          <Widget
            style={{ marginBottom: '10px' }} 
            removeMargin={true}
            key={idx}
            title={<Row>
              <Col xs={6}> <h5> {stats.name} {stats.value}</h5>
                <div className="d-flex align-items-start h3">
                  <h6>{stats.percentage}%</h6>
                  <i className={`la la-arrow-right ml-sm text-${stats.increase ? 'success' : 'danger'} 
                rotate-${stats.increase ? '315' : '45'}`} />
                </div>
              </Col>
            </Row>}
          >
            <HighchartsReact options={{
              ...this.options,
              series: [stats]
            }} />
          </Widget>
        ))}
      </>
    );
  }
}

export default CaseTypeStat;