<template>
  <div class="container">
    <div class="tree">
      <h2>厂区关系图</h2>
      <el-tree
        ref="tree"
        @node-click="handleNodeClick"
        :data="data"
        :default-expanded-keys="[0]"
        node-key="id"
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

      <p v-if="!currentNodeData.id">无数据，选中后，显示该节点数据</p>

      <div v-else>
        <p><span>区域id：</span>{{currentNodeData.id}}</p>
        <p><span>区域名称：</span>{{ area.attributes.name }}</p>
        <p><span>区域路径：</span>{{ area.attributes.path ? '有' : '无'}}</p>
        <div class="tips">
          <p>{{ new Date(area.createdAt).toString() }}创建</p>
          <p>{{ new Date(area.updatedAt).toString() }}更新</p>
        </div>

      </div>

      <el-form v-if="area.editStatus" ref="editingForm" :model="area" label-position="right" label-width="70px">
        <el-form-item label="名称：">
          <el-input v-model="area.attributes.name">
            <el-button slot="append">提交</el-button>
          </el-input>
        </el-form-item>
      </el-form>

      <el-form v-if="area.appendStatus" ref="appendingForm" :model="childNode" label-position="right" label-width="70px">
        <el-form-item label="名称：">
          <el-input v-model="childNode.name">
            <el-button slot="append">提交</el-button>
          </el-input>
        </el-form-item>
      </el-form>

      <el-button :disabled="(area.appendStatus || area.editStatus)" @click="editNode">编辑</el-button>
      <el-button :disabled="(area.appendStatus || area.editStatus)" @click="appendNode">添加</el-button>
      <el-button :disabled="(area.appendStatus || area.editStatus) || !currentNodeData.id" @click="removeNode">删除</el-button>
      <el-button :disabled="!(area.appendStatus || area.editStatus)" @click="cancelAllStatus">取消</el-button>
    </div>

    <div class="map">
      <h2>区域图</h2>
      <a-map></a-map>
    </div>
  </div>
</template>

