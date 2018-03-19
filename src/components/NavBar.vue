
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
    <li class="search">
      <el-input placeholder="请输入内容" v-model="search" class="input-with-select">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </li>
    <li class="ask">
      <el-button type="primary" icon="el-icon-upload" @click="dialogVisible = true">库</el-button>
      <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose">
        <span>这是一段信息</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </li>
    <el-menu-item index="/signup" class="sign">注册</el-menu-item>
    <el-menu-item index="/signin" class="sign">登录</el-menu-item>
  </el-menu>
</template>


<script>
  export default {
    data() {
      return {
        active: '/',
        search: null,
        dialogVisible: false
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
          title: '图库',
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
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      }
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
  .ask, .search {
    float: left;
    height: 60px;
    line-height: 60px;
    margin-left: 50px;
  }
</style>
