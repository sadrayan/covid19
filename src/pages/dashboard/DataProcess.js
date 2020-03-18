import processDataType from './utils'
var nf = new Intl.NumberFormat();

export function getCountryList (caseDataPoints) {
    let confirmedDataPoints = caseDataPoints['CONFIRMED']
    let caseCountry = new Map()

    let sortedDates = Object.keys(confirmedDataPoints[0]['dataPoints']).sort((a, b) => a - b);
    let lastDate = sortedDates.pop()
    confirmedDataPoints.forEach(el => {
      if (caseCountry.has(el['countryRegion']))
        caseCountry.set(el['countryRegion'], caseCountry.get(el['countryRegion']) + el['dataPoints'][lastDate])
      else
        caseCountry.set(el['countryRegion'], el['dataPoints'][lastDate])
    })

    // sort by case confirmed
    caseCountry = new Map([...caseCountry.entries()].sort((a, b) => b[1] - a[1]));

    let selectDefaultData = []
    caseCountry.forEach( (val, key) => {
        selectDefaultData.push({ value: key, label: `${key}  ${nf.format(val)}` }) 
    } )

    return selectDefaultData
  }

  export async function getLatestData () {
    const urlMap = {
      'CONFIRMED': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
      'RECOVERED': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
      'DEATH': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
    }


    let resultSet = {}
    for (let key in urlMap) {
      let result = await processDataType(key, urlMap[key])
      // console.log(`processed ${key} with ${result.recordList.length} number of data points`)
      resultSet[key] = result.recordList
    }
    console.log('in parent changing state', resultSet)
    return resultSet
    // this.setState({ caseDataPoints: resultSet })
  }

  const getPercentageChange = (oldNumber, newNumber) => {
    var decreaseValue = oldNumber - newNumber;
    return -(decreaseValue / oldNumber) * 100;
  }

  const applyFilter = (caseDataPoints) => {
    if (this.state.countryFilter === 'All')
      return caseDataPoints

    for (let key in caseDataPoints)
      caseDataPoints[key] = caseDataPoints[key].filter(datapoint => datapoint['countryRegion'] === this.state.countryFilter)

    console.log('applying filter', this.state.countryFilter, caseDataPoints)
    return caseDataPoints
  }

  const transformStats = () => {

    let caseDataPoints = this.state.caseDataPoints

    applyFilter(caseDataPoints)
    console.log(caseDataPoints)




    let smallStats = []
    let chartData = {
      labels: [],
      datasets: []
    }
    let pieData = {
      datasets: [
        {
          hoverBorderColor: "#ffffff",
          data: [],
          backgroundColor: [],
          borderColor: []
        }
      ],
      labels: Object.keys(caseDataPoints)
    }

    for (let key in caseDataPoints) {
      let data = []
      let sortedDates = Object.keys(caseDataPoints[key][0]['dataPoints']).sort((a, b) => a - b);


      sortedDates.forEach(caseDate => {
        let totalPerDay = caseDataPoints[key].map(datapoint => datapoint['dataPoints'][caseDate])
        data.push(totalPerDay.reduce((a, b) => a + b))
      })

      let percentage = getPercentageChange(data[data.length - 2], data[data.length - 1])
      smallStats.push(
        {
          label: key,
          value: nf.format(data[data.length - 1]),
          percentage: `${nf.format(percentage)}%`,
          increase: percentage >= 0,
          decrease: percentage < 0,
          chartLabels: sortedDates,
          attrs: { md: "4", sm: "6" },
          datasets: [
            {
              label: key,
              fill: "start",
              borderWidth: 1.5,
              backgroundColor: this.statsStyles[key]['backgroundColor'],
              borderColor: this.statsStyles[key]['borderColor'],
              data
            }
          ]
        }
      )

      chartData['labels'] = sortedDates.map(el => new Date(el).toLocaleDateString("en-US"))
      chartData['datasets'].push({
        label: key,
        fill: "start",
        data: data,
        backgroundColor: this.statsStyles[key]['backgroundColor'],
        borderColor: this.statsStyles[key]['borderColor'],
        pointBackgroundColor: "#ffffff",
        pointHoverBackgroundColor: this.statsStyles[key]['borderColor'],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3
      }
      )

      pieData['datasets'][0]['data'].push(data[data.length - 1])
      pieData['datasets'][0]['backgroundColor'].push(this.statsStyles[key]['backgroundColorDarker'])

    }

    this.setState({ smallStats: smallStats, chartData: chartData, pieData: pieData })
  }
