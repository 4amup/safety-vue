<template>
  <div class="container">
    <div class="tree">
      <h2>厂区关系图</h2>
      <el-tree
        ref="tree"
        @current-change="selectCurrentNode"
        :data="data5"
        node-key="id"
        default-expand-all
        :highlight-current="true"
        :check-strictly="false"
        :expand-on-click-node="false"
        :show-checkbox='true'>
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-if="!data.editing"><i class="el-icon-info"></i>  {{ node.label }}</span>

           <!-- 编辑框 -->
          <!-- <el-input
            v-else
            @blur="() => submitNodeValue(data)"
            v-focus="data.editing"
            size="mini"
            :value="editing"
            clearable>
          </el-input> -->
        </span>
      </el-tree>

    </div>

    <div class="areaInfo">
      <h2>信息</h2>

      <p v-if="!currentNode">暂无数据，选中节点后，显示当前节点数据</p>

      <div v-else v-show="!this.editing">
        <p><span>节点id：</span>{{currentNode.id}}</p>
        <p><span>节点label：</span>{{currentNode.label}}</p>
        <p><span>节点名称：</span>{{currentNode.name}}</p>
        <p><span>节点路径：</span>{{currentNode.path}}</p>


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

      <el-button-group>
        <el-button @click="editNode">{{this.editing ? '提交' : '编辑'}}</el-button>
        <el-button @click="appendNode">{{this.appending ? '提交': '添加'}}</el-button>
        <el-button>删除</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
  let id = 1000;

  export default {
    data() {
      const data = [{
        id: 1,
        label: '一级 1',
        name: '一级名字',
        path: '未定义',
        children: [{
          id: 4,
          label: '二级 1-1'
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-1'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2'
        }]
      }];
      return {
        data5: JSON.parse(JSON.stringify(data)),
        editing: false,
        appending: false,
        currentNode: null,
        childNode: {
          id: 48,
          label: '默认节点'
        }
      }
    },

    methods: {
      selectCurrentNode(data, node) {
        // this.$message({
        //   dangerouslyUseHTMLString: true,
        //   message: `已选中<strong>${data.label}</strong>节点，请点击下方按钮进行操作`
        // });
        this.currentNode = data
        // console.log(data, '\n')
        // console.log(node, '\n')
        // this.editing = node.label
      },

      // submitNodeValue(data) {
      //   if(data['editing'] === undefined) { // 当前如果是非编辑状态
      //     this.$set(data, 'editing', true) // 则将状态切换成编辑状态
      //     // this.$refs[data.id].value=data.label // 然后将当前label的值
      //   } else if (data['editing'] === true) { // 如果是编辑状态
      //     this.$delete(data, 'editing') // 则将编辑状态删除，改成非编辑状态
      //     //  console.log(this.$refs[data.id].value)
      //   }
      //   console.log('submit')
      //   console.log(data);
      // },

      appendNode() {
        let node = this.$refs.tree.getCurrentNode()
        let nodeId = this.$refs.tree.getCurrentKey()
        console.log(node);

        if(!node) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.appending) {
          let form = this.$refs.appendingForm.model
          let newChild = form
          if(!this.currentNode.children) {
            this.currentNode.children = []
          }
          this.currentNode.children.push(newChild);
          this.appending = false
        } else {
          // 设置为添加状态
          this.appending = true
        }
        // const newChild = { id: id++, label: '默认节点', children: [] };
        // if (!this.currentNode.children) {
        //   this.$set(this.currentNode, 'children', []);
        // }
        // this.currentNode.children.push(newChild);
      },

      editNode() {
        let node = this.$refs.tree.getCurrentNode()
        let nodeId = this.$refs.tree.getCurrentKey()

        if(!node) {
          this.$message('无选中节点，请单击节点后编辑')
          return
        }

        if(this.editing) {
          let form = this.$refs.editingForm.model
          this.currentNode = form;
          this.editing = false
        } else {
          // 设置为编辑状态
          this.editing = true
        }
      },

      remove(node, data) {
        console.log(node, '\n')
        console.log(data, '\n')
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
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

<style>
  .container {
    display: flex;
    flex-direction: row;
  }

  .tree, .areaInfo {
    width: 50%;
  }

  .custom-tree-node {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    padding-right: 8px;
  }
</style>