<script>
  import AMap from '@/components/AMap'
  import { mapState, mapMutations, mapActions } from 'vuex'

  export default {
    data() {
      return {
        areaTree: null, // 区域图云端对象
        data: [], // 区域图源数据
        // area, // 在vuex中共享了，当前区域对象
        // appending: false, // 节点是否在添加状态
        currentNodeData: {
          id: '',
          name: '',
          children: []
        },
        childNode: { // 待添加默认子节点
          name: '默认节点',
        },
      }
    },

    components: {
      AMap
    },

    watch: {
      data: function(newData, oldData) {
        this.syncAreaTree()
      }
    },

    mounted() {
      this.getAreaTree()
    },

    computed: mapState(['user', 'area']),

    methods: {
      // 获取区域树关系的查询，在组件加载时查询
      getAreaTree() {
        let q = new this.$api.SDK.Query('AreaTree')
        q.find().then(trees => {
          if(trees.length===0) {
            throw Error('云端无数据')
          } else if (trees.length!==1) {
            throw Error('云端数据错误')
          } else {
            this.areaTree = trees[0] // 区域树图对象
            this.data = trees[0].get('data') // 区域树图对象的data属性是树图的源数据
          }
        }).catch(error => {
          // 错误处理
          console.log(error)
        })
      },
      //同步云端树图
      syncAreaTree() {
        if(this.areaTree !==null) { // 存在区域树图对象，则根据id进行更新操作
          let areaTree = this.$api.SDK.Object.createWithoutData('AreaTree', this.areaTree.id);
          // 设置名称
          areaTree.set('data', this.data);
          // 设置优先级
          areaTree.save()
          .then(function (tree) {
            console.log('区域树图同步成功');
          })
          .catch(error => {
            console.log('区域树图同步失败');
            console.error(error)
          })
        } else { //不存在则进行新建操作
          let areaTree = that.$api.SDK.Object.extend('AreaTree');
          areaTree = new areaTree()
          // 新建对象
          areaTree.set('data', this.data);
          areaTree.save()
          .then((tree) => {
            console.log('区域树图新建成功')
          })
          .catch(error => {
            console.log('区域树图新建失败');
            console.error(error)
          })
        }
      },

      getArea(id) {
        let q = new this.$api.SDK.Query('Area')
        q.get(id).then(area => {
          this.$store.dispatch('saveArea', area); // 将area保存到Vuex 中
        })
        .catch(error => {
          console.log(error)
        })
      },

      // 当前选中的节点，钩子函数
      handleNodeClick(data, node, tree) {
        // 共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身。
        // data为当前选中节点的数据对象
        this.currentNodeData = data // 对应前端数据

        this.getArea(data.id) // 调用函数后，将area从云端取到vuex中
      },

      // 检查是否选中了当前节点
      checkCurrentNodeData() {
        //
      },

      appendNode() {
        let key = this.$refs.tree.getCurrentKey()
        let that = this
        // 如果树图源数据为空，则表示处于初始化状态
        if(this.data.length === 0) {
          this.$message('区域树图初始化')
          if(this.area.appendStatus) { //
            let form = this.$refs.appendingForm.model
            let cloudArea = new this.$api.SDK.Object.extend('Area')()
            cloudArea.set('name', form.name);
            cloudArea.set('path', []);
            cloudArea.save().then(area => {
              let root = {
                id: area.id,
                name: area.get('name'),
                children: []
              }
              // 保存成功后，改变前端数据
              that.data.push(root)
              that.$refs.tree.setCurrentKey(area.id)
              that.commit('changeAreaStatus2')
            })
            .catch(error => {
              console.error(error);
            })
          } else { // 提交改变状态
            this.$store.commit('changeAreaStatus2')
          }

          return //终止函数继续执行
        }

        // 首先确认父节点选中与否
        if(!key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.area.appendStatus) { // 添加状态为true
          let form = this.$refs.appendingForm.model

          // 首先新建一个区域节点
          let cloudArea = new  this.$api.SDK.Object.extend('Area')()
          cloudArea.set('name', form.name)
          cloudArea.set('path', [])
          cloudArea.save().then(area => {
            let newChild = {
              id: area.id,
              name: area.get('name'),
              children: []
            }
            // 更新前端属性结构，使用element-ui中tree的方法
            that.$refs.tree.append(newChild, key)
            that.commit('changeAreaStatus')
          })
          .catch(error => {
            console.log(error)
            console.log(`${appendingForm.name}保存失败`)
            return
          })
        } else {
          // 设置append为true
          this.$store.commit('changeAreaStatus')
          this.$store.commit('changeAreaStatus2')
        }
      },

      editNode() {
        let that = this
        // 通过组件定义的方法获取当前选中的节点
        let key = this.$refs.tree.getCurrentKey()
        console.log(key)
        // 编辑节点表单

        if(this.areaTree === null) {
          this.$message('区域树图未初始化，点击添加按钮初始化区域树图')
          return
        }

        if(!key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(!this.area.editStatus) { // 点击编辑按钮后，发现edit=false，将其改为true
          this.$store.commit('setAreaEdit')
          let form = this.$refs.editingForm.model

          // edit=true后，前端对应的表单显示在DOM中，按钮文字更改为“提交”
          // let cloudArea = this.$api.SDK.Object.createWithoutData('Area', key)

          // // 由于创建的是空对象，所以功能并没有完成
          // if(this.area.attributes.name === form.name) {
          //   console.log('内容无修改，不上传')
          //   return false // 如果名字没有修改，数据无需更新及上传
          // }

          // // 修改属性
          // cloudArea.set('name', form.name)
          // cloudArea.set('path', this.area.attributes.path)
          // // 保存到云端
          // cloudArea.save()
          // .then(() => {
          //   console.log(`${area.get('path').length}数组长度`)
          //   // 上传树形图结构
          //   this.$options.methods.syncAreaTree(that)
          //   this.$store.commit('setAreaEdit')
          //   this.$store.dispatch('saveArea', area)
          // });

        }

        // if(this.area.editStatus) { // 如果在节点编辑状态
        //   let cloudArea = this.$api.SDK.Object.createWithoutData('Area', key)

        //   // 由于创建的是空对象，所以功能并没有完成
        //   // if(area.get('name') === form.name) {
        //   //   console.log('内容无修改，不上传')
        //   //   return false // 如果名字没有修改，就不上传了
        //   // }

        //   // 修改属性
        //   cloudArea.set('name', form.name)
        //   cloudArea.set('path', this.area.attributes.path)
        //   // 保存到云端
        //   cloudArea.save()
        //   .then(() => {
        //     console.log(`${area.get('path').length}数组长度`)
        //     // 上传树形图结构
        //     this.$options.methods.syncAreaTree(that)
        //     this.$store.commit('setAreaEdit')
        //     this.$store.dispatch('saveArea', area)
        //   });
        // } else {
        //   // 设置为编辑状态
        //   this.$store.commit('setAreaEdit')
        // }
      },

      removeNode() {
        let that = this
        let key = this.$refs.tree.getCurrentKey()

        if(!key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        // 遍历获取删除节点，研究遍历算法
        function traverseTree(node, id) {
          if (node.id === id) {
            return node;
          }

          if(node.children && node.children.length>0) {
            for (let n of node.children) {
              console.log(node.name)
              return traverseTree(n);
            }
          }
        }
        function traverseTree(node) {
          if(!node) {
            return
          }

          if(node.children && node.children.length>0) {
            for (let node of node.children) {
              console.log(node.name)
              return traverseTree(node);
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
          this.$options.methods.syncAreaTree(that)
          console.log(`id为${key}的节点前端删除成功`)
        })
        .catch(error => {
          console.log(error, '删除失败')
        })
      },

      cancelAllStatus() {
        this.$store.commit('setAreaInit')
      }
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
