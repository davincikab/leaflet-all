let prop_obj = [];
let keys = [];


function getKey(){
    return 
}

function getFaceColor(obj, key='st_area_sh'){
    if(key == 'st_area_sh'){
        return obj[key]< 739771562.215?'#a7191c':'#bdae61';
       
    }
    else{
        return obj[key]< 739771562.215?'#d7191c':'#fdae61';
    }
    
}

function stylefeature(feature){
   
    return {
        fillColor:getFaceColor(feature.properties),
        fillOpacity:0.8
    };
}

function onEachFeature(feature,layer){
    prop_obj.push(feature.properties);
}

var nakuru_town = L.geoJson([nakuru],{style:stylefeature,onEachFeature:onEachFeature});
map.addLayer(nakuru_town);


let layer_control = L.control.layers({'Nakuru':nakcty,'Nakuru Town':nakuru_town}).addTo(map);


console.log(Object.keys(prop_obj[0]));

let options = document.querySelector('#col_value')
Object.keys(prop_obj[0]).forEach(k =>{
    options.innerHTML+='<option>'+k+'</option>';
});

function attributeVisual(value){
  
    let new_layer;
    
    map.eachLayer(layer=>{
        if (layer instanceof L.LayerGroup){
          map.removeLayer(layer);
          carea_list=[];
            new_layer= L.geoJson([nakuru],{
                style: function(feature){
                    return {
                        fillColor: getFaceColor(feature.properties, key=value),
                        fillOpacity:0.8
                    };
                },
                onEachFeature: function(feature, layer){
                  carea_list.push({name:feature.properties.const_nam, y:feature.properties[value]});
                }
            }).addTo(map);
        }
   
    });
    
  
    plot(carea_list);
    
}
