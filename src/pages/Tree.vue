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

          <!-- 在非编辑状态时，选择原节点 -->
          <span v-show=!data.editing>{{ node.label }}</span>

          <!-- 使用自定义指令和ref暂时解决了编辑问题，后面可以使用原生input来解决el-input的问题 -->
          <el-input
            :ref="data.id"
            v-show="data.editing"
            v-focus="data.editing"
            class="edit"
            size="mini"
            placeholder="请输入内容"
            :value=node.label
            clearable>
          </el-input>

          <span>
            <el-button
              type="text"
              size="mini"
              @click="() => edit(data)">
              {{data.editing ? '完成' : '编辑'}}
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
      }
    },

    methods: {
      append(data) {
        const newChild = { id: id++, label: '默认节点', children: [] };
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(newChild);
      },

      remove(node, data) {
        console.log(node, '\n')
        console.log(data, '\n')
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },

      edit(data) {
        console.log(data.editing)
        // 点击编辑或完成按钮后，需要切换当前状态
        if(data['editing'] === undefined) { // 当前如果是非编辑状态
          this.$set(data, 'editing', true) // 则将状态切换成编辑状态
          // this.$refs[data.id].value=data.label // 然后将当前label的值
        } else if (data['editing'] === true) { // 如果是编辑状态
          this.$delete(data, 'editing') // 则将编辑状态删除，改成非编辑状态
          this.$set(data, 'label', this.$refs[data.id].$el.children[0].value)
          //  console.log(this.$refs[data.id].value)
        }
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

<style>
  .tree {
    width: 400px;
  }
  .edit {
    /* height: 1px; */
    padding: 0;
  }
  .el-input--mini .el-input__inner {
    height: 24px;
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
