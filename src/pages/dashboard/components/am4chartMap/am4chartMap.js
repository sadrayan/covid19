import React, { Component } from 'react';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import getMapData from './MapData';
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

import s from './am4chartMap.module.scss';

class Am4chartMap extends Component {

  componentDidUpdate() {
    let map = am4core.create("map", am4maps.MapChart);
    map.geodata = am4geodata_worldLow;
    map.percentHeight = 90;
    map.dy = 10;
    map.projection = new am4maps.projections.Miller();
    let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    map.homeZoomLevel = 1;
    // Exclude Antartica
    polygonSeries.exclude = ["AQ"];

    map.zoomControl = new am4maps.ZoomControl();
    map.zoomControl.layout = 'horizontal';
    map.zoomControl.align = 'left';
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
    polygonTemplate.stroke = am4core.color("#6979C9")

    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#354D84");

    let citySeries = map.series.push(new am4maps.MapImageSeries());
    citySeries.data = getMapData(this.props.caseDataPoints);
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

  render() {
    return (
      <div className={s.mapChart}>
        <div className={s.map} id="map">
          <span>Alternative content for the map</span>
        </div>
      </div>
    );
  }
}

export default Am4chartMap;
