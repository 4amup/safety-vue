<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <p>当前云端的todo数量是{{ todos.length }}个</p>

    <div class="list">
      <el-card class="box-card" v-for="todo in todos" :key="todo.id">
        <div slot="header" class="clearfix">
          <span>卡片名称</span>
          <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
        </div>
        <div class="text item">
          {{todo.get('content')}}
        </div>
        <div class="text item">
          {{todo.get('location')}}
        </div>
      </el-card>
    </div>

  </div>
</template>

<script>
// import TestUpload from '@/components/TestUpload'
export default {
  name: 'Home',
  components: {
    // TestUpload
  },
  mounted() {
    let query = new this.$api.SDK.Query('Todo');
    query.limit = 10 // 限制返回数量
    query.find().then(todos => {
      console.log(todos)

      // 获取首页todos数据，未来配合or查询实现分页，或分类查询，或时间段查询
      this.todos  = todos
    })
    .catch(error => {
      console.log(error)
    })
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      todos: [],
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.list {
  width: 40%;
  padding: 0 5%;
}
</style>
