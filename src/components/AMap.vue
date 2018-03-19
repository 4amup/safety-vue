<template>
  <div id="map-container"></div>
</template>

<script>
import AMap from 'AMap'
console.log(AMap)

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const map = new AMap.Map('container', {
        resizeEnable: true,
        zoom:11,
        center: [116.397428, 39.90923]
      });
      console.log(map)
    }
  }
}
</script>

<style>
#map-container {
  height: 750px;
  width:100%;
}
</style>
