<template>
  <div id="map-container"></div>
</template>

<script>
import AMap from 'AMap'
import Loca from 'Loca'

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const colors = ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];
      let map = new AMap.Map('map-container', {
        resizeEnable: true,
        zoom:16,
        mapStyle: 'amap://styles/grey',
        center: [126.678551,45.715461]
      });

      let loca = Loca.create(map);

      let testData = [
        {"lnglat":[
          [126.674535,45.712804],
          [126.677925,45.71649],
          [126.681422,45.715666],
          [126.674535,45.712804]
        ]}
      ]

      var layer = Loca.visualLayer({
        container: loca,
        type: 'polygon',
        shape: 'polygon'
      });

      layer.setData(testData, {
        // type: 'json',
        lnglat: 'lnglat'
      })

      layer.setOptions({
        // style: {
        //   radius: 10,
        //   fill: 'red',
        //   stroke: 'gray',
        //   lineWidth: 1,
        //   opacity: 0.3
        // }
        style: {
          lineWidth: 0.5,
          stroke: '#ECEFF1',
          opacity: 0.3,
          fill: function (res) {
            var index = res.index;
            return colors[index % colors.length];
          },
          fillOpacity: 0.5
        }
      })

      // 渲染
      layer.render();
    }
  }
}
</script>

<style>
#map-container {
  height: calc(100vh - 62px);
  width:100%;
}
</style>
