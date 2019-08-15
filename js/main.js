$(function (){
  // Declare a map variable: pass the map container id, set the center and the zoom level
  var map = L.map('map').setView([ -0.4223876953125,36.056884765625], 9);
  var city;
  var constituency;

  // var baseLayers = {};
  // var overlays = {};

  let layer_control = L.control.layers().addTo(map);

  // Add a tilelayer: provide the url and the attribution
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  $.getJSON('https://davincikab.github.io/leaflet-all/data/nakuru.geojson')
          .done(function(data){
            // let info = processData(data);
            plotFeature(data);
          })
  .fail(function(){
      console.log('Error during data loading');
  });

  function plotFeature(data){
      constituency =  L.geoJson(data,{
        style: style,
        onEachFeature:function (feature,layer) {
          layer.bindPopup('County: '+ feature.properties.County+" Sales "+feature.properties[2010]);
          layer.on({
            click:function(e){
              this.openPopup();
              // this.setStyle({fillColor:'yellow'});
            }
          });
        }
      }).addTo(map);
    // layer_control.addOverlay({'Const':constituency});

  }

  // Style the layer
  function style(feature) {
    return{
      color:'#00000040',
      fillColor:getColorByArea(feature.properties[2010]),
      fillOpacity:0.6,
      Opacity:0.6
    };
  }

  function getColorByArea(area){

    if(area < 400000){
      return '#fef0d9';
    }
    else if (area< 800000) {
      return '#fdcc8a';

    }else if(area < 1200000) {
      return '#fc8d59';

    }else if(area < 1600000) {
      return '#e34a33';

    }else {
    	return '#b30000';
    }

  }

function processData(data){
  var timestamps =[];
  let min = Infinity;
  let max = -Infinity;

  for(let feature in data.features){
    let properties = data.features[feature].properties;
    for (let attribute in properties){
      // Check the columns
      if(['objectid', 'Consituency', 'County','TOTAL'].indexOf(attribute) == -1){
        if ($.inArray(attribute,timestamps) === -1) {
          timestamps.push(attribute);
        }
        if (properties[attribute]<min) {
          min = properties[attribute]
        }
        if(properties[attribute] > max){
          max = properties[attribute]
        }
      }
    }

  }
  return{
    timestamps:timestamps,
    min:min,
    max:max
  }
}

$.getJSON('https://davincikab.github.io/leaflet-all/data/Sales.geojson')
        .done(function(data){
          console.log(data);
          let info = processData(data);
          createProportionalSymbol(info.timestamps, data);
          createLegend(info.min,info.max);
          createSlider(info.timestamps);
        })
.fail(function(){
    console.log('Error during data loading');
});

function changeStyle(e){
  let layer = e.target;
  layer.openPopup();
  layer.setStyle({fillColor:'yellow',color:'yellow'});
}

function resetPointStyle(e){
  let layer = e.target;
  layer.closePopup();
  layer.setStyle({fillColor:'grey',color:'grey'});
}
  
function createProportionalSymbol(timestamps, data){
    city = L.geoJson(data,{
      onEachFeature:function(feature, layer){
        layer.on('mouseover',changeStyle);
        layer.on('mouseout', resetPointStyle);
      },
      pointToLayer:function(feature, latlng){
        return L.circleMarker(latlng,{
          fillColor:'grey',
          color:'darkblue',
          fillOpacity:1
        });
      }
    }).addTo(map);

    updateProportionalSymbol(timestamps[0]);

}

function updateProportionalSymbol(timestamps){
  city.eachLayer(layer=>{
    let props = layer.feature.properties;
    let radius = calcPropRadius(props[timestamps]);

    let popContent = "<p><b>"+ String(props[timestamps])+
                    "  units</b></p>"+
                    "Consituency   "+props.Consituency+
                    "<i> in &nbsp"+ timestamps+"</i>";
  layer.setRadius(radius);
  layer.bindPopup(popContent,{offset:L.Point(0,-radius)});
  });
}

function calcPropRadius(value){
  // let scaleFactor = 16;
  // let area = value*scaleFactor;
  return ((value*2)/100000)+2;
}

function createLegend(min, max){
  function roundNumber(inNumber){
    return (Math.round(inNumber/10)*10)
  }

  let classes = [roundNumber(min), roundNumber((max-min)/2),roundNumber(max)];
  let legend = L.control({position:'bottomright'});
  legend.onAdd = function(map){
    let legendContainer = L.DomUtil.create('div','legend');
    let symbolContainer = L.DomUtil.create('div','symbolContainer');
    let legendCircle, lastRadius=0,currentRadius,margin;

    L.DomEvent.addListener(legendContainer,'mousedown', e=>{
      L.DomEvent.stopPropagation(e);
    });

    $(legendContainer).append("<h4 id='legendValue'>Periodical Sales</h4>");

    for (var i = 0; i < classes.length; i++) {
      legendCircle = L.DomUtil.create('div','legendCircle');
      currentRadius = calcPropRadius(classes[i]);

      margin = -currentRadius-lastRadius-2;
      $(legendCircle).attr("style","width:"+currentRadius*2+"px;height:"+currentRadius*2+"px; margin-left:"+margin+"px;");
      $(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");

      $(symbolContainer).append(legendCircle);

      lastRadius = currentRadius;
    }

    $(legendContainer).append(symbolContainer);
    return legendContainer;
  }

  legend.addTo(map);
}

function createSlider(timestamps){
  let slider_control = L.control({position:'bottomleft'});

  slider_control.onAdd = function(map){
    let slider = L.DomUtil.create('input','range-slider');

    L.DomEvent.addListener(slider,'mousedown', e=>{
      L.DomEvent.stopPropagation(e);
    });

    $(slider)
      .attr({
          'type':'range',
          'max':timestamps[timestamps.length-1],
          'min':timestamps[0],
          'step':3})
        .on('input change', function(){
        updateProportionalSymbol($(this).val().toString());
        $('.temporal_legend').text($(this).val().toString());
    });

    return slider;
  }

  slider_control.addTo(map);
  createTemporaLegend(timestamps[0]);
}

function createTemporaLegend(starttime){
   let temporal_legend = L.control({position:'bottomleft'});

   temporal_legend.onAdd = function(map){
     let output = L.DomUtil.create('output','temporal_legend');

     $(output).text(starttime);
     return output;
   }

   temporal_legend.addTo(map);
}


  //Reset View control
  let resetview = L.control({position:'topleft'});

  resetview.onAdd = function(map){
    let div = L.DomUtil.create('button','reset-view');
    div.innerHTML += 'R'
    div.addEventListener('click',function(e){
      map.setView([ -0.4223876953125,36.056884765625], 9);
    });

    return div;
  };

  resetview.addTo(map);

 L.circleMarker(map.getCenter()).addTo(map);

//  // L.control.layers({'Sales Centroids':city,'Consituency Sales':constituency}).addTo(map);
});
