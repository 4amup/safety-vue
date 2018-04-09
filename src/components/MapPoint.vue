<template>
  <div id="map-point"></div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

// let map = new AMap.Map('map-container', {
//   resizeEnable: true,
//   zoom:17,
//   showIndoorMap: false,
//   zooms: [16, 20],
//   mapStyle: 'amap://styles/grey',
//   center: [126.678551,45.715461]
// });
let map

let overlayGroup // 添加覆盖物的集合，统一改变属性

export default {
  data() {
    return {
      areas: [], //这个数据也需要使用vuex共享
      mapOptions: {
        resizeEnable: true,
        overlayGroup: null,
        zoom:17,
        showIndoorMap: false,
        zooms: [16, 20],
        mapStyle: 'amap://styles/grey',
        center: [126.678551,45.715461]
      },
      // 距离很近的最底层area，显示相近色区分，或者直接按照颜色分类
      // colors: ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    }
  },
  mounted () {
    this.getAreas()
    this.initMap()
  },
  computed: {
    ...mapState(['user']),
    // 格式化areas数据，供将来的渲染函数使用
    areasFormart: function() {
      return this.areas.map(function (value, index) {
        let path = value.get('path')
        let id = value.id
        let name = value.get('name')
        return {
          "id": id,
          "name": name,
          "path": path
        }
      })
    }
  },
  watch: {
    'areas.length': 'renderPolygon', // 添加新的区域后，重新渲染图
  },
  methods: {
    // 从服务端获取区域对象的数据
    getAreas() {
      let that = this
      let query = new this.$api.SDK.Query('Area');
      query.find()
      .then(function (areas) {
        that.areas = areas
      })
      .catch(error => {
        console.log(error)
      })
    },
    // 初始化地图
    initMap() {
      map = new AMap.Map('map-point', {
        resizeEnable: true,
        zoom:17,
        showIndoorMap: false,
        zooms: [16, 20],
        mapStyle: 'amap://styles/grey',
        center: [126.678551,45.715461]
      });

      // 限制地图显示区域
      AMap.Bounds()
      map.setLimitBounds(map.getBounds())
    },
    // 根据数据渲染多边形
    renderPolygon() {
      console.log('开始渲染多边形组')
      overlayGroup = new AMap.OverlayGroup() // 添加覆盖物的集合，统一改变属性
      this.areasFormart.forEach(function(value, index) { // 实例化覆盖物，并添加到集合中
        if(!value.path) return // 如果区域的节点路径不存在，就不渲染
        // 将来根据不同的层级，显示不同的填充色和线色
        let polygon = new AMap.Polygon({
          path: value.path,//设置多边形边界路径
          strokeColor: "#FF33FF", //线颜色
          strokeOpacity: 0.2, //线透明度
          strokeWeight: 2,    //线宽
          fillColor: "#1791fc", //填充色
          fillOpacity: 0.35,//填充透明度
          extData: { //测试数据，将来要从服务端获取
            id: value.id,
            name: value.name
          }
        });
        overlayGroup.addOverlay(polygon)
      })

      overlayGroup.setMap(map) // 将所有覆盖物显示在地图上
      overlayGroup.on("mouseover", function(e) { // 添加显示覆盖物的属性的事件监听
        let area = e.target
        // console.log('正在监听覆盖物上的鼠标移过事件', area.getExtData().name)
        // 后续使用AMap.text显示区域名称，方便用户选择
        // 将来鼠标滑过显示当前覆盖物的名称，方便用户选择
      });
    },
  }
}
</script>

<style>
#map-container {
  height: calc(100vh - 62px);
  width:100%;
}
</style>
