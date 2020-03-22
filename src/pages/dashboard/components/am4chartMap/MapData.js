var nf = new Intl.NumberFormat();

export default function getMapData(caseDataPoints) {

  let confirmedDataPoints = caseDataPoints['Confirmed']
  let mapData = []

  let sortedDates = Object.keys(confirmedDataPoints[0]['dataPoints']).sort((a, b) => a - b);
  let lastDate = sortedDates.pop()
  confirmedDataPoints.forEach(el => {

    if (el['dataPoints'][lastDate] !== 0) {
      let tooltip = el['provinceState'] === 'n/a' ? el['countryRegion'] : `${el['provinceState']}, ${el['countryRegion']}`
      mapData.push({
        latitude: parseFloat(el['lat']),
        longitude: parseFloat(el['long']),
        size: Math.max(0.5, Math.log(el['dataPoints'][lastDate]) * Math.LN10 / 10) * 3,
        tooltip: `${tooltip} ${nf.format(el['dataPoints'][lastDate])}`,

      })
    }

  })
  return mapData
}