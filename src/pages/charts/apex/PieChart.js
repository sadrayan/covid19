import React, { Component } from 'react';
import Widget from '../../../components/Widget';
import HighchartsReact from 'highcharts-react-official'


class PieChart extends Component {

    getChartOptions() {
        const { data } = this.props;
        return {
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
            colors: data['backgroundColor'],
            series: [{
                name: 'Cases',
                colorByPoint: true,
                data: data['data']
            }]
        }
    }

    render() {
        return (
            <Widget
                title={<h5>To date <span className="fw-semi-bold">Cases</span></h5>}
                close collapse
            >
                <HighchartsReact options={this.getChartOptions()} />
            </Widget>
        );
    }
}

export default PieChart;
