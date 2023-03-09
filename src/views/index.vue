<template>
  <div>
    <div class="top">
      <img :src="backgroundImage" alt="" />
    </div>
    <div class="front" style="margin-left: 150px">
      <el-container>
        <el-header style="font-size:20px;margin-top:30px;solid"
          >
          <b style="color: black; font-size: 30px">哈夫曼树生成系统</b></el-header
        >
        <el-main>
          <p>请输入以下想要构建出的哈夫曼树的关键值，可以是任意一串文本。</p>
          <br />
          <p>若不输入，则使用给定的文本:"Hello World!"。</p>
          <br>
          <p>其关键值为：{ "H": 1, "e": 1, "l": 3, "o": 2, " ": 1, "W": 1, "r": 1, "d": 1, "!": 1 }</p>
          <br />
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入随机文本，或直接点击确定"
            v-model="text_area"
          >
          </el-input>

          <el-button
            type="danger"
            onclick="test()"
            style="margin-top: 30px"
            plain
            >确定</el-button
          >
          <el-button
            type="danger"
            onclick="pushPage()"
            style="margin-top: 30px"
            plain
            >跳转至AOE网页面</el-button
          >
          <br />

          <div style="border: 1px solid white; margin-top: 30px">
            <el-table :data="treeData">
              <el-table-column prop="tree_value" label="关键值">
              </el-table-column>
              <el-table-column prop="frequency" label="出现频次">
              </el-table-column>
              <el-table-column prop="huffman_code" label="哈夫曼编码">
              </el-table-column>
            </el-table>
            <br><b>
            "{{initial_words}}" 的最终编码结果为:<br>{{final_code}}
            </b><br><br>
          </div>

          <div id="father" style="border: 1px dashed #000; margin-top: 30px">
            <div style="width: 700px; height: 500px" id="container0"></div>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";

class Node {
  constructor(value, char, parent, lastId, left, right, tag, x, y) {
    this.val = value;           // 字符出现次数
    this.char = char;           // 待编码字符
    this.parent = parent;       //当前节点的父母
    this.lastId = lastId;       //上次遍历过的节点id
    this.left = left;           //左孩子
    this.right = right;         //右孩子
    this.tag = tag;             //标记自身是左孩子还是右孩子
    this.x = x;                 //用于echarts绘图表示位置
    this.y = y;                 //用于echarts绘图表示位置
  }
}

class huffmanTree {
  constructor(str) {
    // 统计字符出现频率
    let hash = {};
    for (let i = 0; i < str.length; i++) {
      hash[str[i]] = ~~hash[str[i]] + 1;
    }

    //字符出现频次表
    this.hash = hash;             

    // 构造哈夫曼树
    this.huffmanTree = this.getHuffmanTree();

    // 对照表，即每个字符的二进制编码是什么
    this.map = this.getHuffmanCode(this.huffmanTree);

    // 最终的二进制编码
    this.binaryStr = this.getBinaryStr(this.map, str);

  }

  // 构造哈夫曼树
  getHuffmanTree() {
    // 以各个字符出现次数为node.val, 构造森林
    let forest = [];
    for (let char in this.hash) {
      let node = new Node(this.hash[char], char);
      forest.push(node);
    }

    // 等到森林只剩一个节点时，表示合并过程结束，树就生成了
    let allNodes = []; // 存放被合并的节点，因为不能真的删除森林中任何一个节点，否则.left .right就找不到节点了
    while (forest.length !== 1) {
      // 从森林中找到两个最小的树，合并之
      forest.sort((a, b) => {
        return a.val - b.val;
      });

      let node = new Node(forest[0].val + forest[1].val, "");
      allNodes.push(forest[0]);
      allNodes.push(forest[1]);
      node.left = allNodes[allNodes.length - 2]; // 左子树放置词频低的
      node.right = allNodes[allNodes.length - 1]; // 右子树放置词频高的
      node.left.tag = "l";
      node.right.tag = "r";
      node.left.parent = node;
      node.right.parent = node;
      // 删除最小的两棵树
      forest = forest.slice(2);
      // 新增的树加入
      forest.push(node);
    }

    // 生成的哈夫曼树
    return forest[0];
  }

