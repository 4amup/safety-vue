
<template>
  <el-menu
    :default-active=active
    router=true
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-menu-item index="/">safety</el-menu-item>
    <el-menu-item index="2">探索</el-menu-item>
    <el-menu-item index="/signin">登录</el-menu-item>
    <el-menu-item index="/signup">注册</el-menu-item>
  </el-menu>
</template>


<script>
  export default {
    data() {
      return {
        active: '/',
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
