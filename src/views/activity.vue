<template>
  <div>
    <div class="top">
      <img :src="backgroundImage" alt="" />
    </div>
    <div class="front" style="margin-left: 150px">
      <el-container>
        <el-header style="font-size:20px;margin-top:30px;solid">
          <b style="color: black; font-size: 30px"
            >AOE网工程生成系统</b
          ></el-header
        >
        <el-main>
          本系统通过输入工程活动图 AOE
          网,自动判断工程的可行性、关键活动，并画出可视化图形。<br />
          空白则生成默认活动，
          请下拉查看生成的AOE网（可拖拽变换为想要的图形）<br />

          <el-input
            type="textarea"
            style="margin: 10px; display: inline"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="请输入所有活动，以逗号隔开，例:v0,v1,v2,v3,v4,v5,v6,v7,v8,v9"
            v-model="text_area1"
          >
          </el-input>
          <el-input
            type="textarea"
            style="margin: 10px; display: inline"
            :autosize="{ minRows: 6, maxRows: 4 }"
            placeholder="请输入活动与其到下一活动所需要的时间，单行以空格隔开不同活动以回车隔开，例：
            v0,v1,3  
            v0,v2,4  
            v1,v4,6  
            v1,v3,5  
            v2,v3,8  
            v2,v5,7  
            v3,v4,3  
            v5,v7,6  
            v4,v6,9  
            v4,v7,4  
            v7,v8,5  
            v6,v9,2  
            v8,v9,3  
          "
            v-model="text_area2"
          >
          </el-input>

          <el-button
            type="danger"
            @click="calltest()"
            style="margin-top: 30px"
            plain
            >确定</el-button
          >
          <el-button
            type="danger"
            @click="returnPage()"
            style="margin-top: 30px"
            plain
            >跳转至Huffman树页面</el-button
          >
          <br />
          <div style="border: 1px solid white; margin-top: 30px">
            <el-table :data="tableData">
              <el-table-column prop="v_name" label="活动名称">
              </el-table-column>
              <el-table-column prop="earlist" label="最早开始时间">
              </el-table-column>
              <el-table-column prop="latest" label="最晚完成时间">
              </el-table-column>
            </el-table>
            <br />
            <b>
              全工程最早完成时间：{{ max_time }} <br /><br />
              关键活动：{{ critical_ac }} <br /><br />
              关键路径：{{ critical_path }} <br />
            </b>
            <br />
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

class vex {
  constructor(value) {
    this.data = value;
    this.firstEdge = null;
    this.in = 0; //用于存放顶点的入度
  }
}

class adjvex {
  constructor(node, weight) {
    this.node = node;
    this.weight = weight;
    this.next = null;
  }
}

class Graph {
  constructor(v, vr) {
    this.v = v;
    let len = v.length;
    let vexs = new Array(len);
    let v1 = 0,
      v2 = 0;
    let newvex = null;
    for (let i = 0; i < len; i++) {
      vexs[i] = new vex(v[i]);
    }
    for (let arc of vr) {
      v1 = v.indexOf(arc[0]);
      v2 = v.indexOf(arc[1]);

      var edge = vexs[v2].firstEdge;
      while (edge != null) {
        //测试是否为环
        if (edge.node == v1) {
          this.adjList = null;
          return -1;
        }
        edge = edge.next;
      }
      newvex = new adjvex(v2, arc[2]);
      newvex.next = vexs[v1].firstEdge; //头插法
      vexs[v1].firstEdge = newvex;
      vexs[v2].in++;
    }
    this.adjList = vexs;
  }
}

