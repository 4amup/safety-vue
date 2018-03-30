<template>
  <div>
    <p>当前{{this.editing ? '为' : '不处于'}}编辑状态</p>
    <div id="map-container"></div>
  </div>
</template>

<script>
import AMap from 'AMap'
import Loca from 'Loca'
// 共享一个map实例
let map;
let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件

export default {
  data() {
    return {

    }
  },
  props: [
    "editing"
  ],
  mounted() {
    this.init()
  },
  watch: {
    editing (n, o) {
      console.log('change')
      if(this.editing) {
        // let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件

        map.plugin(mouseTool)
        map.setMapStyle('amap://styles/blue'); // 设置地图特殊样式，提示可以开始划范围了

        mouseTool.polygon();
      }else{
        map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
      }
    }
  },
  methods: {
    init() {
      let colors = ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"]
      map = new AMap.Map('map-container', {
        resizeEnable: true,
        zoom:16,
        showIndoorMap: false,
        zooms: [16, 20],
        mapStyle: 'amap://styles/grey',
        center: [126.678551,45.715461]
      });


      let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件
      map.plugin(mouseTool)

      // if(this.editing) {
      //   map.setMapStyle('amap://styles/dark'); // 设置地图特殊样式，提示可以开始划范围了
      //   mouseTool.polygon();
      // }


      // 限制地图显示区域
      AMap.Bounds()
      map.setLimitBounds(map.getBounds())

      let loca = Loca.create(map);

      let testData = [
        {"lnglat":[
          [126.674535,45.712804],
          [126.677925,45.71649],
          [126.681422,45.715666],
          [126.674535,45.712804]
        ]}
      ]

      let layer = Loca.visualLayer({
        container: loca,
        type: 'polygon',
        shape: 'polygon'
      });

      layer.setData(testData, {
        // type: 'json',
        lnglat: 'lnglat'
      })

      layer.setOptions({
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
