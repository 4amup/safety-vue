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

export default {
  data() {
    return {
      testData: [
        {"lnglat":[
          [126.674535,45.712804],
          [126.677925,45.71649],
          [126.681422,45.715666]
        ]},
        {"lnglat":[
          [126.678611,45.718701],
          [126.679298,45.717607],
          [126.681648,45.71703],
          [126.681379,45.718783]
        ]},
      ]
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
      if(this.editing) {
        map.setMapStyle('amap://styles/blue'); // 设置地图特殊样式，提示可以开始划范围了
        let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件
        map.plugin(mouseTool)
        mouseTool.polygon()

        let drawOver =  AMap.event.addListener(mouseTool,'draw',function(e){ //监听画完事件
          let p = e.obj.getPath() //获取刚刚画完的多边形路径
          console.log(p)

          // 准备采用vuex来将数据在不同组件中间共享
          // 返回特定的路径属性就可以
          // 参考leancloud链接https://leancloud.cn/docs/leanstorage_guide-swift.html#hash-916037211
        })


      } else {
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

      // let testData = [
      //   {"lnglat":[
      //     [126.674535,45.712804],
      //     [126.677925,45.71649],
      //     [126.681422,45.715666],
      //     [126.674535,45.712804]
      //   ]}
      // ]

      let layer = Loca.visualLayer({
        container: loca,
        type: 'polygon',
        shape: 'polygon'
      });

      layer.setData(this.testData, {
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
