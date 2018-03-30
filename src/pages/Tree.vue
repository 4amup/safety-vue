<template>
  <div class="container">
    <div class="tree">
      <h2>厂区关系图</h2>
      <el-tree
        ref="tree"
        @current-change="selectCurrentNode"
        :data="data"
        :default-expanded-keys="[0]"
        node-key="id"
        default-expand-all
        accordion
        :highlight-current="true"
        :check-strictly="false"
        :expand-on-click-node="false">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <!-- <span v-if="!data.editing"><i class="el-icon-info"></i>  {{ node.label }}</span> -->
          <span>{{ data.name }}</span>
        </span>
      </el-tree>
      <p v-if="!areaTree">区域树图初始化中...</p>
      <div class="tips" v-else>
        <p>{{ new Date(areaTree.createdAt).toString() }}创建</p>
        <p>{{ new Date(areaTree.updatedAt).toString() }}更新</p>
      </div>
    </div>

    <div class="areaInfo">
      <h2>区域信息</h2>

      <p v-if="!currentNode">无数据，选中后，显示该节点数据</p>

      <div v-else v-show="!this.editing">
        <!-- <p><span>区域id：</span>{{currentNode.id}}</p> -->
        <!-- <p><span>区域名称：</span>{{currentNode.get('name')}}</p>
        <p><span>区域路径：</span>{{currentNode.get('path') ? '有' : '无'}}</p> -->
        <p><span>区域id：</span>{{currentNode.objectId}}</p>
        <p><span>区域名称：</span>{{currentNode.name}}</p>
        <p><span>区域路径：</span>{{currentNode.path ? '有' : '无'}}</p>

      </div>

      <el-form v-if="this.editing" ref="editingForm" :model="currentNode" label-position="right" label-width="70px">
        <el-form-item label="名称：">
          <el-input v-model="currentNode.name"></el-input>
        </el-form-item>
        <el-form-item label="路径：">
          <el-input v-model="currentNode.path"></el-input>
        </el-form-item>
      </el-form>

      <el-form v-if="this.appending" ref="appendingForm" :model="childNode" label-position="right" label-width="70px">
        <el-form-item label="名称：">
          <el-input v-model="childNode.name"></el-input>
        </el-form-item>
        <el-form-item label="路径：">
          <el-input v-model="childNode.path"></el-input>
        </el-form-item>
      </el-form>

      <el-button :disabled="appending" @click="editNode">{{this.editing ? '提交' : '编辑'}}</el-button>
      <el-button :disabled="editing" @click="appendNode">{{this.appending ? '提交': '添加'}}</el-button>
      <el-button :disabled="(appending || editing)" @click="removeNode">删除</el-button>
      <el-button :disabled="(appending || editing)" @click="removeNode">取消</el-button>
    </div>

    <div class="map">
      <a-map></a-map>
    </div>
  </div>
</template>

