<template>
  <div class="container">
    <div class="tree">
      <h2>厂区关系图</h2>
      <el-tree
        ref="tree"
        @current-change="selectCurrentNode"
        :data="data"
        :default-expanded-keys="[0]"
        node-key="objectId"
        default-expand-all
        :highlight-current="true"
        :check-strictly="false"
        :expand-on-click-node="false">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-if="!data.editing"><i class="el-icon-info"></i>  {{ node.label }}</span>
        </span>
      </el-tree>

    </div>

    <div class="areaInfo">
      <h2>区域信息</h2>

      <p v-if="!currentNode">无数据，选中后，显示该节点数据</p>

      <div v-else v-show="!this.editing">
        <p><span>节点id：</span>{{currentNode.objectId}}</p>
        <p><span>节点label：</span>{{currentNode.label}}</p>
        <p><span>节点名称：</span>{{currentNode.name}}</p>
        <p><span>节点路径：</span>{{currentNode.path}}</p>
        <p><span>节点类型：</span>{{currentNode.type}}</p>
        <p><span>子节点数量：</span>{{currentNode.children ? currentNode.children.length : '无子节点'}}</p>

      </div>

      <el-form v-if="this.editing" ref="editingForm" :model="currentNode" label-position="right" label-width="70px">
        <el-form-item label="label：">
          <el-input v-model="currentNode.label"></el-input>
        </el-form-item>
        <el-form-item label="名称：">
          <el-input v-model="currentNode.name"></el-input>
        </el-form-item>
        <el-form-item label="路径：">
          <el-input v-model="currentNode.path"></el-input>
        </el-form-item>
      </el-form>

      <el-form v-if="this.appending" ref="appendingForm" :model="childNode" label-position="right" label-width="70px">
        <el-form-item label="label：">
          <el-input v-model="childNode.label"></el-input>
        </el-form-item>
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
    </div>
  </div>
</template>

<script>
  let id = 1000;

  export default {
    data() {
      return {
        data: [],
        editing: false,
        appending: false,
        currentNode: null,
        childNode: {
          label: '默认节点',
          type: null,
        },
        type: ['Factory', 'Workshop', 'Stride', 'Area']
      }
    },

    mounted() {
      let query = new this.$api.SDK.Query('Factory')
      let root=[]
      query.first().then(factory => {
        root.push(factory.toJSON())

        let F = this.$api.SDK.Object.createWithoutData('Factory', factory.id);
        let q = new this.$api.SDK.Query('Workshop');
        q.equalTo('dependent', F);
        q.find().then(function (workshops) {
          root[0].children = []
          workshops.forEach(function (w, i, o) {
            console.log(w.get('label'))

            root[0].children.push(w.toJSON());
          });

        });
      })
      this.data = root
    },

    methods: {
      selectCurrentNode(data, node) {
        this.currentNode = data
      },

      appendNode() {
        // 如果数据项是空的，则表示处于初始化状态
        if(this.data.length === 0) {
          this.$message('初始化中...')
          if(this.appending) {
            let form = this.$refs.appendingForm.model
            this.data = []

            let Factory = this.$api.SDK.Object.extend('Factory')
            let factory = new Factory()
            factory.set('label', form.label);
            factory.set('type', 'Factory');
            factory.set('path', null);
            factory.save().then(factory => {
              console.log('objectId:', factory.objectId)

              // 前端显示
              this.data.push(form)
              this.appending = false
            })
            .catch(error => {
              console.error(error);
            })

          } else {
            // 设置为添加状态
            this.appending = true
          }
          return
        }

        // 首先确认父节点选中与否
        let parentNode = this.$refs.tree.getCurrentNode()

        if(!parentNode) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.appending) { // 在添加状态
          let form = this.$refs.appendingForm.model
          let newChild = form

          let parent = this.$api.SDK.Object.createWithoutData(parentNode.type, parentNode.objectId);
          let index = this.type.findIndex(e => e === parentNode.type)
          let childType = this.type[index+1]
          console.log(childType)
          let child = new this.$api.SDK.Object(childType);
          child.set('label', form.label);
          child.set('dependent', parent);
          child.save()
          .then(() => {
            this.$refs.tree.append(newChild, parentNode)

            this.childNode = {
              label: '默认节点'
            }
            this.appending = false
          });


        } else {
          // 设置为添加状态
          this.appending = true
        }
      },

      editNode() {
        let node = this.$refs.tree.getCurrentNode()

        if(!node) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.editing) {
          let form = this.$refs.editingForm.model

          let factory = this.$api.SDK.Object.createWithoutData('Factory', node.objectId);
          // 修改属性
          factory.set('label', form.label)
          // 保存到云端
          factory.save()
          .then(() => {
            node = form
            console.log(`${node.objectId}更新成功`)
            this.editing = false
          });
        } else {
          // 设置为编辑状态
          this.editing = true
        }
      },

      removeNode() {
        let node = this.$refs.tree.getCurrentNode()

        if(!node) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        // 判断当前节点类型
        let factory = this.$api.SDK.Object.createWithoutData(node.type, node.objectId);
        factory.destroy().then(function (success) {
          // 删除成功
          console.log(`${node.objectId}删除成功`)
          this.$refs.tree.remove(node)
        }, function (error) {
          // 删除失败
        });
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
    width: 300px;
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
