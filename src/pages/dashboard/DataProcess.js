import processDataType from './utils'
var nf = new Intl.NumberFormat();

let statsStyles = {
    "Confirmed": {
        backgroundColor: "rgba(255,180,0,1)",
        backgroundColorLighter: "rgba(255,180,0,0.8)",
        backgroundColorFade: "rgba(255,180,0,0)",
        borderColor: "rgb(255,180,0)",
        rgb: '#ffb400'
    },
    "Recovered": {
        backgroundColor: "rgba(23,198,113,1)",
        backgroundColorLighter: "rgba(23,198,113,0.8)",
        backgroundColorFade: "rgba(23,198,113,0)",
        borderColor: "rgb(23,198,113)",
        rgb: '#14b265'
    },
    "Death": {
        backgroundColor: "rgba(255,65,105,1)",
        backgroundColorLighter: "rgba(255,65,105,0.8)",
        backgroundColorFade: "rgba(255,65,105,0)",
        borderColor: "rgb(255,65,105)",
        rgb: '#ff4169'
    }
}

export function getCountryList(caseDataPoints) {
    let confirmedDataPoints = caseDataPoints['Confirmed']
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

    let selectDefaultData = [{
        value: 'All',
        label: 'All'
    }]
    caseCountry.forEach((val, key) => {
        selectDefaultData.push({
            value: key,
            label: `${key}  ${nf.format(val)}`
        })
    })

    return selectDefaultData
}

export async function getLatestData() {
    const urlMap = {
        'Confirmed': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv',
        'Death': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
    }

    let resultSet = {}
    for (let key in urlMap) {
        let result = await processDataType(key, urlMap[key])
        result.recordList['colors'] = statsStyles[key]
        resultSet[key] = result.recordList
    }

    return resultSet
}

const getPercentageChange = (oldNumber, newNumber) => {
    var decreaseValue = oldNumber - newNumber;
    return -(decreaseValue / oldNumber) * 100;
}

export function applyFilter(caseDataPoints, filter) {
    if (filter === 'All')
        return caseDataPoints

    let caseDataPointsTemp = {}

    for (let key in caseDataPoints)
        caseDataPointsTemp[key] = caseDataPoints[key].filter(datapoint => filter === datapoint['countryRegion'])

    return caseDataPointsTemp
}



export function generateData(caseDataPoints, filter) {
    let smallStats = []

    caseDataPoints = applyFilter(caseDataPoints, filter)

    for (let key in caseDataPoints) {
        let data = []
        let sortedDates = Object.keys(caseDataPoints[key][0]['dataPoints']).sort((a, b) => a - b);


        sortedDates.forEach(caseDate => {
            let totalPerDay = caseDataPoints[key].map(datapoint => datapoint['dataPoints'][caseDate])
            data.push([caseDate, parseInt(totalPerDay.reduce((a, b) => a + b))])
        })

        let percentage = getPercentageChange(data[data.length - 2][1], data[data.length - 1][1]) || 0

        smallStats.push({
            data: data,
            name: key,
            value: nf.format(data[data.length - 1][1]),
            percentage: nf.format(percentage),
            increase: percentage >= 0,
            color: statsStyles[key]['backgroundColor'],
            fillColor: {
                linearGradient: {
                    x1: 0,
                    x2: 0,
                    y1: 0,
                    y2: 1
                },
                stops: [
                    [0, statsStyles[key]['backgroundColorLighter']],
                    [1, statsStyles[key]['backgroundColorFade']]
                ]
            },
            type: 'areaspline',
            fillOpacity: 1,
            lineWidth: 2
        });
    }
    return smallStats;
}

export function generatePieData(caseDataPoints, filter) {
    caseDataPoints = applyFilter(caseDataPoints, filter)

    let pieData = {
        data: [],
        labels: [],
        backgroundColor: []
    }

    for (let key in caseDataPoints) {
        let data = []
        let sortedDates = Object.keys(caseDataPoints[key][0]['dataPoints']).sort((a, b) => a - b);
        sortedDates.forEach(caseDate => {
            let totalPerDay = caseDataPoints[key].map(datapoint => datapoint['dataPoints'][caseDate])
            data.push(totalPerDay.reduce((a, b) => a + b))
        })
        pieData['data'].push({
            name: key,
            y: data[data.length - 1]
        })
        pieData['backgroundColor'].push(statsStyles[key]['rgb'])
        pieData['labels'].push(key)

    }

    return pieData
}

export function transformStats(caseDataPoints, filter) {

    applyFilter(caseDataPoints, filter)
    // console.log(caseDataPoints)


    let smallStats = []
    let chartData = {
        labels: [],
        datasets: []
    }
    let pieData = {
        datasets: [{
            hoverBorderColor: "#ffffff",
            data: [],
            backgroundColor: [],
            borderColor: []
        }],
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
        smallStats.push({
            label: key,
            value: nf.format(data[data.length - 1]),
            percentage: `${nf.format(percentage)}%`,
            increase: percentage >= 0,
            decrease: percentage < 0,
            chartLabels: sortedDates,
            attrs: {
                md: "4",
                sm: "6"
            },
            datasets: [{
                label: key,
                fill: "start",
                borderWidth: 1.5,
                backgroundColor: this.statsStyles[key]['backgroundColor'],
                borderColor: this.statsStyles[key]['borderColor'],
                data
            }]
        })

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
        })

        pieData['datasets'][0]['data'].push(data[data.length - 1])
        pieData['datasets'][0]['backgroundColor'].push(this.statsStyles[key]['backgroundColorDarker'])

    }

    this.setState({
        smallStats: smallStats,
        chartData: chartData,
        pieData: pieData
    })
}