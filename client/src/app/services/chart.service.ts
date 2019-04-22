import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';


@Injectable()
export class ChartService {

  constructor() { }

  getChart(){
    Chart.pluginService.register({
      beforeRender: function (chart) {
          if (chart.config.options.showAllTooltips) {
              // create an array of tooltips
              // we can't use the chart tooltip because there is only one tooltip per chart
              chart.pluginTooltips = [];
              chart.config.data.datasets.forEach(function (dataset, i) {
                  chart.getDatasetMeta(i).data.forEach(function (sector, j) {
                      chart.pluginTooltips.push(new Chart.Tooltip({
                          _chart: chart.chart,
                          _chartInstance: chart,
                          _data: chart.data,
                          _options: chart.options.tooltips,
                          _active: [sector]
                      }, chart));
                  });
              });
      
              // turn off normal tooltips
              chart.options.tooltips.enabled = false;
          }
      },
        afterDraw: function (chart, easing) {
          if (chart.config.options.showAllTooltips) {
              // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
              if (!chart.allTooltipsOnce) {
                  if (easing !== 1)
                      return;
                  chart.allTooltipsOnce = true;
              }
      
              // turn on tooltips
              chart.options.tooltips.enabled = true;
              Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
                  tooltip.initialize();
                  tooltip.update();
                  // we don't actually need this since we are not animating tooltips
                  tooltip.pivot();
                  tooltip.transition(easing).draw();
              });
              chart.options.tooltips.enabled = false;
          }
        },
      beforeDraw: function (chart) {
        if (chart.config.options.elements.center) {
          //Get ctx from string
          var ctx = chart.chart.ctx;
    
          //Get options from the center object in options
          var centerConfig = chart.config.options.elements.center;
          var fontStyle = centerConfig.fontStyle || 'Arial';
          var txt = centerConfig.text;
          var color = centerConfig.color || '#000';
          var sidePadding = centerConfig.sidePadding || 20;
          var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
          //Start with a base font of 30px
          ctx.font = "30px " + fontStyle;
    
          //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
          var stringWidth = ctx.measureText(txt).width;
          var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
    
          // Find out how much the font can grow in width.
          var widthRatio = elementWidth / stringWidth;
          var newFontSize = Math.floor(30 * widthRatio);
          var elementHeight = (chart.innerRadius * 2);
    
          // Pick a new font size so it will not be larger than the height of label.
          var fontSizeToUse = Math.min(newFontSize, elementHeight);
    
          //Set font settings to draw it correctly.
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.font = fontSizeToUse+"px " + fontStyle;
          ctx.fillStyle = color;
    
          //Draw text in center
          ctx.fillText(txt, centerX, centerY);
        }
      }
    });
  }

}
