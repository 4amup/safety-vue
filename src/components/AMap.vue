<template>
  <div>
    <p>当前{{area.editStatus ? '为' : '不处于'}}编辑状态</p>
    <div id="map-container"></div>
  </div>
</template>

<script>
import AMap from 'AMap'
// import Loca from 'Loca'
import { mapState, mapMutations, mapActions } from 'vuex'

// 共享一个map实例
let map

export default {
  data() {
    return {
      // area: null,
      testData: [
        {"path":[
          [126.674535,45.712804],
          [126.677925,45.71649],
          [126.681422,45.715666]
        ]},
        {"path":[
          [126.678611,45.718701],
          [126.679298,45.717607],
          [126.681648,45.71703],
          [126.681379,45.718783]
        ]},
        {"path":[
          [126.676389,45.712215],
          [126.679221,45.711429],
          [126.680433,45.713691],
          [126.677601,45.714403]
        ]}
      ]
    }
  },
  mounted () {
    this.init()
  },
  computed: mapState(['user', 'area']),
  watch: {
    'area.editStatus' () {
      // console.log(this.area.editStatus)
      let path

      if(this.area.editStatus) {
        map.setMapStyle('amap://styles/blue'); // 设置地图特殊样式，提示可以开始划范围了
        let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件
        map.plugin(mouseTool)
        mouseTool.polygon()

        let _this = this

        let drawOver =  AMap.event.addListener(mouseTool,'draw',function(e){ //监听画完事件
          let p = e.obj.getPath() //获取刚刚画完的多边形路径
          path = p.map((v) => {
            return [v.P, v.O]
          })

          _this.$store.commit('setAreaPath', path)

          // 需要将这个数据传回父模板
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

    getAreasPath() {
      //
    },
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

      // 限制地图显示区域
      AMap.Bounds()
      map.setLimitBounds(map.getBounds())

      let overlayGroup = new AMap.OverlayGroup() // 添加覆盖物的集合，统一改变属性

      this.testData.forEach(function(value, index) { // 实例化覆盖物，并添加到集合中
      // 将来根据不同的层级，显示不同的填充色和线色
      // 距离很近的最底层area，显示相近色区分，或者直接按照颜色分类
        let polygon = new AMap.Polygon({
          path: value.path,//设置多边形边界路径
          strokeColor: "#FF33FF", //线颜色
          strokeOpacity: 0.2, //线透明度
          strokeWeight: 2,    //线宽
          fillColor: "#1791fc", //填充色
          fillOpacity: 0.35,//填充透明度
          extData: { //测试数据，将来要从服务端获取
            id: '1111',
            name: 'test'
          }
        });

        overlayGroup.addOverlay(polygon)
      })

      overlayGroup.setMap(map) // 将所有覆盖物显示在地图上
      overlayGroup.on("mouseover", function(e) { // 添加显示覆盖物的属性的事件监听
        let area = e.target
        console.log('正在监听覆盖物上的鼠标移过事件', area.getExtData().name)
        // 将来鼠标滑过显示当前覆盖物的名称，方便用户选择
      });
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
