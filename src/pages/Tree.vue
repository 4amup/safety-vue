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
          <span>{{ data.name }}</span>
        </span>
      </el-tree>
      <div v-if="areaTree" class="tips">
        <p>{{ new Date(areaTree.createdAt).toString() }}创建</p>
        <p>{{ new Date(areaTree.updatedAt).toString() }}更新</p>
      </div>
    </div>

    <div class="areaInfo">
      <h2>区域信息</h2>

      <p v-if="!currentNodeData.id">无数据，选中后，显示该节点数据</p>

      <div v-else>
        <p><span>区域id：</span>{{ currentNodeData.id }}</p>
        <p><span>区域名称：</span>{{ currentNodeData.name }}</p>
        <p><span>区域路径：</span>{{ area.path ? '有' : '无'}}</p>
        <div class="tips">
          <p>{{ new Date(area.createdAt).toString() }}创建</p>
          <p>{{ new Date(area.updatedAt).toString() }}更新</p>
        </div>

      </div>

      <el-form v-if="area.editStatus" ref="editForm" :model="currentNodeData" label-position="right" label-width="70px">
        <el-form-item label="名称：">
          <el-input v-model="currentNodeData.name">
            <el-button slot="append" @click="submit">提交</el-button>
          </el-input>
        </el-form-item>
      </el-form>

      <el-form v-if="area.appendStatus" ref="appendForm" :model="appendForm" label-position="right" label-width="70px">
        <el-form-item label="名称：">
          <el-input v-model="appendForm.name">
            <el-button slot="append" @click="submit">提交</el-button>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- <el-button :disabled="(area.appendStatus || area.editStatus)" @click="editNode">编辑</el-button>
      <el-button :disabled="(area.appendStatus || area.editStatus)" @click="appendNode">添加</el-button>
      <el-button :disabled="(area.appendStatus || area.editStatus) || !currentNodeData.id" @click="removeNode">删除</el-button>
      <el-button :disabled="!(area.appendStatus || area.editStatus)" @click="cancelAllStatus">取消</el-button> -->
      <el-button :disabled="currentNodeData.id===''" @click="editNode">编辑</el-button>
      <el-button :disabled="currentNodeData.id===''" @click="appendNode">添加</el-button>
      <el-button :disabled="currentNodeData.id===''" @click="removeNode">删除</el-button>
      <el-button :disabled="!(area.appendStatus || area.editStatus)" @click="cancelAllStatus">取消</el-button>
    </div>

    <div class="map">
      <h2>区域图</h2>
      <p>当前{{area.editStatus ? '为' : '不处于'}}编辑状态</p>
      <a-map ref="map"></a-map>
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
        key: null, // 当前选中节点的id
        currentNodeData: { // 子树对象
          id: '',
          name: '',
          children: []
        },
        appendForm: {
          name: '默认节点',
          path: null
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
      // 挂载前获取树图
      this.getAreaTree()
    },

    computed: mapState(['user', 'area']),

    methods: {
      // 获取区域树关系的查询，在组件加载时查询
      // 此方法更新两个data，一个是areaTree，一个是data（树图源数据对象）
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
          area = area.toJSON() // 保存干净的对象
          area.id = area.objectId //添加一个更加方便的id属性
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

      // 查area
      getArea(id) {
        let q = new this.$api.SDK.Query('Area')
        q.get(id).then(area => {
          area = area.toJSON() // 保存干净的对象
          area.id = area.objectId //添加一个更加方便的id属性
          area.editStatus = false
          area.appendStatus = false
          this.$store.dispatch('saveArea', area); // 将area保存到Vuex 中
        })
        .catch(error => {
          console.log(error)
        })
      },
      // 创建area
      createArea() {
        let area = new this.$api.SDK.Object('Area');
        area.set('name', this.appendForm.name)
        area.set('path', null)
        return area;
      },
      // 修改area
      setArea() {
        let id = this.area.id
        let area = this.$api.SDK.Object.createWithoutData('Area', id)

        // 修改属性
        area.set('name', this.currentNodeData.name)
        area.set('path', this.area.path)
        // 保存到云端
        return area;
      },
      // 删除area
      destroyArea() {
        let id = this.area.id
        let area = this.$api.SDK.Object.createWithoutData('Area', id);
        return area
      },

      editSave(area) {
        area.save()
        .then((area) => {
          let message =  `区域${area.get('name')}上传成功`;
          this.$message({message, type: 'success'})
        })
        .then(() => {
          this.syncAreaTree()
        })
        .catch(error => {
          console.error(error)
        })
      },

      appendSave(area) {
        area.save()
        .then((area) => {
          // 保存成功后，更新前端数据
          let newChild = {
            id: area.id,
            name: area.get('name'),
            children: []
          }
          this.$refs.tree.append(newChild, this.key) // 更新前端属性结构，使用element-ui中tree的方法
          let message =  `区域${area.get('name')}上传成功`;
          this.$message({message, type: 'success'})
          // this.$refs.tree.setCurrentKey(area.id) // 将新添加节点设为当前节点
        })
        .then(() => {
          this.syncAreaTree()
        })
        .catch(error => {
          console.error(error)
        })
      },

      destroySave(area) {
         area.destroy().then(function (success) {
          // 删除成功
          console.log(`id为${key}的节点云端删除成功`)
        })
        .then(() => {
          // 在前端删除对象
          this.$refs.tree.remove(this.key)
          // 重新上传树图
          this.syncAreaTree()
          console.log(`id为${key}的节点前端删除成功`)
        })
        .catch(error => {
          console.log(error, '删除失败')
        })
      },

      // 提交编辑节点
      submit() {
        if(this.area.editStatus) {
          this.$store.commit('setAreaInit') // 结束编辑状态
          this.$refs.map.closePolygonEditor() //调用map子组件的方法，先关闭polygonEditor对象
          let area = this.setArea()
          this.editSave(area)
          this.syncAreaTree()
        }
        if(this.area.appendStatus) {
          this.$store.commit('setAreaInit') // 结束添加状态
          let area = this.createArea()
          this.appendSave(area) // 必须有个顺序，异步的上传
        }
      },

      appendNode() {
        this.key = this.$refs.tree.getCurrentKey()

        // 首先确认父节点选中与否
        if(!this.key) {
          this.$message('无选中节点，请单击节点后编辑')
          return false
        }

        // 当前节点设为添加状态
        this.$store.commit('setAreaAppend')
      },

      editNode() {
        // 通过组件定义的方法获取当前选中的节点
        this.key = this.$refs.tree.getCurrentKey()

        if(!this.key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        // 将节点设为编辑状态
        this.$store.commit('setAreaEdit')
      },

      removeNode() {
        let that = this
        this.key = this.$refs.tree.getCurrentKey()

        if(!this.key) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        // let area = this.destroyArea()
        // this.destroySave(area)
        // this.$store.commit('setArea', null)

        // // 遍历获取删除节点，研究遍历算法
        // function traverseTree(node, id) {
        //   if (node.id === id) {
        //     return node;
        //   }

        //   if(node.children && node.children.length>0) {
        //     for (let n of node.children) {
        //       console.log(node.name)
        //       return traverseTree(n);
        //     }
        //   }
        // }
        // function traverseTree(node) {
        //   if(!node) {
        //     return
        //   }

        //   if(node.children && node.children.length>0) {
        //     for (let node of node.children) {
        //       console.log(node.name)
        //       return traverseTree(node);
        //     }
        //   }
        // }

        let area = this.$api.SDK.Object.createWithoutData('Area', this.area.id);
        area.destroy().then(function (success) {
          // 删除成功
          console.log(`id为${that.area.id}的节点云端删除成功`)
          that.$refs.tree.remove(that.area.id)
          // 重新上传树图
          that.syncAreaTree()
        })
        .then(() => {
          // 在前端删除对象
          // that.$store.dispatch('deleteArea')
          that.$refs.map.removePolygon()
        })
        .catch(error => {
          console.log(error, '删除失败')
        })
      },

      cancelAllStatus() {
        this.$store.commit('setAreaInit')
        this.$refs.map.closePolygonEditor() //调用map子组件的方法，先关闭polygonEditor对象
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