  // 遍历哈夫曼树，返回一个 原始字符 和 二进制编码 的对照表
  getHuffmanCode(tree) {
    let hash = {}; // 对照表
    let traversal = (node, curPath) => {
      if (!node.length && !node.right) return;
      if (node.left && !node.left.left && !node.left.right) {
        hash[node.left.char] = curPath + "0";
      }
      if (node.right && !node.right.left && !node.right.right) {
        hash[node.right.char] = curPath + "1";
      }
      // 往左遍历，路径加0
      if (node.left) {
        traversal(node.left, curPath + "0");
      }
      // 往右遍历，路径加1
      if (node.right) {
        traversal(node.right, curPath + "1");
      }
    };
    traversal(tree, "");
    return hash;
  }

  // 返回最终的压缩后的二进制串
  getBinaryStr(map, originStr) {
    let result = "";
    for (let i = 0; i < originStr.length; i++) {
      result += map[originStr[i]];
    }
    return result;
  }
}

export default {
  name: "index",
  data() {
    return {
      backgroundImage: require("@/static/img/background.jpg"),
      count: 0,
      text_area: "",
      hash_map: "",
      final_code:"",
      initial_words:"",
      treeData:[],
      node_data: [],
      node_links: [],
      chart_draw: 0, //画过图的次数
    };
  },

  methods: {
    test() {
      this.count = 0;
      this.hash_map="";
      this.treeData.length=0;
      this.node_data.length=0;
      this.node_links.length=0;
            
      var text = this.text_area;
      if (text == null || text == "") 
        text = "Hello World!";

      let tree = new huffmanTree(text);
      // console.log(tree)
      this.hash_map = tree.hash;

      for(var i in tree.hash){
        var item={
            tree_value:i,
            frequency:tree.hash[i],
            huffman_code:tree.map[i]
        }
        this.treeData.push(item)
      }

      this.final_code=tree.binaryStr;
      this.initial_words=text;
      this.levelOrder(tree.huffmanTree);

      setTimeout(() => {
        this.initCharts();
        this.chart_draw++;
      }, 500);
    },
    levelOrder(T) {
      this.node_links.length = 0;
      this.node_data.length = 0;
      if (T == null) return [];
      //全局数组
      var array = [];
      //遍历第一层
      this.setTree(T, 0, array);
      return array;
    },
    //设置树之间的关系和位置关系
    setTree(T, level, array) {
      //先序遍历
      if (!T) return;
      if (!array[level]) {
        //全局数组中，如果没有初始化改成，创建一层
        array[level] = [];
      }
      // var value=20;
      // 存放该层的数据。
      array[level].push(T);
      if (T.parent == null) {
        //设置为根节点
        T.x = 500;
        T.y = 300;
      } else {
        if (T.tag == "l") T.x = T.parent.x - 300 / level;
        else if (T.tag == "r") T.x = T.parent.x + 300 / level;
        T.y = T.parent.y + 120;
        // value-=level;
      }
      var item = {
        id: this.count,
        x: T.x,
        y: T.y,
        fixed: true,
        name: T.char,
        symbol: "circle",
        value: 20,
        symbolSize: 30,
      };

      if (T.left != null) T.left.lastId = this.count;

      if (T.right != null) T.right.lastId = this.count;

      var l_or_r;
      if(T.tag=='l')
        l_or_r='0';
      else
        l_or_r='1';
      var line = {
        source: T.lastId,
        target: this.count,
        label:l_or_r
      };

      this.node_links.push(line);
      this.node_data.push(item);
      this.count++;
      // console.log(this.node_data)

      //层级+1，递归左边子树
      this.setTree(T.left, level + 1, array);
      //递归右边子树
      this.setTree(T.right, level + 1, array);
    },
    initCharts() {
      //删除上一次生成的
      var s = document.getElementById(
        "container" + JSON.stringify(this.chart_draw - 1)
      );
      if (s != null) {
        s.parentNode.removeChild(s);
        //重新生成
        var newdiv = document.createElement("div");
        newdiv.style = "width:700px;height:500px;";
        newdiv.id = "container" + this.chart_draw;
        document.getElementById("father").appendChild(newdiv);
      }

      var myChart = echarts.init(
        document.getElementById("container" + this.chart_draw)
      );
      echarts.init(document.getElementById("container" + this.chart_draw)); //销毁echarts实列解决组件重新渲染时echarts组件不重新渲染

      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          //设置提示框浮层
          show: false, //默认显示
          showContent: false, //是否显示提示框浮层
          trigger: "item", //触发类型，默认数据项触发
        },
        series: [
          {
            type: "graph", //关系图
            name: "", //系列名称，用于tooltip的显示，legend 的图例筛选，在 setOption 更新数据和配置项时用于指定对应的系列。
            layout: "none", //图的布局，类型为力导图，'circular' 采用环形布局，见示例 Les Miserables
            legendHoverLink: false, //是否启用图例 hover(悬停) 时的联动高亮。
            hoverAnimation: false, //是否开启鼠标悬停节点的显示动画
            coordinateSystem: null, //坐标系可选
            xAxisIndex: 0, //x轴坐标 有多种坐标系轴坐标选项
            yAxisIndex: 0, //y轴坐标

            roam: true, //是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            nodeScaleRatio: 0.6, //鼠标漫游缩放时节点的相应缩放比例，当设为0时节点不随着鼠标的缩放而缩放
            focusNodeAdjacency: true, //是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。

            edgeSymbol: ["none", "none"], //边两端的标记类型，可以是一个数组分别指定两端，也可以是单个统一指定。默认不显示标记，常见的可以设置为箭头，如下：edgeSymbol: ['circle', 'arrow']
            edgeSymbolSize: 10, //边两端的标记大小，可以是一个数组分别指定两端，也可以是单个统一指定。
            itemStyle: {
              //===============图形样式，有 normal 和 emphasis 两个状态。normal 是图形在默认状态下的样式；emphasis 是图形在高亮状态下的样式，比如在鼠标悬浮或者图例联动高亮时。
              normal: {
                //默认样式
                label: {
                  show: true,
                },
                borderType: "solid", //图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
                borderColor: "rgba(42,245,255,0.79)", //设置图形边框为淡金色,透明度为0.4
                borderWidth: 0, //图形的描边线宽。为 0 时无描边。
                opacity: 1,
                // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5
              },
              emphasis: {
                //高亮状态
                borderWidth: 2,
              },
            },
            lineStyle: {
              //==========关系边的公用线条样式
              normal: {
                color: "#F56C6C",
                width: "2",
                type: "solid", //线的类型 'solid'（实线）'dashed'（虚线）'dotted'（点线）
                curveness: 0, //线条的曲线程度，从0到1
                opacity: 1,
                // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5
              },
              emphasis: {
                //高亮状态
                color: "red",
              },
            },
            label: {
              //=============图形上的文本标签
              normal: {
                show: true, //是否显示标签。
                position: "inside", //标签的位置。['50%', '50%'] [x,y]
                textStyle: {
                  //标签的字体样式
                  color: "#cde6c7", //字体颜色
                  fontStyle: "normal", //文字字体的风格 'normal'标准 'italic'斜体 'oblique' 倾斜
                  fontWeight: "bolder", //'normal'标准'bold'粗的'bolder'更粗的'lighter'更细的或100 | 200 | 300 | 400...
                  fontFamily: "sans-serif", //文字的字体系列
                  fontSize: 16, //字体大小
                },
              },
              emphasis: {
                //高亮状态
              },
            },

            data: this.node_data,
            links: this.node_links,
          },
        ],
      };

      myChart.setOption(option, true);
    },
    pushPage() {
      this.$router.push({ path: "/activity" });
    },
  },

  mounted() {
    window.test = this.test;
    window.pushPage = this.pushPage;
  },
};
</script>

<style>
.top {
  width: 100%;
  height: 100%; /**宽高100%是为了图片铺满屏幕 */
  z-index: -1;
  position: absolute;
}
.front {
  z-index: 1;
  position: absolute;
}
.echarts {
  width: 100%;
  height: 100%;
}
* {
  padding: 0;
  margin: 0;
}
.el-header {
  height: 70px;
}
.el-table,
.el-table__expanded-cell {
  background-color: transparent !important;
}
/* 表格内背景颜色 */

.el-table th,
.el-table tr,
.el-table td {
  background-color: transparent !important;
}
.el-table .cell {
  color: black;
}
</style>