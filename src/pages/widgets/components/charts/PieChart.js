import React, { Component } from 'react';
import Widget from '../../../../components/Widget/Widget';
import HighchartsReact from 'highcharts-react-official'
import statsStyles from './ChartStyles'
import { API } from 'aws-amplify'
 
class PieChart extends Component {

    state = {}

    async componentDidMount() {
      // call first time with All
      await this.getStatData('All');
    }
  
    async getStatData(countryFilter) {

        const result = await API.get('covidapi', `/casePoint/totalStat/${countryFilter === 'All' ? '' : countryFilter}`);

        let pieData = {
            data: [],
            labels: [],
            backgroundColor: []
        }


        result.body.forEach(el => {
            el.active = el.confirmed - el.recovered - el.deaths
        })
        for (let type of ['active', 'recovered', 'deaths']) {
            let data = result.body.map(el => { return el[type] });
            pieData['data'].push({
                name: type,
                y: data[0]
            })
            pieData['backgroundColor'].push(statsStyles[type]['rgb'])
            pieData['labels'].push(type)
        }
    
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
                style={{ textTransform : 'capitalize'}}
                close collapse
            >
                <HighchartsReact options={this.state.statsData} />
            </Widget>
        );
    }
}

export default PieChart;