export default {
  name: "activity",
  data() {
    return {
      backgroundImage: require("../static/img/background.jpg"),
      chart_draw: 0,
      max_time: "",
      critical_path: "",
      critical_ac: [],
      tableData: [],
      vex_data: [],
      edge_data: [],
      text_area1: "",
      text_area2: "",
    };
  },
  methods: {
    initArray() {
      var s1 = this.text_area1;
      var s2 = this.text_area2;
      if (s1 != "" && s2 == "") {
        this.$message.error("输入框存在空白值！");
        return -1;
      } else if (s1 == "" && s2 != "") {
        this.$message.error("输入框存在空白值！");
        return -1;
      } else if (s1 != "" && s2 != "") {
        return 0;
      }
      return 1;
    },
    calltest() {
      let test_data1 = [
        "v0",
        "v1",
        "v2",
        "v3",
        "v4",
        "v5",
        "v6",
        "v7",
        "v8",
        "v9",
      ];
      let test_data2 = [
        ["v0", "v1", 3],
        ["v0", "v2", 4],
        ["v1", "v4", 6],
        ["v1", "v3", 5],
        ["v2", "v3", 8],
        ["v2", "v5", 7],
        ["v3", "v4", 3],
        ["v5", "v7", 6],
        ["v4", "v6", 9],
        ["v4", "v7", 4],
        ["v7", "v8", 5],
        ["v6", "v9", 2],
        ["v8", "v9", 3],
      ];
      var x = this.initArray();
      if (x == -1) return -1;
      if (x == 0) {
        var s1 = this.text_area1;
        var s2 = this.text_area2;
        test_data1 = s1.split(",");
        var tmp = s2.split(/[\s\n]/);
        test_data2.length = 0;

        for (var i = 0; i < tmp.length; i++) {
          var tmp2 = tmp[i].split(",");
          tmp2[2] = Number(tmp2[2]);
          test_data2.push(tmp2);
        }
      }
      let G = new Graph(test_data1, test_data2);
      if (G.adjList == null) {
        //成环
        this.tableData.length = 0;
        this.max_time = 0;
        this.critical_path = "";
        this.vex_data.length = 0;
        this.edge_data.length = 0;
        this.$message.error("有向图成环，该工程不可行！请重新输入");
        return -1;
      }

      this.tableData.length = 0;
      this.critical_path = "";
      this.critical_ac.length = 0;

      this.setChart(G);
      setTimeout(() => {
        this.drawGraph(G);
        this.chart_draw++;
      }, 500);
      this.criticalPath(G);
    },
    getEtvs(G) {
      let etvs = []; //用于存储各顶点的最早发生时间
      let stack = [],
        T = []; //stack为辅助栈，T为存储拓扑序列的数组
      let count = 0; //用于统计顶点个数

      for (let i = 0; i < G.adjList.length; i++) {
        //初始化数组，并将入度为0的顶点推入栈
        etvs[i] = 0;
        if (G.adjList[i].in === 0) {
          stack.push(i);
        }
      }

      let currentAdjVex = null;
      let currentIndex = 0;
      while (stack.length > 0) {
        currentIndex = stack.pop(); //弹出栈顶入度为0的顶点
        count++;
        T.push(currentIndex);
        currentAdjVex = G.adjList[currentIndex].firstEdge;
        while (currentAdjVex) {
          //遍历当前顶点的所有邻接顶点
          if (
            etvs[currentIndex] + currentAdjVex.weight >
            etvs[currentAdjVex.node]
          ) {
            //关键代码，求各顶点事件最早发生时间
            etvs[currentAdjVex.node] =
              etvs[currentIndex] + currentAdjVex.weight;
          }

          if (--G.adjList[currentAdjVex.node].in === 0) {
            //将当前邻接顶点入度减1，若等于0，则推入栈中
            stack.push(currentAdjVex.node);
          }

          currentAdjVex = currentAdjVex.next;
        }
      }

      if (count < G.adjList.length) {
        return false;
      } else {
        return [etvs, T];
      }
    },
    getLtvs(G, etvs, T) {
      let ltvs = [];

      for (let i = 0; i < G.adjList.length; i++) {
        //初始化每个顶点的最晚发生时间
        ltvs[i] = etvs[G.adjList.length - 1];
      }

      let currentAdjVex = null;
      let currentIndex = 0;
      while (T.length > 0) {
        currentIndex = T.pop(); //反向拓扑序列计算
        currentAdjVex = G.adjList[currentIndex].firstEdge;
        while (currentAdjVex) {
          if (
            ltvs[currentIndex] >
            ltvs[currentAdjVex.node] - currentAdjVex.weight
          ) {
            //关键代码，求各顶点事件的最晚发生时间
            ltvs[currentIndex] =
              ltvs[currentAdjVex.node] - currentAdjVex.weight;
          }

          currentAdjVex = currentAdjVex.next;
        }
      }

      return ltvs;
    },
    criticalPath(G) {
      let etvs = null,
        ltvs = null;
      let T = null;

      [etvs, T] = this.getEtvs(G); //调用函数获取图各顶点事件的最早和最晚发生时间
      ltvs = this.getLtvs(G, etvs, T);
      this.elt = etvs;

      //插入表格
      for (let i = 0; i < G.adjList.length; i++) {
        var item = {
          v_name: G.adjList[i].data,
          earlist: etvs[i],
          latest: ltvs[i],
          maxtime: this.max_time,
        };
        this.tableData.push(item);
      }
      let ete = 0,
        lte = 0;
      let currentAdjVex = null;
      this.critical_ac.push(G.adjList[0].data);

      for (let i = 0; i < G.adjList.length; i++) {
        //遍历每一条边

        currentAdjVex = G.adjList[i].firstEdge;
        while (currentAdjVex) {
          ete = etvs[i]; //弧上活动的最早开工时间
          lte = ltvs[currentAdjVex.node] - currentAdjVex.weight; //弧上活动的最晚开工时间
          if (ete === lte) {
            this.critical_ac.push("v" + currentAdjVex.node);
          }
          currentAdjVex = currentAdjVex.next;
        }
      }
      this.setPath();
      this.max_time = ltvs[ltvs.length - 1];
    },
    setPath() {
      this.critical_path = this.critical_ac[0] + "->";
      for (var i = 1; i < this.critical_ac.length; i++) {
        this.critical_path += this.critical_ac[i];
        if (i != this.critical_ac.length - 1) this.critical_path += "->";
        // if((i-1)%4==0)
        //   this.critical_path+=<br>;
      }
    },
    setChart(G) {
      this.vex_data.length = 0;
      this.edge_data.length = 0;
      for (let i = 0; i < G.adjList.length; i++) {
        //遍历每个顶点
        var v_id = G.v.indexOf(G.adjList[i].data);
        var item = {
          id: v_id,
          // fixed:true,
          name: G.adjList[i].data,
          symbol: "circle",
          value: G.adjList[i].weight,
          symbolSize: 30,
        };
        this.vex_data.push(item);
        if (G.adjList[i].firstEdge != null) {
          var edge = G.adjList[i].firstEdge;
          while (edge != null) {
            var line = {
              source: G.v.indexOf(G.adjList[i].data),
              target: edge.node,
              label: edge.weight,
            };
            this.edge_data.push(line);
            edge = edge.next;
          }
        }
      }
    },
    drawGraph(G) {
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
      echarts.init(document.getElementById("container" + this.chart_draw));

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
            layout: "force", //图的布局，类型为力导图，'circular' 采用环形布局，见示例 Les Miserables
            legendHoverLink: false, //是否启用图例 hover(悬停) 时的联动高亮。
            hoverAnimation: false, //是否开启鼠标悬停节点的显示动画
            coordinateSystem: null, //坐标系可选
            xAxisIndex: 0, //x轴坐标 有多种坐标系轴坐标选项
            yAxisIndex: 0, //y轴坐标
            draggable: true,
            force: {
              //力引导图基本配置
              //initLayout: ,//力引导的初始化布局，默认使用xy轴的标点
              repulsion: 100, //节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
              gravity: 0.03, //节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
              edgeLength: 80, //边的两个节点之间的距离，这个距离也会受 repulsion。[10, 50] 。值越小则长度越长
              layoutAnimation: true,
              //因为力引导布局会在多次迭代后才会稳定，这个参数决定是否显示布局的迭代动画，在浏览器端节点数据较多（>100）的时候不建议关闭，布局过程会造成浏览器假死。
            },
            roam: true, //是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            nodeScaleRatio: 0.6, //鼠标漫游缩放时节点的相应缩放比例，当设为0时节点不随着鼠标的缩放而缩放
            focusNodeAdjacency: true, //是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。

            edgeSymbol: ["none", "arrow"], //边两端的标记类型，可以是一个数组分别指定两端，也可以是单个统一指定。默认不显示标记，常见的可以设置为箭头，如下：edgeSymbol: ['circle', 'arrow']
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
              //==========关系边的公用线条样式。
              normal: {
                show: true,
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
            },
            edgeLabel: {
              //==============线条的边缘标签
              normal: {
                show: true,
                position: "middle",
                formatter: (param) => {
                  var newLinks = this.edge_data;
                  var newParam = param;
                  var newName = "";

                  newLinks.forEach((item) => {
                    //links中筛选与当前的source和target相等的返回其name
                    if (
                      item.source === newParam.data.source &&
                      item.target === newParam.data.target
                    ) {
                      newName = item.label;
                    }
                  });
                  return newName;
                },
              },
              emphasis: {
                //高亮状态
              },
            },

            data: this.vex_data,
            links: this.edge_data,
          },
        ],
      };

      myChart.setOption(option, true);
    },
    returnPage() {
      this.$router.push({ path: "/index" });
    },
  },
  mounted() {
    // window.calltest = this.calltest();
    // window.returnPage = this.returnPage();
  },
};
</script>

<style >
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