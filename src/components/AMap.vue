<template>
  <div>
    <p>当前{{area.editStatus ? '为' : '不处于'}}编辑状态</p>
    <div id="map-container"></div>
  </div>
</template>

<script>
import AMap from 'AMap'
import { mapState, mapMutations, mapActions } from 'vuex'

// 共享一个map实例
let map = new AMap.Map('map-container', {
  resizeEnable: true,
  zoom:17,
  showIndoorMap: false,
  zooms: [16, 20],
  mapStyle: 'amap://styles/grey',
  center: [126.678551,45.715461]
});

let overlayGroup = new AMap.OverlayGroup() // 添加覆盖物的集合，统一改变属性

export default {
  data() {
    return {
      polygons: [],
      areas: [],
      mapOptions: {
        resizeEnable: true,
        zoom:17,
        showIndoorMap: false,
        zooms: [16, 20],
        mapStyle: 'amap://styles/grey',
        center: [126.678551,45.715461]
      },
      // 距离很近的最底层area，显示相近色区分，或者直接按照颜色分类
      colors: ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    }
  },
  mounted () {
    this.getAreas()
    this.initMap()
  },
  computed: {
    ...mapState(['user', 'area']),
    // 格式化areas数据，供将来的渲染函数使用
    areasFormart: function() {
      return this.areas.map(function (value, index) {
        let path = value.get('path')
        let id = value.id
        let name = value.get('name')
        return {
          "id": id,
          "name": name,
          "path":path
        }
      })
    }
  },
  watch: {
    'area.name': 'hignlightCurrentArea',
    'area.editStatus': 'editAreaPolygon', // 引用编辑方法
    'areasFormart.length': 'renderPolygon', // 添加新的区域后，重新渲染图
  },
  methods: {
    // 从服务端获取区域对象的数据
    getAreas() {
      let _this = this
      let query = new this.$api.SDK.Query('Area');
      query.find()
      .then(function (areas) {
        _this.areas = areas
      })
      .catch(error => {
        console.log(error)
      })
    },
    // 初始化地图
    initMap() {
      map = new AMap.Map('map-container', this.mapOptions);

      // 限制地图显示区域
      AMap.Bounds()
      map.setLimitBounds(map.getBounds())
    },
    // 高亮当前节点
    hignlightCurrentArea() {
      //
      if(this.area.path) { //区域有路径，就将路径改成编辑模式，使用AMap.PolyEditor插件
        // 首先遍历，找出当前的区域polygon，并将其改成编辑状态
        for(let i =0; i<this.polygons.length; i++) {
          let polygon = this.polygons[i]

          if(polygon.getExtData().id === this.area.objectId) {
            // 将当前的区域高亮显示
            polygon.setOptions({
              fillColor: '#fff'
            })
            continue // 高亮后跳出本次循环
          }
          polygon.setOptions({
            fillColor: '#1791fc' // 其他区域恢复原来的颜色
          })
        }
      }
    },

    // 编辑路径数据
    editAreaPolygon() {


      let path // 定义刚画完的路径
      if(this.area.editStatus) {
        map.setMapStyle('amap://styles/blue'); // 设置地图特殊样式，提示可以开始划范围了
        let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件
        map.plugin(mouseTool)
        mouseTool.polygon()

        let _this = this // 暂存this，参数传入下列函数

        let drawOver = AMap.event.addListener(mouseTool,'draw',function(e){ //监听画完事件
          let p = e.obj.getPath() //获取刚刚画完的多边形路径
          path = p.map((v) => {
            return [v.O, v.P]
          })
          _this.areas.push({
            id: area.id,
            name: area.name,
            path: path
          })
          _this.$store.commit('setAreaPath', path)
          mouseTool.close(true) // 画完后清除多边形
          // 需要将这个数据传回父模板
          // 准备采用vuex来将数据在不同组件中间共享
          // 返回特定的路径属性就可以
          // 参考leancloud链接https://leancloud.cn/docs/leanstorage_guide-swift.html#hash-916037211
        })


      } else {
        map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
      }
    },
    // 根据数据渲染多边形
    renderPolygon() {
      let data = this.areasFormart
      let _this = this

      data.forEach(function(value, index) { // 实例化覆盖物，并添加到集合中
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

        _this.polygons.push(polygon);

        overlayGroup.addOverlay(polygon)
      })

      overlayGroup.setMap(map) // 将所有覆盖物显示在地图上
      overlayGroup.on("mouseover", function(e) { // 添加显示覆盖物的属性的事件监听
        let area = e.target
        console.log('正在监听覆盖物上的鼠标移过事件', area.getExtData().name)
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
