
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
        title="图库"
        :visible.sync="dialogVisible"
        width="40%">
        <el-upload
          :http-request="handleUpload"
          class="upload-demo"
          drag
          ref="upload"
          list-type="picture"
          :file-list="fileList"
          :on-change="handleChange"
          action="https://jsonplaceholder.typicode.com/posts/"
          multiple
          :auto-upload="false">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>选取文件</em></div>
          <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="success" @click="handleUpload">上传到服务器</el-button>
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
        dialogVisible: false,
        fileList: []
      };
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      handleChange() {

      },
      handleUpload() {
        // 取得上传的文件列表
        let files = this.$refs.upload.uploadFiles
        files = files.filter(file => {return file.status === 'ready'})
        .forEach((f, i)=> {
          let file = new this.$api.SDK.File('test', f.raw)
          file.save()
          .then(file => {
            f.status = 'success'
            // 文件保存成功
            console.log(file.url());
          })
          .catch(error => {
            console.error(error);
          })
        })
        console.log(this.$refs.upload.uploadFiles)
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
  .ask, .search {
    float: left;
    height: 60px;
    line-height: 60px;
    margin-left: 50px;
  }
</style>
