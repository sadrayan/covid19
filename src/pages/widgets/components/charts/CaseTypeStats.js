import React from 'react';
import { Row, Col } from 'reactstrap';
import HighchartsReact from 'highcharts-react-official'
import Widget from '../../../../components/Widget/Widget';
import Amplify, { API } from 'aws-amplify'
import awsconfig from "../../../../aws-exports"

Amplify.configure(awsconfig)

var nf = new Intl.NumberFormat();

class CaseTypeStat extends React.Component {
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

  async componentDidMount() {
    let {countryFilter} = this.props
    console.log('countryFilter', countryFilter)
    const data = await API.get('covidapi', '/casePoint/totalStat')


  }

  render() {

    // let { title, percentage, increase, data } = this.props;
    // var total = data[0]['data'] ? data[0]['data'][data[0]['data'].length - 1][1] : 0

    // title = <Row>
    //   <Col xs={6}> <h5> {title} {nf.format(total)}</h5>
    //     <div className="d-flex align-items-start h3">
    //       <h6>{Number(percentage).toFixed(2)}%</h6>
    //       <i className={`la la-arrow-right ml-sm text-${increase ? 'success' : 'danger'} 
    //       rotate-${increase ? '315' : '45'}`} />
    //     </div>
    //   </Col>
    // </Row>

    return (
      <>
        <Widget title={"title"}  style={{ marginBottom: '10px' }} removeMargin={true}>
              {/* <HighchartsReact  options={{
                ...this.options,
                series: data
              }} /> */}
              hjhjhj
        </Widget>
      </>
    );
  }
}

export default CaseTypeStat;
