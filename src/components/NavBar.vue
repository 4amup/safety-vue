
<template>
  <el-menu
    :default-active=active
    :router="true"
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-menu-item index="/">safety</el-menu-item>
    <el-menu-item index="/list">探索</el-menu-item>
    <li class="ask">
      <el-button type="primary" icon="el-icon-edit" @click="handleClick">提问</el-button>
    </li>
    <li class="ask"><el-button type="primary" icon="el-icon-search">搜索</el-button></li>
    <el-menu-item index="/signup" class="sign">注册</el-menu-item>
    <el-menu-item index="/signin" class="sign">登录</el-menu-item>
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
      },
      handleClick() {
        console.log('click');
        const h = this.$createElement;
        this.$msgbox({
          title: '遇到的问题',
          message: h('p', null, [
            h('span', null, '内容可以是 '),
            h('i', { style: 'color: teal' }, 'VNode')
          ]),
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = '执行中...';
              setTimeout(() => {
                done();
                setTimeout(() => {
                  instance.confirmButtonLoading = false;
                }, 300);
              }, 3000);
            } else {
              done();
            }
          }
        }).then(action => {
          this.$message({
            type: 'info',
            message: 'action: ' + action
          });
        });
      }
    }
  }
</script>

<style scoped>
  .sign{
    float: right;
  }
  .ask {
    float: left;
    height: 60px;
    line-height: 60px;
    margin-left: 50px;
  }
</style>
