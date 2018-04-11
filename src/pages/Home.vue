<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <p>当前云端的todo数量是{{ todos.length }}个</p>

    <div class="list">
      <el-card class="box-card" v-for="todo in todos" :key="todo.id">
        <div slot="header" class="clearfix">
          <span>用户于</span>
          <span>{{formatDate(todo.createdAt)}}</span>
          <span>提交了问题</span>
        </div>
        <div class="content">
          {{todo.get('content')}}
        </div>
        <div class="imgs">
          <div v-for="url in todo.get('imagesUrl')" :key="url" class="imageItem">
            <img :src=url>
          </div>
        </div>
        <div class="text item">
          {{todo.get('location')}}
        </div>

        <div class="bottom">
          <span>底部</span>
          <el-button-group>
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="primary" size="mini" icon="el-icon-share"></el-button>
            <el-button type="primary" size="mini" icon="el-icon-delete"></el-button>
          </el-button-group>
        </div>
      </el-card>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {
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
      nowTime: new Date()
    }
  },
  methods: {
    toTimestamp(dateObj) {
      Math.round(dateObj.getTime()/1000)
    },
    // 格式化时间为yy-mm-dd hh:mm:ss
    formatDate(dateObj) {
      let year = dateObj.getFullYear();
      let month = dateObj.getMonth() + 1;
      month = month < 10 ? '0' + month : month;
      let date = dateObj.getDate();
      date = date < 10 ? '0' + date : date;
      let hour = dateObj.getHours();
      hour = hour < 10 ? '0' + hour : hour;
      let minute = dateObj.getMinutes();
      minute = minute < 10 ? '0' + minute : minute;
      let second = dateObj.getSeconds();
      second = second < 10 ? '0' + second : second;
      return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
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
.operator {
  background-color: bisque;
}
.imgs {
  background: burlywood;
  display: flex;
  flex-direction: row;
  height: 50px;
}
.imgs .imgItem img{
  height: 40px;
}
</style>
