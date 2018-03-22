<template>
  <div class="container">
    <h1>tree</h1>

    <div class="tree">
      <el-tree
        :data="data5"
        node-key="id"
        default-expand-all
        :highlight-current="true"
        :expand-on-click-node="false">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-show="!editFlag">{{ node.label }}</span>
          <el-input
            class="edit"
            v-if="editFlag"
            size="mini"
            placeholder="请输入内容"
            v-model="node.label">
          </el-input>
          <span>
            <el-button
              type="text"
              size="mini"
              @click="() => setCurrentNode(node)">
              {{editFlag ? '完成' : '编辑'}}
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="() => append(data)">
              添加
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="() => remove(node, data)">
              删除
            </el-button>
          </span>
        </span>
      </el-tree>
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
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
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
        editFlag: false
      }
    },

    methods: {
      setCurrentNode(node) {
        this.editFlag ? this.editFlag=false : this.editFlag=true
        // node.data.label = 'yes'
      },
      // editNodeLabel(object, node, component) {
      //   // console.log(object, node, component)
      // },
      append(data) {
        const newChild = { id: id++, label: 'testtest', children: [] };
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(newChild);
      },

      remove(node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },
    }
  };
</script>

<style>
  .tree {
    width: 400px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
