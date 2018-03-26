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
        <p><span>节点id：</span>{{currentNode.id}}</p>
        <p><span>节点label：</span>{{currentNode.label}}</p>
        <p><span>节点名称：</span>{{currentNode.name}}</p>
        <p><span>节点路径：</span>{{currentNode.path}}</p>
        <p><span>子节点数量：</span>{{currentNode.children ? currentNode.children.length : '无子节点'}}</p>

      </div>

      <el-form v-if="this.editing" ref="editingForm" :model="currentNode" label-position="right" label-width="70px">
        <el-form-item label="ID：">
          <el-input v-model="currentNode.id"></el-input>
        </el-form-item>
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
        <el-form-item label="ID：">
          <el-input v-model="childNode.id"></el-input>
        </el-form-item>
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
      const data = [];
      return {
        data: JSON.parse(JSON.stringify(data)),
        editing: false,
        appending: false,
        currentNode: null,
        childNode: {
          id: id++,
          label: '默认节点'
        }
      }
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
            this.data.push(form)

            this.appending = false
          } else {
            // 设置为添加状态
            this.appending = true
          }
          return
        }

        // 首先确认父节点的存在
        let parantNode = this.$refs.tree.getCurrentNode()

        if(!parantNode) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.appending) {
          let form = this.$refs.appendingForm.model
          let newChild = form

          this.$refs.tree.append(newChild, parantNode)

          this.childNode = {
            id: id++,
            label: '默认节点'
          }
          this.appending = false
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
          node = form;
          this.editing = false
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

        this.$refs.tree.remove(node)
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
