<template>
  <p>todoshow的ID是：{{id}}</p>
</template>

<script>
export default {
  data() {
    return {
      id: null
    }
  },
  created(){
    const id = this.$route.params.id;
    this.id = id;
  },
}
</script>
