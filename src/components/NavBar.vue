
<template>
  <el-menu
    :default-active="activeIndex2"
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-menu-item index="1">safety</el-menu-item>
    <el-menu-item index="2">探索</el-menu-item>
    <el-menu-item index="3">登录</el-menu-item>
    <el-menu-item index="4">注册</el-menu-item>
  </el-menu>
</template>


<script>
  export default {
    data() {
      return {
        activeIndex: '1',
        activeIndex2: '1'
      };
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

<style>
  .right {
    float: right;
  }
</style>
