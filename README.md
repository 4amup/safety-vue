# safety-vue

## 业务清单
* [x] 登录登出注册等逻辑实现

* [x] 定义部门组织关系，使用element树形图，接入todo的options选项中，异步加载或同步

* [ ] 添加按钮举报不合适的todo提交，由管理员确认，后端直接删除

* [ ] 分类功能

* [ ] 应急物资列入地图清单中

* [ ] 使用穿梭框实现部门和作业区域的绑定

* [ ] 使用exif.js获取图片元信息，直接获取位置信息，后台或前台实现

* [ ] 需要登录后才可以进行的操作，逻辑实现

* [ ] 图库需要登录后操作，图库实现，时间线的视图、列表视图、尽量多种实现

* [ ] 高德地图可视化方案，~~自定义室内地图~~，~~Loca方案~~，不能显示名称，准备重新采用JS API的polygon实现，AMap.LayerGroup(layers: Array)这个API可以批量改变覆盖物的属性。

* [ ] 问题提交按钮的功能实现，采用element-ui中的dialog对话框实现，借鉴知乎

* [ ] 我的消息，采用一级导航实现，导航消息从用leancloud中的社交化模块内容实践

* [ ] 草稿箱的逻辑，发布时自动或手动保存到自己的草稿箱，自己可见，自己可修改。正式发布后，除超级管理员外，任何人不可修改。

* [ ] 安技员可以后台生成本月的ppt材料，或者通过系统直接演示，整改和未整改情况直接对比展示。

* [ ] 自定义实现级联选择器和地图的联动，逐级显示，一步步精确。

## 算法实现

* [ ] 通过分析语言描述和图片分析是否重复相似问题，重复发生，显示建议

* [ ] 发布的todo，由机器在后台实现更加合理的表达，机器学习。

* [x] 树形结构储存的思路：拟采用[方法三](https://blog.csdn.net/codepython/article/details/49615297)。

## 数据表设计

1. Todo（待办事项）

|     字段     |    类型    |                   说明                   |
|:------------:|:----------:|:----------------------------------------:|
|    content   |   String   |  事项描述，文字直接存，语音保存文件地址  |
| reformContent|   String   |  事项描述，文字直接存，语音保存文件地址  |
|    images    |   AVFile   |        与事项相关的图片或语音信息        |
|  imagesUrl   |   String   |           与事项有关的图片地址           |
|    rImages   |   AVFile   |        与事项相关的图片或语音信息        |
|  rImagesUrl  |   AVFile   |        与事项相关的图片或语音信息        |
|   location   |   String   |             处理该事项的地点             |
|   priority   |   Number   |      0 优先级最高，最迫切需要完成。      |
|   reminders  |    Array   |            设置提醒日期和时间            |
|    status    |   Number   |      0 未完成，1 已完成，2 复查完毕      |
|     views    |   Number   |           该事项被浏览过的次数           |
| whereCreated | AVGeoPoint |         该事项被创建时的地理定位         |
|  whenCreated |    Date    | 该事项发生的时间，采用照片拍摄时间或自选  |
|  creater     |    Pointer | 该事项的创建者，指向_User               |
|  transactor  |    Pointer | 该事项的整改图片上传者，指向_User        |
|  checker     |    Pointer | 该事项的检查者，指向_User               |
|  department  |    Pointer | 该事项属地单位                         |

2. 重新设计tree的数据格式，每个层级一个数据行，现在的数据上传效率太慢了，area表，client、company、plant、

|     字段     |    类型    |                   说明                   |
|:------------:|:----------:|:----------------------------------------:|
|      ID      |   auto     |  自动生成的id                            |
|    name      |   String   |  区域的名称                                |
|    type      |   String   |  区域类型，包括client、company、plant、stride、area等|
|    path      |  Array     |  路径的经纬度坐标组   |

至于树的结构的生成，采用后台的函数进行。
