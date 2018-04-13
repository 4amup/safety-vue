<template>
  <div class="container">
    <el-steps :active="0" simple>
      <el-step title="发现" icon="el-icon-upload2"></el-step>
      <el-step title="整改" icon="el-icon-date"></el-step>
      <el-step title="整改完成" icon="el-icon-check"></el-step>
    </el-steps>
    <el-form ref="form"
      class="form"
      :rules="rules"
      :model="form"
      label-position="left"
      label-width="70px">
      <el-form-item label="">
        <el-switch
          style="display: block"
          v-model="form.status"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="已整改"
          inactive-text="未整改">
        </el-switch>
      </el-form-item>

      <el-form-item label="问题图片" prop="imagesUrl">
        <el-upload
          ref="upload"
          :http-request="handleUpload"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :before-upload="beforeImagesUpload"
          :file-list="fileList"
          class="todo-uploader"
          action="默认"
          list-type="picture-card"
          multiple
          :limit='3'>
          <i class="el-icon-plus"></i>
        </el-upload>
        <!-- 以下做一个图片预览器，图像源为格式化的缩略图 -->
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>

      <el-form-item label="位置" prop="location">
        <el-cascader
          v-model="form.location"
          placeholder="试试搜索：管二"
          :separator='`/`'
          :options="options"
          :props="props"
          filterable
          clearable
          change-on-select>
        </el-cascader>
      </el-form-item>

      <el-form-item label="精确位置" prop="whereCreated">
        <map-point ref='map' :areaId="selectedPolygon"></map-point>
        <el-button type="text" @click="dialogMapVisible = true">打开地图精确标注</el-button>
        <el-dialog
          title="标注精确位置"
          width="70%"
          :visible.sync="dialogMapVisible">
          <only-map class="only-map"></only-map>
        </el-dialog>
      </el-form-item>

      <el-form-item label="整改图片" v-if="form.status">
        <el-upload
        class="todo-uploader"
        action="https://jsonplaceholder.typicode.com/posts/"
        list-type="picture-card"
        :file-list="reformFieldList"
        multiple
        :limit='3'
        :on-remove="handleRemove">
        <i class="el-icon-plus"></i>
      </el-upload>
      </el-form-item>

      <el-form-item label="描述" prop="content">
        <el-input
          clearable
          autosize
          placeholder="违章现象、隐患、6S现场问题"
          v-model="form.content">
        </el-input>
      </el-form-item>

      <el-form-item label="措施" v-show="form.status">
        <el-input
          clearable
          autosize
          placeholder="非必填项，有图片即可"
          v-model="form.reform">
        </el-input>

      </el-form-item>
        <el-form-item>
        <el-button type="primary" @click="submitForm('form')">创建</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
        <el-button @click="handleUpload">传图</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import { mapState, mapMutations, mapActions } from 'vuex'
  import AMap from '@/components/AMap'
  import MapPoint from '@/components/MapPoint'
  import OnlyMap from '@/components/OnlyMap'
  export default {
    data() {
      let validateImagesUrl = (rule, value, callback) => {
        if (this.fileList.length === 0) {
          callback(new Error('请上传图片'));
        }
      };
      return {
        dialogMapVisible: false,
        form: {
          status: false,
          location: [],
          imagesUrl: [], // 图片路径数组
          content: '', // 描述的文字或语音地址的链接
          locationName: null,
          whereCreated: null,
          reformContent: '', //整改的描述或语音链接地址
          rImagesUrl: [],

        },
        lastAreaId: '',
        rules: {
          content: [
            { type: 'string', required: true, message: '请描述事项情况', trigger: 'blur'}
          ],
          location: [
            { type: 'array', required: true, message: '位置信息', trigger: 'change'}
          ],

          // imagesUrl: [
          //   { validator: validateImagesUrl, trigger: 'change' }
          // ],
        },
        options: [],
        props: {
          value:'id',
          label: 'name',
          children: 'children'
        },
        selected: [],
        fileList: [], // 问题图片列表
        reformFieldList: [] // 整改图片列表
      };
    },
    computed: {
      selectedPolygon() {
        let l = this.form.location.length
        if(l) {
          return this.form.location[l-1]
        }
      },
      ...mapState(['user'])
    },
    updated() { // 模板更新时，将地址字符串更新
      this.locationToString()
    },
    components: {
      MapPoint,
      AMap,
      OnlyMap
    },
    mounted() {
      this.getOptions()
    },
    methods: {
      // 获取原始的input元素的value数据
      locationToString() {
        let inputValue = document.querySelector('#app > div > form > div.el-form-item > div > span > div > input').getAttribute('value');
        this.form.locationName = inputValue
      },
      // 从后端获取选项数据
      getOptions() {
        let q = new this.$api.SDK.Query('AreaTree')
        q.find().then(trees => {
          if(trees.length===0) {
            throw Error('云端无数据')
          } else if (trees.length!==1) {
            throw Error('云端数据错误')
          } else {
            let tree = trees[0].get('data')
            let factory = tree[0]
            let workshops = factory.children
            this.options = workshops
          }
        }).catch(error => {
          // 错误处理
          console.log(error)
        })
      },

      // 图片上传相关方法
      handleUpload() {
        let files = this.$refs.upload.uploadFiles // 通过控制台查看console.log慢慢查到的
        files = files.filter(file => {return file.status === 'ready'})
        .forEach(f => {
          // 文件名命名规则是问题描述，如果多张图片，分别为xx-1.jpg、xx-2.jpg、
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
            f.url = file.url();
            this.form.imagesUrl.push(f.url)
          })
          .catch(error => {
            console.error(error);
          })
        })
      },

      // el-upload方法，即时改变fileList
      handleChange(file, fileList) {
        this.fileList = fileList
      },

      // 上传前检查图片的合规性
      beforeImagesUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 5;

        if (!isJPG) {
          this.$message.error('上传图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 5MB!');
        }
        return isJPG && isLt2M;
      },
      // el-upload方法，删除文件列表后即时更新
      handleRemove(file, fileList) {
        this.fileList = fileList
      },
      // el-upload方法，预览的实现
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },

      // 表单相关
      submitForm(formName) {
        let LngLat = this.$refs.map.getGeo() // 调用map的子组件的方法，获取到定位经纬度值
        LngLat = [LngLat.getLat(), LngLat.getLng()] // 格式化经纬度为数组形式，待保存云端
        this.form.whereCreated = new this.$api.SDK.GeoPoint(LngLat);
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // 保存到云端的逻辑
            let Todo = this.$api.SDK.Object.extend('Todo')
            let todo = new Todo()
            todo.set('content', this.form.content);
            todo.set('status', this.form.status);
            todo.set('creator', this.user);
            todo.set('location', this.form.locationName);
            todo.set('whereCreated', this.form.whereCreated);
            todo.set('imagesUrl', this.form.imagesUrl);
            todo.save().then(todo => {
              console.log('objectId:', todo.id)
              this.$message(`ID为${todo.id}的问题上传成功！`);
            })
            .catch(error => {
              console.error(error);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      // 重置表单
      resetForm(formName) {
        // 先清除表单信息
        this.$refs[formName].resetFields();
        // 然后将图片列表清空
        this.fileList = []
        this.reformFieldList = []
      }
    }
  }
</script>

<style scoped>
  /* .todo-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    width: 50px;
    height: 50px;
    font-size: 28px;
    display: inline-block;
    line-height: 50px;
    text-align: center;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .todo-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .el-upload-list--picture-card .el-upload-list__item {
    width: 50px;
    height: 50px;
  }
  .el-cascader--mini {
    width: 100%;
  } */
  .form {
    padding: 5% 20%;
  }

  /* #map-point {
    height: 200px;
  }

  #only-map {
    height: 600px;
  } */

</style>

