import React, { Component } from 'react';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_usaLow from "@amcharts/amcharts4-geodata/usaLow";
import s from './am4chartMap.module.scss';
import Widget from '../../../../components/Widget';

import { API } from 'aws-amplify'

var nf = new Intl.NumberFormat();

class Am4chartMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapData: [],
      caseDataPoints: []
    }

  }

  async componentDidMount() {
    // fetch from DB - data is in geopoint format
    const result = await API.get('covidapi', '/casePoint/mapCasePoint');
    this.setState({ caseDataPoints: result.body })
    // transform map data
    this.getMapData('All')

    let map = am4core.create("map", am4maps.MapChart);
    map.percentHeight = 90;
    map.dy = 10;
    let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    map.homeZoomLevel = 1.2;
    // Exclude Antartica
    polygonSeries.exclude = ["AQ"];
    map.zoomControl = new am4maps.ZoomControl();
    map.zoomControl.layout = 'horizontal';
    map.zoomControl.align = 'right';
    map.zoomControl.valign = 'bottom';
    map.zoomControl.dy = -10;
    map.zoomControl.contentHeight = 20;
    map.zoomControl.minusButton.background.fill = am4core.color("#C7D0FF");
    map.zoomControl.minusButton.background.stroke = am4core.color("#6979C9");
    map.zoomControl.minusButton.label.fontWeight = 600;
    map.zoomControl.minusButton.label.fontSize = 22;
    map.zoomControl.minusButton.scale = .75;
    map.zoomControl.minusButton.label.scale = .75;
    map.zoomControl.plusButton.background.fill = am4core.color("#C7D0FF");
    map.zoomControl.plusButton.background.stroke = am4core.color("#6979C9");
    map.zoomControl.plusButton.label.fontWeight = 600;
    map.zoomControl.plusButton.label.fontSize = 22;
    map.zoomControl.plusButton.label.align = "center";
    map.zoomControl.plusButton.scale = .75;
    map.zoomControl.plusButton.label.scale = .75;
    map.zoomControl.plusButton.dx = 5;
    let plusButtonHoverState = map.zoomControl.plusButton.background.states.create("hover");
    plusButtonHoverState.properties.fill = am4core.color("#354D84");
    let minusButtonHoverState = map.zoomControl.minusButton.background.states.create("hover");
    minusButtonHoverState.properties.fill = am4core.color("#354D84");
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.fill = am4core.color("#474D84");
    polygonTemplate.stroke = am4core.color("#6979C9");
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#354D84");
    this.setState({ 'map' : map })
  }

  componentDidUpdate() {
    // am4core.disposeAllCharts();
    let { map } = this.state
    
    // first time around map is not ready, pass
    if (!map)
      return

    if (this.props.countryFilter === 'US') {
      map.geodata = am4geodata_usaLow;
      map.projection = new am4maps.projections.AlbersUsa();
    } else {
      map.geodata = am4geodata_worldLow;
      map.projection = new am4maps.projections.Miller();
    }  

    // to remove the plotted points and render country filter
    if (map.series.length > 1) {
      map.series.removeIndex(1).dispose();
    }

    let citySeries = map.series.push(new am4maps.MapImageSeries());
    citySeries.data = this.state.mapData
    citySeries.dataFields.value = "size";

    let cityTemplate = citySeries.mapImages.template;
    cityTemplate.nonScaling = true;
    cityTemplate.propertyFields.latitude = "latitude";
    cityTemplate.propertyFields.longitude = "longitude";
    cityTemplate.fill = am4core.color("#bf7569");
    cityTemplate.strokeOpacity = 0;
    cityTemplate.fillOpacity = 0.75;
    cityTemplate.tooltipPosition = "fixed";

    let circle = cityTemplate.createChild(am4core.Circle);
    circle.fill = am4core.color("rgba(255,65,105,0.8)");
    circle.strokeWidth = 0;

    let circleHoverState = circle.states.create("hover");
    circleHoverState.properties.strokeWidth = 1;
    circle.tooltipText = '{tooltip}';
    circle.propertyFields.radius = 'size';

    this.map = map;
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.dispose();
    }
  }

  getMapData(countryFilter) {
    let { caseDataPoints } = this.state
    // for performance, only show geo points with 50 or more confirmed cases
    
    caseDataPoints = caseDataPoints.filter(el => el.intensity >= 5000)

    if (countryFilter !== 'All') {
      caseDataPoints = caseDataPoints.filter(el => el.countryRegion === countryFilter)
    }
      

    // remove points that fall outside of map
    if (countryFilter === 'US') {
      caseDataPoints = caseDataPoints.filter(el => el.geopoint.coordinates[0] !== 0)
      caseDataPoints = caseDataPoints.filter(el => el.combinedKey.indexOf('Virgin Islands') === -1)
      caseDataPoints = caseDataPoints.filter(el => el.combinedKey.indexOf('Puerto Rico') === -1)
      caseDataPoints = caseDataPoints.filter(el => el.combinedKey.indexOf('Guam') === -1)
    }

    let mapData = caseDataPoints.map(casePoint => {
      return {
        longitude: parseFloat(casePoint.geopoint.coordinates[0]),
        latitude: parseFloat(casePoint.geopoint.coordinates[1]),
        size: Math.max(0.5, Math.log(casePoint.intensity) * Math.LN10 / 10) * 3,
        tooltip: `${casePoint.combinedKey} ${nf.format(casePoint.intensity)}`,
      }
    })

    this.setState({ mapData: mapData })
    return mapData
  }

  render() {
    return (
      <Widget className="bg-transparent">
        <div className={s.mapChart}>
          <div className={s.map} id="map">
            <span>Loading content for the map</span>
          </div>
        </div>
      </Widget>
    );
  }
}

export default Am4chartMap;
