<template>
  <div>
    <div id="map-container"></div>
    <!-- <div class="button-group"> -->
      <el-button type="success" round>编辑完成</el-button>
    <!-- </div> -->
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

let overlayGroup

export default {
  data() {
    return {
      // overlayGroup: ,
      currentPolygon: null,
      polylineEditor: null,
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
      colors: ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    }
  },
  mounted () {
    this.getAreas()
    this.initMap()
    // this.renderPolygon()
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
          "path": path
        }
      })
    }
  },
  watch: {
    'area.id': 'hignlightCurrentPolygon', // area的id改变时，高亮当前节点
    'area.editStatus': 'editAreaPolygon', // 引用编辑方法
    // 'area.appendStatus': 'appendStatusAreaPolygon', // 引用编辑方法
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
      map = new AMap.Map('map-container', this.mapOptions);

      // 限制地图显示区域
      AMap.Bounds()
      map.setLimitBounds(map.getBounds())
    },
    // 根据数据渲染多边形
    renderPolygon() {
      console.log('开始渲染多边形组')
      overlayGroup = new AMap.OverlayGroup() // 添加覆盖物的集合，统一改变属性
      // this.overlayGroup = overlayGroup
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
    // 高亮当前节点
    hignlightCurrentPolygon() {
      let that = this // 暂存this对象

      // 如果当前区域没有路径数据，不执行该函数
      if(!this.area.path) return

      // 根据id遍历查找当前polygon，通过id
      overlayGroup.eachOverlay(function(overlay, index, collections) {
        if(overlay.getExtData().id === that.area.id) {
          // 然后将多边形高亮
          overlay.setOptions({
            fillColor: '#12355b'
          })
          that.currentPolygon = overlay //将当前多边形同步至当前组件data中
        } else {
          // 恢复原来颜色
          overlay.setOptions({
            fillColor: '#1791fc'
          })
        }
      })
    },

    // 编辑路径数据
    editAreaPolygon() {
      let that = this // 暂存this
      // let polylineEditor
      let editor = {}

      // 样式的变化，反映是否在编辑状态
      if(this.area.editStatus) {
        map.setMapStyle('amap://styles/blue') // 地图编辑模式下，地图底色改为蓝色
      } else {
        map.setMapStyle('amap://styles/grey') // 地图编辑模式下，地图底色改回灰色
        if(this.polylineEditor) {
          this.polylineEditor.close()
          console.log('存在编辑，关闭当前编辑')
        }
        return
      }

      // 两种情况，路径是空的，就创建；路径有的，就编辑
      if(this.currentPolygon) { // 路径有，启动PolyEditor
        console.log('启动polygonEditor')
        this.polylineEditor = new AMap.PolyEditor(map, this.currentPolygon)

        // 监听编辑结束事件，获取编辑后的对象路径数据，赋值给当前area的path属性
        this.polylineEditor.on('end', function({type, target}) {
          console.log(type)
          let path = target.getPath().map((v) => [v.O, v.P])
          console.log(path)
          // 改变当前区域数据
          that.area.path = path
          that.$store.commit('setArea', that.area)
        })

        this.polylineEditor.open()
      } else { // 路径无，启动mouseTool
        console.log("启动mousetool")
        let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件
        mouseTool.polygon()
        let drawOver = AMap.event.addListener(mouseTool,'draw',function(e){ //监听画完事件
          // 新建一个polygon，加入 overlayGroup
          let polygon = new AMap.Polygon({
            path: e.obj.getPath(),//设置多边形边界路径
            strokeColor: "#FF33FF", //线颜色
            strokeOpacity: 0.2, //线透明度
            strokeWeight: 2,    //线宽
            fillColor: "#1791fc", //填充色
            fillOpacity: 0.35,//填充透明度
            extData: { //测试数据，将来要从服务端获取
              id: that.area.id,
              name: that.area.name
            }
          });

          // 格式化路径数据
          let path = polygon.getPath().map((v) => [v.O, v.P])
          // 改变当前区域数据
          that.overlayGroup.addOverlay(polygon)
          that.area.path = path
          that.$store.commit('setArea', that.area)
          that.currentPolygon = polygon
          mouseTool.close(true) // 将mouseTool设置为画完后清除绘画的多边形
        })
      }
      // if(this.area.editStatus) {
      //   polylineEditor.open();
      //   // 添加结束事件监听
      //   AMap.event.addListener(polylineEditor, 'end', function(type, target) {
      //     console.log(target)
      //     let path = target.getPath().map((v) => [v.O, v.P])
      //     console.log(path)
      //     // 改变当前区域数据
      //     this.area.path = path
      //     this.$store.commit('setArea', area)
      //   })
      // } else {
      //   map.setMapStyle('amap://styles/grey')
      //   polylineEditor.close()
      // }
    },
    appendAreaPolygon() {
      //
      let that = this // 暂存this
      // 添加绘画polygon和编辑polygon实例
      // let polylineEditor = new AMap.PolyEditor(map, this.currentPolygon);
      let mouseTool = new AMap.MouseTool(map) //在地图中添加MouseTool插件

      let drawOver = AMap.event.addListener(mouseTool,'draw',function(e){ //监听画完事件
        // 新建一个polygon，加入 overlayGroup
        let polygon = new AMap.Polygon({
          path: e.obj.getPath(),//设置多边形边界路径
          strokeColor: "#FF33FF", //线颜色
          strokeOpacity: 0.2, //线透明度
          strokeWeight: 2,    //线宽
          fillColor: "#1791fc", //填充色
          fillOpacity: 0.35,//填充透明度
          extData: { //测试数据，将来要从服务端获取
            id: that.area.id,
            name: that.area.attributes.name
          }
        });

        // 格式化路径数据
        let path = polygon.getPath().map((v) => [v.O, v.P])
        // 改变当前区域数据
        that.$store.commit('setArea', area)
        that.overlayGroup.addOverlay(polygon)
        that.currentPolygon = polygon
        mouseTool.close(true) // 画完后清除多边形
        // 需要将这个数据传回父模板
        // 准备采用vuex来将数据在不同组件中间共享
        // 返回特定的路径属性就可以
        // 参考leancloud链接https://leancloud.cn/docs/leanstorage_guide-swift.html#hash-916037211
      })

      if(this.area.editStatus) {
        // 如果当前节点路径是有的，直接进入编辑模式
        if(this.area.attributes.path) {
          map.setMapStyle('amap://styles/blue')
          this.polylineEditor = new AMap.PolyEditor(map, this.currentPolygon);
          this.polylineEditor.open();
          // 添加结束事件监听
          // AMap.event.addListener(this.polylineEditor, 'end', function(type, target) {
          //   let path = target.getPath().map((v) => [v.O, v.P])
          //   // 改变当前区域数据
          //   this.$store.commit('setAreaPath', path)
          // })
        } else {
          // 如果没有路径，直接新建路径
          map.setMapStyle('amap://styles/blue')
          map.plugin(mouseTool)
          mouseTool.polygon() //打开新建工具
        }
      } else {
        map.setMapStyle('amap://styles/grey')
        if(this.polylineEditor) {
          this.polylineEditor.close()
        }
      }
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
