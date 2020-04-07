import React, { PureComponent } from 'react';
import { Col, Row, FormGroup, Label, Input } from 'reactstrap';
import Widget from "../../../../components/Widget/Widget";
import HighchartsReact from 'highcharts-react-official'
import config from '../config.js';
import { API } from 'aws-amplify'
import statsStyles from './ChartStyles'
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
HighchartsMore(Highcharts);


const colors = config.chartColors;
const moment = require('moment')
var nf = new Intl.NumberFormat();

export default class ForecastChart extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      forecastType: 'confirmed',
      country: 'US',
      isRecieving: true,
      dailyForecast: []
    };
  }

  async componentDidMount() {

    await this.getCountryForecast();
    //filter by date
    this.getForecastDisplays();
    await this.getCountryChartData()
  }

  updateForecasts() {
    this.getForecastDisplays()
    this.getCountryChartData()
  }

  async getCountryForecast() {
    let { country } = this.state;
    const countryForecastData = await API.get('covidapi', `/casePoint/forecasts/${country}`);
    this.setState({ countryForecastData: countryForecastData });
  }

  getForecastDisplays() {
    let { countryForecastData } = this.state
    let filterByDate = countryForecastData.body.filter(el => moment(el.ds).isSameOrAfter(countryForecastData.lastUpdateDate));
    // defaulting to fbProphet now
    let forecastData = this.filterByModel(filterByDate);
    this.setState({ dailyForecast: forecastData });
    console.log(forecastData)
  }

  filterByModel(forecaseDataResult) {
    let filterByModel = forecaseDataResult.filter(el => el.model === 'fbProphet');
    let group = filterByModel.reduce((r, a) => {
      r[a.ds] = [...r[a.ds] || [], a];
      return r;
    }, {});
    let forecastData = [];
    for (let forecast in group) {
      forecastData.push({
        date: forecast,
        forecastNumber: group[forecast].filter(el => el.case_type === this.state.forecastType)[0]['y_hat'],
        y_hat_upper: group[forecast].filter(el => el.case_type === this.state.forecastType)[0]['y_hat_upper'],
        y_hat_lower: group[forecast].filter(el => el.case_type === this.state.forecastType)[0]['y_hat_lower'],
      });
    }
    return forecastData.reverse();
  }

  /**
   * called on ComponentDidMount and eath setState event. 
   */
  async getCountryChartData() {

    let { country, countryForecastData } = this.state
    let forecast = this.filterByModel(countryForecastData.body)
    forecast = forecast.reverse().slice(0, 30 + 5)
    console.log('forecastbycountry', forecast)
    let series = []

    ///
    const result = await API.get('covidapi', `/casePoint/totalStat/${country}`);

    let caseCountry = result.body.map(el => el[this.state.forecastType])

    caseCountry = caseCountry.slice(0, 30).reverse() // choose top most infected regions
    console.log(caseCountry)

    series.push({
      name: 'reported',
      data: caseCountry,
      zIndex: 1,
      marker: {
        lineWidth: 1,
      }
    })

    series.push({
      name: 'forecast',
      data: forecast.map(el => el.forecastNumber).reverse()
    })


console.log(forecast.map(el => [el.date, el.y_hat_lower, el.y_hat_upper]).reverse())
    series.push({
      name: 'Range',
      data: forecast.map(el => [el.date, el.y_hat_lower, el.y_hat_upper]).reverse(),
      type: 'arearange',
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors.blue,
      fillOpacity: 0.3,
      zIndex: 0,
      marker: {
        enabled: false
      }
    })

    let categories = forecast.map(el => moment(el.date).utc().format('YYYY-MM-DD'))

    console.log('categories', categories)


    let chartData = {
      credits: {
        enabled: false
      },
      colors: [statsStyles[this.state.forecastType]['borderColor'], colors.gray],
      chart: {
        backgroundColor: 'transparent',
        type: 'line',
        options3d: {
          enabled: true,
          alpha: 10,
          beta: 25,
          depth: 70
        },
        zoomType: 'y',

      },
      exporting: {
        enabled: false
      },
      title: false,
      legend: {
        itemStyle: {
          color: colors.textColor
        }
      },
      subtitle: {
        text: 'Next 5 days forecast',
        style: {
          color: colors.textColor
        }
      },
      plotOptions: {
        column: {
          depth: 25
        }
      },
      xAxis: {
        categories: categories,
        labels: {
          skew3d: true,
          style: {
            fontSize: '10px',
            color: colors.textColor
          }
        },
        gridLineColor: colors.gridLineColor
      },
      yAxis: {
        title: {
          text: null
        },
        min:0,
        gridLineColor: colors.gridLineColor
      },
      series: series
    }

    if (this.state.forecastType === 'confirmed'){
      chartData['yAxis']['tickInterval'] = 50000 
      console.log('hssssssssssss')
    }
      
    
      this.setState({ chartData: chartData, isReceiving: false })

    return chartData
  }

  render() {
    const { isReceiving } = this.state;

    return (
      <Widget
        title={<h5>Countries <span className="fw-semi-bold">COVID-19 Cases</span></h5>}
        fetchingData={isReceiving}
      >
        <Row md="12" className="justify-content-center" >

          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="confirmInput" name="forecastType" value="confirmed" defaultChecked
              onChange={(event) => { this.setState({ forecastType: event.target.value }, this.updateForecasts) }} />
            <Label for="confirmInput">Confirmed</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="recoverInput" name="forecastType" value="recovered"
              onChange={(event) => { this.setState({ forecastType: event.target.value }, this.updateForecasts) }} />
            <Label for="recoverInput">Recovered</Label>
          </FormGroup>
          <FormGroup size='sm' style={{ marginLeft: '10px' }} className="radio abc-radio">
            <Input type="radio" id="deathInput" name="forecastType" value="deaths"
              onChange={(event) => { this.setState({ forecastType: event.target.value }, this.updateForecasts) }} />
            <Label for="deathInput">Death</Label>
          </FormGroup>

        </Row>

        <Row className="d-flex flex-wrap justify-content-between">
          {this.state.dailyForecast.map(({ date, forecastNumber }) => (
            <Col xs={6} xl={2} md={6} key={date}>
              <Widget
                style={{ backgroundImage: `linear-gradient(${statsStyles[this.state.forecastType]['backgroundColorFade']}, ${statsStyles[this.state.forecastType]['backgroundColorLighter']})` }}
                className="text-white"
                fetchingData={isReceiving}
              >

                <div style={{ textAlign: 'center', marginTop: '-5px' }}>
                  <h3 className={'fw-semi-bold'}> {nf.format(forecastNumber)} </h3>
                </div>

                <footer>
                  <h6 className="fw-semi-bold" style={{ textAlign: 'center', marginBottom: '-5px' }}>{date}</h6>
                </footer>
              </Widget>
            </Col>
          ))}
        </Row>

        <HighchartsReact options={this.state.chartData} />
      </Widget>
    );
  }
}