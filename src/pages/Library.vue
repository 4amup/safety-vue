<template>
  <div id="container">
    <el-upload
      :http-request="handleUpload"
      :auto-upload="false"
      multiple
      ref="upload"

      action="string"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove">
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <el-button-group>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="success" @click="handleUpload">上传到服务器</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  name: 'Library',
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: []
    }
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
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
            // { loaded: 1234, total: 2468, percent: 50 }
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