<script>
  import AMap from '@/components/AMap'

  export default {
    data() {
      return {
        areaTree: null, // 区域图云端对象
        data: [], // 区域图源数据
        editing: false, // 节点是否在编辑状态
        appending: false, // 节点是否在添加状态
        currentNode: null, // 当前选中节点
        childNode: { // 待添加默认子节点
          label: '默认节点',
          type: null,
        },
        type: ['Factory', 'Workshop', 'Stride', 'Area'] // 节点类型
      }
    },
    components: {
      AMap
    },
    beforeMount() {
      this.getAreaTree()
    },

    methods: {
      uploadAreaTree(_this) {
        if(_this.areaTree !==null) { // 存在区域树图对象，则根据id进行更新操作
          let areaTree = _this.$api.SDK.Object.createWithoutData('AreaTree', _this.areaTree.id);
          // 设置名称
          areaTree.set('data', _this.data);
          // 设置优先级
          areaTree.save().then(function (tree) {
            console.log(tree.id, '树图同步成功');
          }, function (error) {
            console.error(error);
          });
        } else { //不存在则进行新建操作
          let areaTree = _this.$api.SDK.Object.extend('AreaTree');
          areaTree = new areaTree()
          // 新建对象
          areaTree.set('data', _this.data);
          // 设置优先级
          areaTree.save().then((tree) => {
            //
          }, function (error) {
            console.error(error);
          });
        }
      },
      getAreaTree() { // 获取区域树关系的查询，在组件加载时查询
        let q = new this.$api.SDK.Query('AreaTree')
        q.find().then(trees => {
          if(trees.length===0) {
            throw Error('云端无数据')
          } else if (trees.length!==1) {
            throw Error('云端数据错误')
          } else {
            this.areaTree = trees[0] // 区域树图对象
            this.data = trees[0].get('data') // 区域树图对象的data属性是前端树图的源数据
          }
        }).catch(error => {
          // 错误处理
          console.log(error)
        })
      },
      getArea(id) {
        let q = new this.$api.SDK.Query('Area')
        q.get(id).then(area => {
          this.currentNode = area.toJSON()
        })
        .catch(error => {
          console.log(error)
        })
      },

      // 当前选中的节点，钩子函数
      selectCurrentNode(data, node) {
        let id = data.id
        this.getArea(id)
      },

      appendNode() {
        let _this = this
        // 如果数据项是空的，则表示处于初始化状态
        if(this.data.length === 0) {
          this.$message('区域树图初始化')
          if(this.appending) {
            let form = this.$refs.appendingForm.model
            let Area = this.$api.SDK.Object.extend('Area')
            let area = new Area()
            area.set('name', form.name);
            area.set('path', null);
            area.save().then(area => {
              let root = {
                id: area.id,
                name: area.get('name'),
                children: []
              }
              // 前端显示
              this.data.push(root)
              // 上传树形图结构
              this.$options.methods.uploadAreaTree(_this)
              this.appending = false
            })
            .catch(error => {
              console.error(error);
            })
          } else {
            this.appending = true
          }
        }

        // 首先确认父节点选中与否
        let key = this.$refs.tree.getCurrentKey()

        if(!key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.appending) { // 在添加状态
          let appendingForm = this.$refs.appendingForm.model

          // 首先新建一个区域节点
          let Area = this.$api.SDK.Object.extend('Area');
          let area = new Area()
          area.set('name', appendingForm.name)
          area.set('path', appendingForm.path)
          area.save().then(area => {
            let newChild = {
              id: area.id,
              name: area.get('name'),
              children: []
            }
            this.$refs.tree.append(newChild, key)
            // 上传树形图结构
            this.$options.methods.uploadAreaTree(_this)
            this.appending = false // 将添加状态还原
          })
          .catch(error => {
            console.log(error)
            console.log(`${appendingForm.name}保存失败`)
            return
          })
        } else {
          // 设置为添加状态
          this.appending = true
        }
      },

      editNode() {
        let _this = this
        // 通过组件定义的方法获取当前选中的节点
        let key = this.$refs.tree.getCurrentKey()

        // let node = this.$refs.tree.getCurrentNode()
        if(this.areaTree === null) {
          this.$message('区域树图初始化，初始化节点后可以操作')
          return
        }

        if(!key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.editing) { // 如果在节点编辑状态
          let form = this.$refs.editingForm.model

          let area = this.$api.SDK.Object.createWithoutData('Area', key);
          // 修改属性
          area.set('name', form.name)
          // 保存到云端
          area.save()
          .then(() => {
            console.log(`${area.get('name')}更新成功`)
            // 上传树形图结构
            this.$options.methods.uploadAreaTree(_this)
            this.editing = false
          });
        } else {
          // 设置为编辑状态
          this.editing = true
        }
      },

      removeNode() {
        let _this = this
        let key = this.$refs.tree.getCurrentKey()

        if(!key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        // 欠缺逻辑，删除节点，将该节点的子节点下的全部删除

        function recursion(id, node) {
          let arr = []
          if(node.id === id) {
            arr.push(id)

            if(node.children && node.children.length>0) {
              for(let i=0; i<node.children.length; i++) {
                this.recursion(node.children[i])
              }
            }
          }
          if(!node) {
            return arr
          }

          recursion(node)
          if(node.children && node.children.length>0) {
            for(let i=0; i<node.children.length; i++) {
              this.recursion(node.children[i])
            }
          }
        }
        let area = this.$api.SDK.Object.createWithoutData('Area', key);
        area.destroy().then(function (success) {
          // 删除成功
          console.log(`id为${key}的节点云端删除成功`)
        })
        .then(() => {
          // 在前端删除对象
          this.$refs.tree.remove(key)
          // 重新上传树图
          this.$options.methods.uploadAreaTree(_this)
          console.log(`id为${key}的节点前端删除成功`)
        })
        .catch(error => {
          console.log(error, '删除失败')
        })
      },
    },

    // 自定义指令实现input的focus触发 https://cn.vuejs.org/v2/guide/custom-directive.html
    directives: {
      focus: {
        // 指令的定义
        update: function (el) {
          el.children[0].focus()
        }
      }
    }
  };
</script>

<style scoped>
  .container {
    display: flex;
    flex-direction: row;
  }

  .tree, .areaInfo {
    width: 30%;
  }

  .map {
    width: 40%;
  }

  .tips p {
    font-size: 12px;
    font-style: italic;
  }


  /* .custom-tree-node {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    padding-right: 8px;
  } */
</style>
