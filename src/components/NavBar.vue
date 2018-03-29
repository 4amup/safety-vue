<template>
  <el-menu
    :default-active=active
    :router="true"
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    menu-trigger="click"
    active-text-color="#ffd04b">
    <el-menu-item index="/">safety</el-menu-item>
    <el-menu-item index="/list">探索</el-menu-item>
    <el-menu-item index="/library">图库</el-menu-item>
    <el-menu-item index="/tree">组织</el-menu-item>
    <el-menu-item index="/todo">todo</el-menu-item>
    <li class="search">
      <el-input placeholder="请输入内容" v-model="search" class="input-with-select">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </li>
    <!-- <li class="todo">
      <el-button type="primary" @click="dialogVisible = true">todo</el-button>
        <todo :dialogVisible="dialogVisible"></todo>
    </li> -->

    <template v-if="user">
      <el-submenu index="5" class="sign">
        <span slot="title"> {{ user.getUsername() }} </span>
        <el-menu-item index="5-1">个人中心</el-menu-item>
        <el-menu-item index="5-2">发布文章</el-menu-item>
        <el-menu-item index="5-3">消息</el-menu-item>
        <el-menu-item index="5-3"  @click="heandleExit">注销</el-menu-item>
      </el-submenu>
      <el-menu-item index="6" class="sign notification"><i class="el-icon-bell"></i>提醒</el-menu-item>
    </template>
    <template v-else>
      <el-menu-item index="/signup" class="sign">注册</el-menu-item>
      <el-menu-item index="/signin" class="sign">登录</el-menu-item>
    </template>
  </el-menu>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Todo from '@/components/Todo'
export default {
  data() {
    return {
      active: '/',
      search: null,
      dialogVisible: false,
    };
  },
  components: {
    Todo
  },
  computed: mapState(['user']),
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleChange() {
      //
    },
    ...mapActions(['exit']),
    heandleExit() {
      this.exit();
      this.$message.success('成功退出');
    },
    handleUpload() {
      // 取得上传的文件列表
      let files = this.$refs.upload.uploadFiles
      files = files.filter(file => {return file.status === 'ready'})
      .forEach(f => {
        let file = new this.$api.SDK.File('test', f.raw)
        file.save({
          onprogress:function (e)  {
            f.percentage = e.percent
            f.status = 'uploading'
          },
        })
        .then(file => {
          f.status = 'success';
          // 文件保存成功
          // f.url = file.url();
        })
        .catch(error => {
          console.error(error);
        })
      })
    },
  }
}
</script>

<style scoped>
  .sign{
    float: right;
  }
  .search {
    width: 300px;
  }
  .ask, .search, .todo {
    float: left;
    height: 60px;
    line-height: 60px;
    margin-left: 50px;
  }
</style>
