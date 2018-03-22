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
        zoom:16,
        center: [126.678551,45.715461]
      });
      console.log(map)
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
