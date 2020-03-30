import React, { Component } from 'react';
import Widget from '../../../../components/Widget/Widget';
import HighchartsReact from 'highcharts-react-official'
import statsStyles from './ChartStyles'
import { API } from 'aws-amplify'
const moment = require('moment')
 
class PieChart extends Component {

    state = {}

    async componentDidMount() {
      // call first time with All
      await this.getStatData('All');
    }
  
    async getStatData(countryFilter) {

        // const { data } = this.props;
        const result = await API.get('covidapi', `/casePoint/totalStat/${countryFilter === 'All' ? '' : countryFilter}`);

        let pieData = {
            data: [],
            labels: [],
            backgroundColor: []
        }

        for (let type of ['confirmed', 'recovered', 'deaths']) {
            let data = result.body.map(el => { return [moment(el.date).utc().format('YYYY-MM-DD'), el[type]] });
            // reverse sort by oldest first
            data.reverse();
            pieData['data'].push({
                name: type,
                y: data[data.length - 1][1]
            })
            pieData['backgroundColor'].push(statsStyles[type]['rgb'])
            pieData['labels'].push(type)

        }

        console.log(result.body)
    
        let statsData = {
            credits: {
                enabled: false
            },
            chart: {
                height: 350,
                backgroundColor: 'rgba(0,0,0,0)',
                type: 'pie'
            },
            title: false,
            exporting: {
                enabled: false
            },
            tooltip: {
                pointFormat: '{series.name}: <br>{point.percentage:.1f} %<br>total: {point.total}'
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
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>total: {point.total}',
                    },
                    showInLegend: false
                }
            },
            colors: pieData['backgroundColor'],
            series: [{
                name: 'Cases',
                colorByPoint: true,
                data: pieData['data']
            }]
        }
        this.setState({statsData : statsData})
    }

    render() {
        return (
            <Widget
                title={<h5>To date <span className="fw-semi-bold">Cases</span></h5>}
                close collapse
            >
                <HighchartsReact options={this.state.statsData} />
            </Widget>
        );
    }
}

export default PieChart;
