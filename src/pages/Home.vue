<template>
  <div class="container">
    <!-- <p>当前云端的todo数量是{{ todos.length }}个</p> -->
    <div class="list">
      <div class="todo-item" v-for="todo in todos" :key="todo.id" @click="changeCurrentTodo">
        <div>
          <span><a href="#">{{todo.get('creator').get('username')}}</a> 于 </span>
          <span>{{formatDate(todo.createdAt)}}</span>
          <span>提交了问题</span>
        </div>
        <div class="content">
          {{todo.get('content')}}
        </div>
        <!-- <div class="imgs">
          <div v-for="url in todo.get('imagesUrl')" :key="url" class="imageItem">
            <img :src=url>
          </div>
        </div> -->
        <div class="text item">
          <i class="el-icon-location"></i>
          {{todo.get('location')}}
        </div>

        <div class="bottom">
          <span>bottom</span>
          <el-button-group>
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="primary" size="mini" icon="el-icon-share"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
          </el-button-group>
          <router-link :to="{ name:'TodoShow', params: {id: todo.id} }">详情</router-link>
        </div>
      </div>
    </div>

    <div class="map">
      <map-marker :todos="todos"></map-marker>
    </div>
  </div>
</template>

<script>
import MapMarker from "@/components/MapMarker"

export default {
  name: 'Home',
  components: {
    MapMarker
  },
  mounted() {
    let query = new this.$api.SDK.Query('Todo');
    query.include('creator');
    query.limit = 10 // 限制返回数量
    query.find().then(todos => {
      // 获取首页todos数据，未来配合or查询实现分页，或分类查询，或时间段查询
      this.todos  = todos
    })
    .catch(error => {
      console.log(error)
    })
  },
  data () {
    return {
      currentTodoId: null,
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
    },
    changeCurrentTodo(event) {
      // let node = event.target;s
      // node.className = 'current-todo'
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
.container {
  display: flex;
  flex-direction: row;
  padding: 5px 100px;
  background: #f6f6f6;
}
.list {
  width: 55%;
  /* padding: 0 5px 5px 5px; */
}
/* todo项目的样式文件 */
.todo-item {
  color: #999;
  /* border-bottom: #999 1px solid; */
  padding: 10px;
  border-radius: 5px;
  /* box-shadow: 2px 2px 5px #888888; */
  box-shadow: 5px #888888;
  margin: 5px;
  background: #fff;
}
.todo-item:hover {
  color: black
}
.current-todo {
  background:blanchedalmond;
}
.map {
  width: 45%;
  padding: 5px;
  border-radius: 5px;
}
/* .operator {
  background-color: bisque;
} */
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
