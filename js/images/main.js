// Declare a map variable: pass the map container id, set the center and the zoom level
let map = L.map('map').setView([ -0.4223876953125,36.056884765625], 9);

// Add a tilelayer: provide the url and the attribution
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

var area_list = [];
var carea_list = [];
let table = document.querySelector('table');
table.innerHTML +='<tr><th>Color</th><th>Constituency</th><th>Area</th></tr>';

// Return a color depending on the area()
['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000']
function getColorByArea(area){
	
  if(area < 440000000){
    return '#fef0d9';
  }
  else if (area< 739771562.215) {
    return '#fdcc8a';

  }else if(area < 1039524667.943) {
    return '#fc8d59';

  }else if(area < 1373676003.03) {
    return '#e34a33';
    
  }else {
  	return '#b30000';
  }

}

// Style the layer
function style(feature) {
  return{
    color:'#00000040',
    fillColor:getColorByArea(feature.properties.st_area_sh),
    fillOpacity:1,
    Opacity:0.6
  };
}

// Zoom to a feature on click
function zoomTo(e) {
  map.fitBounds(e.layer.getBounds());
}

// Change feature stylinf on mouse over
function changeStyle(e) {
  e.layer.setStyle({
    fillColor:'#345f4f10',
    color:'red'
  });
}

// Reset layer style if mouse out of layer
function resetLayerStyle(e){
	nakcty.resetStyle(e.target);
}


// Add event, different styling on each layer
function dkut(feature,layer) {
  // Events: click, mouseover, mouseout
  layer.on('click',function(e){
    zoomTo(e);
    layer.bindPopup("<div class='card'> <div class='card-head h5'>"+
              feature.properties.const_nam+ "</div><hr><div class='card-body'>Area:&nbsp"+
              feature.properties.st_area_sh+
              "<br>County::&nbsp"+feature.properties.county_nam+
              "<br>County::&nbsp"+feature.properties.county_nam+
              "<br>County::&nbsp"+feature.properties.county_nam+
              "</div></div>").openPopup();
     
  });

  layer.on('mouseover',changeStyle);
  layer.on('mouseout',resetLayerStyle);
  layer.on('load', function(){

  });

  carea_list.push({name:feature.properties.const_nam, y:feature.properties.st_area_sh});

  area_list.push(feature.properties.st_area_sh);
  createTable(feature);
}


// Added layer styling and event onEachFeature: function used style and dkut 
let nakcty = L.geoJson([nakuru],{style:style,onEachFeature:dkut});
map.addLayer(nakcty);

// Refactor the code (DRY)
let select_const = document.querySelector('#name_filter');
let select_constbyarea = document.querySelector('#area_filter');

carea_list.forEach(value=>{
  select_const.innerHTML+='<option>'+value.name+'</option>';
  select_constbyarea.innerHTML+='<option>'+value.y+'<option>';
});

// 
function nameFilter(value){
  carea_list=[];
  area_list = [];
  map.eachLayer(layer=>{
    if (layer instanceof L.LayerGroup){
      map.removeLayer(layer);
      table.innerHTML='';

      L.geoJson([nakuru],{style:style,onEachFeature:dkut,
        filter:function(feature){
          if(feature.properties.const_nam == value | feature.properties.st_area_sh <= value){
            return true;
            
          }
      }}).addTo(map);
    }
  });
  
  let mediaoutput = document.querySelector('.stats');
  mediaoutput.innerHTML = '';
  basicStats(area_list);
}

// // A tabular attrbute table with edit options/ add column/ delete column/zoomTo feature

function createTable(feature){
  var row = document.createElement('tr');
  
  row.innerHTML+='<td>'+'<i style="background:'
  +getColorByArea(feature.properties.st_area_sh)+
' " >&nbsp;&nbsp;</i>'+'</td><td>'+feature.properties.const_nam+'</td><td>'+feature.properties.st_area_sh+'</td>';
  document.querySelector('table').appendChild(row);
}

// A legend showing to guide the user: Additional feature
let legend = L.control({
	position:'bottomleft'
});

legend.onAdd = function(map){
  let div =  L.DomUtil.create('div','legend');
  let button = L.DomUtil.create('button','btn collapsible');
  button.innerHTML='Legend';

  let content = L.DomUtil.create('div','content');

  div.appendChild(button);
	
	let labels  = ['lte 440018461','lte 739771563','lte 1039524664' ,'lte 1339277766','lte 1639030868'];
  content.innerHTML = '<p>Area of the polygons <br>less than the given value</p>';
  
	for (let i=0; i<labels.length;i++){
		content.innerHTML+='<i style="background:'
				+getColorByArea(labels[i].slice(4))+
		' " >&nbsp;&nbsp;</i>&nbsp;&nbsp;'+labels[i]+'<br>';
  }
  
  div.appendChild(content);

  button.addEventListener('click', function(e){
    e.stopPropagation();
    button.classList.toggle('active');
    
			if(content.style.maxHeight){
					content.style.maxHeight = null;
				}else{
					content.style.maxHeight = content.scrollHeight+"px";
				}
  });

	return div;
}

// Add legend to the map
legend.addTo(map);

// map.on('click',function(e){
// 	console.log(e.latlng);
// });

basicStats(area_list);
// Find the minimun, max, sum, mean and std of the area
function basicStats(area_list){
  let stat = [area_list.sort()[0], area_list.sort()[area_list.length-1],
            area_list.reduce((a,b)=>a+b), 
            area_list.reduce((a,b)=>a+b)/area_list.length
          ];

  let stat_labels = ['Minimum Area', 'Maximum Area','Total Area','Mean Area'];

  let mediaoutput = document.querySelector('.stats');

  for(let i=0; i<stat.length; i++){
    let stat_col = document.createElement('div');
                  stat_col.setAttribute('class','col-md-3 col-sm-6');
    let media_head = document.createElement('div');
                    media_head.setAttribute('class','media-heading');
    let media_body = document.createElement('div');
                  media_body.setAttribute('class','media-body');

    media_head.innerHTML += `<h5>${stat_labels[i]}</h5>`;
    media_body.innerHTML += `<h5>${stat[i]} m sq</h5>`;

    stat_col.appendChild(media_head);
    stat_col.appendChild(media_body);

    mediaoutput.appendChild(stat_col);
  }
}

//Reset View control
let resetview = L.control({position:'topleft'});

resetview.onAdd = function(map){
  let div = L.DomUtil.create('button','btn reset-view');

  div.innerHTML += '<p class="reset-view-p">R</p>'
  div.addEventListener('click',function(e){
    map.setView([ -0.4223876953125,36.056884765625], 9);
  });

  return div;
};

resetview.addTo(map);

/*
TODO:
	implement a dynamic: 
		1. Symbology(color and classification schemes, opacity).
		2. Filtering(specify a column and a condition)
		3. Identifier: 
    4. Interactivity: Suggest any other
    5. Tabular popup and a tabular attribute table editable
*/

// Add HighCharts: piechart, bargraph and line graph(pop data)
// Lazy load, promises and workers
