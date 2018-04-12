<template>
  <div class="container">
    <h2>欢迎注册</h2>
    <div class="from-panel">
      <el-form
        label-position="left"
        ref="form"
        label-width="80px"
        :rules="rules"
        :model="user">
        <el-form-item label="你的名字" prop="name">
          <el-input v-model="user.name" placeholder="真实姓名或昵称"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input type="password" v-model="user.pwd" placeholder="不少于6位数的密码"></el-input>
        </el-form-item>
        <div class="oprator">
          <el-button class="submit" type="primary" @click="submitForm('form')">提交</el-button>
          <el-button class="submit" @click="resetForm('form')">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {

  name: 'signUp',

  data() {
    return {
      user: {
        name: '',
        email: '',
        pwd: '',
        cpwd: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 7, message: '长度在 2 到 7 个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请填入邮箱', trigger: 'blur' },
          { type: 'email', message: '必须是合法的邮箱格式', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { type: '', message: '必须设置密码', trigger: 'blur' },
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let user = new this.$api.SDK.User()
          user.setUsername(this.user.name)
          user.setPassword(this.user.pwd)
          user.setEmail(this.user.email)

          user.signUp().then((loginUser) => {
            this.$store.commit('setUser', loginUser) // 保存到 Vuex 中
            this.$router.go(-1) // 回到上一页
            this.$message.success(`${loginUser.get('username')}注册成功！`) // message方法是element-ui添加的一个方法
          }).catch(error => {
            console.error(error)
            this.$message.error(error.rawMessage)
          })
        } else {
          console.log('error submit!!');
          this.$message.error('错了哦，您填写的信息有错误，请按照提示修改。');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style lang="css" scoped>
.container{
  padding: 60px 10%;
  background: #fafafa;
  height: calc(100vh - 180px);
}

h1{
  text-align: center;
  font-weight: 100;
  font-size: 40px;
  margin-bottom: 35px;
}

.from-panel{
  width: 50%;
  margin: 0 auto;
}

.oprator{
  margin-top: 30px;
  text-align: center;
}

</style>
