<template>
  <div id="map-point"></div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
let map // 添加地图公共变量
let overlayGroup // 添加覆盖物的集合，统一改变属性
let marker

export default {
  data() {
    return {
      areas: [], //这个数据也需要使用vuex共享
      mapOptions: {
        resizeEnable: true,
        overlayGroup: null,
        zoom:20,
        showIndoorMap: false,
        zooms: [16, 20],
        mapStyle: 'amap://styles/grey',
        center: [126.678551,45.715461]
      },
      idOfArea: this.areaId
      // 距离很近的最底层area，显示相近色区分，或者直接按照颜色分类
      // colors: ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    }
  },
  props: ['areaId'],
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
    },
  },
  watch: {
    'areas.length': 'renderPolygon', // 添加新的区域后，重新渲染图
    // 'idOfArea': 'hignlightCurrentPolygon',
    'areaId': 'hignlightCurrentPolygon',
  },
  methods: {
    hignlightCurrentPolygon() {
      let that = this // 暂存this对象

      // 进来先恢复原色
      overlayGroup.setOptions({
        fillColor: '#1791fc'
      })

      // 根据id遍历查找当前polygon，通过id
      overlayGroup.eachOverlay(function(overlay, index, collections) {
        if(overlay.getExtData().id === that.areaId) {
          // 然后将多边形高亮
          overlay.setOptions({
            fillColor: '#fcc413' // 高亮色
          })
          map.setFitView(overlay) // setFitView(overlayList:Array),根据地图上添加的覆盖物分布情况，自动缩放地图到合适的视野级别，参数overlayList默认为当前地图上添加的所有覆盖物图层
          that.currentPolygon = overlay //将当前多边形同步至当前组件data中
        }
      })
    },
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
      let position
      map = new AMap.Map('map-point', this.mapOptions);
      marker = new AMap.Marker({
        cursor: 'move'
      })
      marker.setMap(map)
      map.on('click', function(e) {
        position = e.lnglat
        map.setCenter(position)
        marker.setPosition(position)
        marker.setMap(map)
      })

      // 限制地图显示区域
    },
    // 根据数据渲染多边形
    renderPolygon() {
      let that = this
      overlayGroup = new AMap.OverlayGroup() // 添加覆盖物的集合，统一改变属性
      this.areasFormart.forEach(function(value, index) { // 实例化覆盖物，并添加到集合中
        if(!value.path) return // 如果区域的节点路径不存在，就不渲染
        // 将来根据不同的层级，显示不同的填充色和线色
        let polygon = new AMap.Polygon({
          bubble: true,
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
      map.setFitView()
      overlayGroup.on("mouseover", function(e) { // 添加显示覆盖物的属性的事件监听
        let area = e.target
        // console.log('正在监听覆盖物上的鼠标移过事件', area.getExtData().name)
        // 后续使用AMap.text显示区域名称，方便用户选择
        // 将来鼠标滑过显示当前覆盖物的名称，方便用户选择
      });
    },

    getGeo() {
      return marker.getPosition()
    }
  }
}
</script>

<style scoped>
#map-point {
  height: 180px;
}
</style>
