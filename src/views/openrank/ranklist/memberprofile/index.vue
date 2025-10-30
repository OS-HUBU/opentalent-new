<script>
import * as echarts from 'echarts';
import {
  getRepoNum, getRepoActivity,
  getDetail, getAverage,
  getMax, getOpenrankTrend,
  getRepoActivityTrend, getRepoRanking,
  getRepoTop3LanguageRatio, getStarCountchange, handleUserInfo, getOrgMemOpenrank
} from '@/api/behavior';
import { getUserinfo, getUserDetail } from "@/api/userinfo/userinfo";
import increaseIcon from "@/assets/images/up.png";
import downIcon from "@/assets/images/down.png";
import noChangeIcon from "@/assets/images/nochange.png";
import defaultAvatar from '@/assets/images/profile.jpg'
import rank1 from "@/assets/images/rank1.png";
import rank2 from "@/assets/images/rank2.png";
import rank3 from "@/assets/images/rank3.png";
import rank4 from "@/assets/images/rank4.png";
import rank5 from "@/assets/images/rank5.png";
export default {
  data() {
    return {
      userId: '',
      orgId: '',

      // 开发者基本信息
      userData: {
        userId: '',
        userName: '',
        sex: '',
        location: '',
        rank: 0,
        orgName: '',
        avatarUrl: '',
        platformName: '',
      },


      increaseIcon,
      downIcon,
      noChangeIcon,
      defaultAvatar,
      rank1,
      rank2,
      rank3,
      rank4,
      rank5,

      // 添加仓库数量相关数据
      repoData: {
        currentMonth: '',
        repoNum: 0,
        lastRepoNum: 0,
        changePercent: "0%"
      },
      // 添加仓库活跃度
      activityData: {
        currentMonth: '',
        currentActivity: 0,
        lastActivity: 0,
        change: 0,
        changePercent: "0%"
      },
      //添加star数量数据
      starData: {
        currentMonth: '',
        lastStarNum: 0,
        starNum: 0,
        changePercent: "0%"
      },
      //添加openrank数据
      openrankData: {
        currentMonth: '',
        currentOpenrank: 0,
        lastOpenrank: 0,
        changePercent: "0%"
      },
      top3Repos: [], // 存储top3仓库的语言数据
      top5Repos: [], // 存储top5仓库数据用于排名显示
      languageColors: { // 为语言定义颜色
        TypeScript: '#3178C6',
        Python: '#306998',
        MDX: '#F97516',
        Shell: '#89E051',
        JavaScript: '#F7DF1E',
        Dockerfile: '#384D54',
        Makefile: '#8D7B68',
        HTML: '#E34C26',
        CSS: '#563D7C'
      },
      // 添加月度详情数据
      detailData: {
        openIssue: 0,
        fork: 0,
        star: 0,
        prMerged: 0,
        prComment: 0,
        openPr: 0,
        issueComment: 0,
      },
      // 添加领域平均数据
      averageData: {
        avgOpenIssue: 0,
        avgFork: 0,
        avgStar: 0,
        avgPrMerged: 0,
        avgPrComment: 0,
        avgOpenPr: 0,
        avgIssueComment: 0,
      },
      // 添加领域标杆数据
      maxData: {
        maxOpenIssue: 0,
        maxFork: 0,
        maxStar: 0,
        maxPrMerged: 0,
        maxPrComment: 0,
        maxOpenPr: 0,
        maxIssueComment: 0,
      },

      // 新增活跃度和OpenRank趋势相关数据
      trendData: {
        openrank: [],  // OpenRank趋势
        activity: []   // 活跃度趋势
      },
      dateRange: [],  // 时间段选择器值 [开始日期, 结束日期]
      allDates: [],   // 所有可用日期
      currentOpenrankSum: 0,  // 当前时间段OpenRank总和
      startDate: '', // 单独的开始日期
      endDate: '',   // 单独的结束日期
      defaultStartMonth: '', // 默认开始月份
      defaultEndMonth: '',  // 默认结束月份


      repoRanking: [], // 存储仓库排名数据

      tableColor: ['rgba(20, 184, 166, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(236, 72, 153)', '#F59E0B', '#FACC15'],
      tableData: [
        {
          color: 1,
          label: '最大贡献',
        },
        {
          color: 2,
          label: '平均贡献',
        },
        {
          color: 3,
          label: '本人贡献',
          isSelf: true  // 添加阴影效果

        },
      ]
    }
  },

  methods: {
    // 生成仓库排名图标
    generateRankIconStyle() {
      const richStyles = {};
      for (let i = 1; i <= 5; i++) {
        richStyles[`rank${i}`] = {
          backgroundColor: {
            image: this[`rank${i}`]
          },
          width: 24,
          height: 24,
          align: 'left',
          verticalAlign: 'middle'
        };
      }
      return richStyles;
    },
    //获取开发者信息
    async handleUserInfo() {
      try {
        const userinfo = await getOrgMemOpenrank();
        console.log("组织内部成员openrank排名", userinfo);
        const targetUserId = String(this.userId);
        const targetData = userinfo.data.find(item => item.userid === targetUserId);
        if (targetData) {
          this.userData.userName = targetData.username;
          this.userData.orgName = targetData.orgName;
          this.userData.platformName = targetData.platformName;
          this.userData.rank = targetData.rank;
          console.log('找到的目标开发者排名数据：', targetData);
        } else {
          console.log('未找到目标开发者排名数据');
        }
      } catch (error) {
        console.error("获取目标开发者排名信息失败:", error);
      }
    },

    // 获取top3仓库语言数据
    async getTop3RepoLanguages() {
      try {
        const response = await getRepoTop3LanguageRatio(this.userId);
        if (response.code === 200) {
          this.top3Repos = response.data.slice(0, 3);
          console.log("top3仓库语言占比数据", this.top3Repos);
        }
      } catch (error) {
        console.error("获取top3仓库语言占比失败:", error);
      }
    },


    // 获取仓库数量数据
    async getRepoCount() {
      try {
        const response = await getRepoNum(this.userId);
        //console.log("仓库数量有关数据", response);
        if (response.code === 200) {
          this.repoData = response.data;
        }
      } catch (error) {
        console.error("获取仓库数量失败:", error);
      }
    },


    //获取star数量数据
    async getStarCount() {
      try {
        const response = await getStarCountchange(this.userId);
        //console.log("star数量数据", response);
        if (response.code === 200) {
          this.starData = response.data;
        }
      } catch (error) {
        console.error("获取star数量失败:", error);
      }
    },


    // 获取仓库活跃度数据
    async getRepoAct() {
      try {
        const response = await getRepoActivity(this.userId);
        //console.log("活跃度数据", response);
        if (response.code === 200) {
          this.activityData = response.data;
        }
      } catch (error) {
        console.error("获取仓库活跃度失败:", error);
      }
    },


    // 获取月度详情数据
    async getDetailData() {
      try {
        const response = await getDetail(this.userId);
        console.log("月度详情数据", response);
        if (response.code === 200) {
          this.detailData = response.data[0];
          this.userData.platformName = response.data[0].platformName;
        }
        return response;
      } catch (error) {
        console.error("获取详情数据失败:", error);
      }
    },


    //获取领域平均数据
    async getAverageData() {
      try {
        const response = await getAverage();
        //console.log("领域平均数据", response);
        if (response.code === 200) {
          this.averageData = response.data;
        }
        return response;
      } catch (error) {
        console.error("获取领域平均数据失败:", error);
      }
    },


    //获取领域标杆数据
    async getMaxData() {
      try {
        const response = await getMax();
        //console.log("领域标杆数据", response);
        if (response.code === 200) {
          this.maxData = response.data;
        }
        return response;
      } catch (error) {
        console.error("获取领域标杆数据失败:", error);
      }
    },

    //获取趋势数据
    async getTrendData(startDate = '', endDate = '') {
      try {
        const params = { userId: this.userId };
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }

        const [openrankRes, activityRes] = await Promise.all([
          getOpenrankTrend(params),
          getRepoActivityTrend(params)
        ]);

        if (openrankRes.code === 200) {
          this.trendData.openrank = openrankRes.data;
          // 计算当前/上月 openrank 用于头部卡片
          const or = this.trendData.openrank;
          if (or.length >= 2) {
            const last = or[or.length - 1].openrank;
            const prev = or[or.length - 2].openrank;
            this.openrankData.currentOpenrank = last;
            this.openrankData.lastOpenrank = prev;
            this.openrankData.currentMounth = or[or.length - 1].date;
            const percent = prev === 0 ? 0 : ((last - prev) / prev * 100).toFixed(1);
            this.openrankData.changePercent = `${percent}%`;
          }
        }

        if (activityRes.code === 200) {
          this.trendData.activity = activityRes.data;
        }

        // 构造 allDates（去重、排序）
        this.allDates = [
          ...new Set([
            ...this.trendData.openrank.map(i => i.date),
            ...this.trendData.activity.map(i => i.date)
          ])
        ].sort();

        // 设置默认时间范围（最近12个月）
        if (this.allDates.length > 0) {
          const defaultEnd = this.allDates[this.allDates.length - 1];
          const defaultStartIndex = Math.max(0, this.allDates.length - 12);
          const defaultStart = this.allDates[defaultStartIndex];

          // 只有在用户未选择时间时才自动设置默认值
          if (!this.startDate || !this.endDate) {
            this.startDate = defaultStart;
            this.endDate = defaultEnd;
            this.dateRange = [defaultStart, defaultEnd];
          }
        }

        return true;
      } catch (error) {
        console.error("获取趋势数据失败:", error);
        return false;
      }
    },

    // 处理开始日期变更
    async handleStartDateChange(val) {
      this.startDate = val;
      if (this.startDate && this.endDate) {
        this.dateRange = [this.startDate, this.endDate];
        await this.getTrendData(this.startDate, this.endDate); // 重新请求数据
        this.drawOrBarChart(); // 重新绘制图表
      }
    },

    // 处理结束日期变更
    async handleEndDateChange(val) {
      this.endDate = val;
      if (this.startDate && this.endDate) {
        this.dateRange = [this.startDate, this.endDate];
        await this.getTrendData(this.startDate, this.endDate); // 重新请求数据
        this.drawOrBarChart(); // 重新绘制图表
      }
    },

    // 清除日期选择
    async clearDateSelection() {
      this.startDate = '';
      this.endDate = '';
      this.dateRange = [];
      // 恢复默认数据（后端返回的最近12个月）
      await this.getTrendData();
      this.drawOrBarChart();
    },

    //处理趋势数据
    processTrendData() {
      let startDate, endDate;
      if (this.dateRange && this.dateRange.length === 2) {
        [startDate, endDate] = this.dateRange;
      } else {
        // 默认区间
        if (!this.allDates.length) return { dates: [], activity: [], openrank: [] };
        endDate = this.allDates[this.allDates.length - 1];
        const startIdx = Math.max(0, this.allDates.length - 12);
        startDate = this.allDates[startIdx];
      }

      const filteredDates = this.allDates.filter(d => d >= startDate && d <= endDate);

      const activityData = filteredDates.map(d => {
        const item = this.trendData.activity.find(i => i.date === d);
        return item ? item.repoActivity : 0;
      });

      const openrankData = filteredDates.map(d => {
        const item = this.trendData.openrank.find(i => i.date === d);
        return item ? item.openrank : 0;
      });

      this.currentOpenrankSum = openrankData.reduce((s, v) => s + v, 0).toFixed(2);

      const fmtDates = filteredDates.map(d => {
        const [y, m] = d.split('-');
        return `${y}-${m}`;
      });

      return {
        dates: fmtDates,
        activity: activityData,
        openrank: openrankData
      };
    },

    //获取仓库排名数据
    async getRepoRankingData() {
      try {
        const response = await getRepoRanking(this.userId);
        //console.log("仓库排名数据", response);
        if (response.code === 200) {
          // 添加排名字段
          this.repoRanking = response.data.map((item, index) => ({
            ...item,
            rank: index + 1 // 排名从1开始
          }));
          // 设置top5数据用于排名显示
          this.top5Repos = this.repoRanking.slice(0, 5);
        }
        return response;
      } catch (error) {
        console.error("获取仓库排名数据失败:", error);
      }
    },


    //活跃度和OpenRank趋势
    drawOrBarChart() {
      const processedData = this.processTrendData();

      let orBarChart = echarts.init(document.getElementById("orBarChart"))

      // 计算Y轴最大值（留有余地）
      const maxActivity = Math.max(...processedData.activity);
      const maxOpenrank = Math.max(...processedData.openrank);
      const maxValue = Math.max(maxActivity, maxOpenrank);
      const yAxisMax = Math.ceil(maxValue / 100) * 100;

      orBarChart.setOption({
        color: ['#007AFF', '#FF9000'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },

          formatter: function (params) {
            let res = `${params[0].name}<br/>`;
            params.forEach(item => {
              res += `${item.seriesName}: ${item.value.toFixed(2)}<br/>`;
            });
            return res;
          }

        },
        grid: {
          top: "18%",
          left: "8%",
          right: "8%",
          bottom: "15%"
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            data: processedData.dates,
            axisLabel: {
              interval: 0,
              rotate: 0,
              margin: 15
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '活跃度',
            min: 0,
            max: yAxisMax,
            offset: 20,
            position: 'left',
            axisLine: {
              lineStyle: {
                color: '#007AFF'
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: 'OpenRank',
            min: 0,
            max: yAxisMax,
            position: 'right',
            offset: 20,
            axisLine: {
              lineStyle: {
                color: '#FF9000'
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
        ],
        series: [
          {
            name: '活跃度趋势', // 活跃度折线图
            type: 'line',
            data: processedData.activity,
            smooth: false, // 设置为直线
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 8,
            symbolOffset: [0, 0], // 确保点位于柱状图上
            lineStyle: {
              width: 3,
              color: '#007AFF'
            },
            itemStyle: {
              color: '#007AFF',
              borderWidth: 2,
              borderColor: '#fff'
            },
            label: {
              show: true,
              position: 'top',
              color: '#007AFF',
              fontSize: 12,
              fontWeight: 'bold',
              formatter: function (params) {
                // 对数值保留两位小数
                return params.value.toFixed(2);
              } // 显示活跃度的值
            },
            yAxisIndex: 0
          },
          {
            name: 'OpenRank趋势', // OpenRank折线图
            type: 'line',
            data: processedData.openrank,
            smooth: false, // 设置为直线
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 8,
            symbolOffset: [0, 0], // 确保点位于柱状图上
            lineStyle: {
              width: 3,
              color: '#FF9000'
            },
            itemStyle: {
              color: '#FF9000',
              borderWidth: 2,
              borderColor: '#fff'
            },
            label: {
              show: true,
              position: 'top',
              color: '#FF9000',
              fontSize: 12,
              fontWeight: 'bold',
              formatter: function (params) {
                return params.value.toFixed(2);
              } // 显示OpenRank的值
            },
            yAxisIndex: 1
          }
        ]
      });

      // 监听窗口大小变化，自动调整图表
      window.addEventListener('resize', () => {
        orBarChart.resize();
      });

      return orBarChart;

    },


    // 时间段变更处理
    handleDateRangeChange(val) {
      if (val && val.length === 2) {
        this.dateRange = val;
        // 重新绘制图表
        this.drawOrBarChart();
      }
    },

    // 获取排名图标
    getRankIcon(rank) {
      const rankIcons = {
        1: this.rank1,
        2: this.rank2,
        3: this.rank3,
        4: this.rank4,
        5: this.rank5
      };
      return rankIcons[rank] || this.rank5;
    },

    //Top5贡献来源
    drawSourceBarChart() {
      const top5Data = this.repoRanking.slice(0, 5);
      const chartData = top5Data.map(item => item.repoOpenrank).reverse();
      const chartDom = document.getElementById("sourceBarChart");

      // 清除现有内容（避免图表与文本重叠）
      chartDom.innerHTML = '';

      // 如果没有数据，显示居中提示
      if (chartData.length === 0) {
        chartDom.style.display = 'flex';
        chartDom.style.alignItems = 'center';
        // chartDom.style.justifyContent = 'center';
        chartDom.style.height = '220px'; // 与图表高度保持一致
        chartDom.innerHTML = '<div style="color: #999; font-size: 24px;">暂无仓库，建议先添加仓库</div>';
        return;
      }

      // 有数据时正常绘制图表
      chartDom.style.display = ''; // 重置样式
      let sourceBarChart = echarts.init(chartDom);
      sourceBarChart.setOption({
        color: '#007AFF',
        grid: {
          top: "5%",
          left: "1%",
          right: "1%",
          bottom: "10%"
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const index = params[0].dataIndex;
            const correctIndex = top5Data.length - 1 - index;
            const repo = top5Data[correctIndex];
            return `${repo.repoName}<br/>OpenRank: ${repo.repoOpenrank}<br/>活跃度: ${repo.repoActivity}`;
          }.bind(this)
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'category',
          data: top5Data.map((item, index) => `排名${index + 1}`).reverse(),
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          }
        },
        series: [
          {
            type: 'bar',
            data: chartData,
            label: {
              show: true,
              position: 'right',
              color: '#007AFF',
              formatter: '{c}'
            },
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)',
              borderRadius: [15, 15, 15, 15]
            },
            itemStyle: {
              borderRadius: [15, 15, 15, 15]
            }
          }
        ]
      });

      // 添加窗口大小变化监听
      window.addEventListener('resize', () => {
        sourceBarChart.resize();
      });

      return sourceBarChart;
    },

    //贡献类别
    drawRadarChart() {
      let chart = echarts.init(document.getElementById("radarChart"))
      chart.setOption({
        color: this.tableColor,
        tooltip: {
          trigger: 'item',
          appendToBody: true 
        },
        radar: {
          radius: 72,
          center: ['58%', '35%'],
          name: {
            textStyle: {
              fontSize: 16,
              padding: [-10, -2],
              color: '#000',
            }
          },
          indicator: [
            { name: 'Open Issue' },
            { name: 'Issue Comment' },
            { name: 'Open PR' },
            { name: 'PR Comment' },
            { name: 'PR Merged' },
            { name: 'Star' },
            { name: 'Fork' },
          ]
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [this.maxData.maxOpenIssue,
                this.maxData.maxFork,
                this.maxData.maxStar,
                this.maxData.maxPrMerged,
                this.maxData.maxPrComment,
                this.maxData.maxOpenPr,
                this.maxData.maxIssueComment],
                name: '最大贡献',
                areaStyle: {
                  color: 'rgba(20, 184, 166, 0.1)'
                }
              },
              {
                value: [this.averageData.avgOpenIssue,
                this.averageData.avgFork,
                this.averageData.avgStar,
                this.averageData.avgPrMerged,
                this.averageData.avgPrComment,
                this.averageData.avgOpenPr,
                this.averageData.avgIssueComment],
                name: '平均贡献',
                areaStyle: {
                  color: 'rgba(59, 130, 246, 0.3)'
                }
              },
              {
                value: [this.detailData.openIssue,
                this.detailData.fork,
                this.detailData.star,
                this.detailData.prMerged,
                this.detailData.prComment,
                this.detailData.openPr,
                this.detailData.issueComment],
                name: '本人贡献',
                areaStyle: {
                  color: "rgba(236, 72, 153, 0.5)",
                  opacity: 0.6,
                },
              },
            ]
          }
        ]
      })

    },

    // 第一阶段：用户基本信息
    async loadUserBasicInfo() {
      if (this.$route.query.userId) {
        this.userId = this.$route.query.userId;
        const response = await getUserinfo(this.userId);
        if (response.code === 200) {
          console.log(response.data.userInfo);
          this.userData.userName = response.data.userInfo.user_name;
          this.userData.location = response.data.userInfo.location;
          this.userData.sex = response.data.userInfo.sex;
          // 处理头像URL，与个人中心基本资料页面保持一致
          const avatar = response.data.userInfo.avatarUrl;
          this.userData.avatarUrl = (avatar == "" || avatar == null) ? this.defaultAvatar : import.meta.env.VITE_APP_BASE_API + avatar;
        }
      } else {
        const response = await getUserDetail();
        if (response.code === 200) {
          console.log(response.data);
          this.userId = response.data.userId;
          // 处理头像URL，与个人中心基本资料页面保持一致
          const avatar = response.data.avatarUrl;
          this.userData.avatarUrl = (avatar == "" || avatar == null) ? this.defaultAvatar : import.meta.env.VITE_APP_BASE_API + avatar;
          this.userData.userName = response.data.userName;
          this.userData.sex = response.data.sex;
          this.userData.location = response.data.location;
        }
      }
      console.log("用户基本信息加载完成");
    },

    // 第二阶段：核心数据（用户能看到的主要内容）
    async loadCoreData() {
      await Promise.all([
        this.getRepoCount(),
        this.getRepoAct(),
        this.getStarCount(),
        this.getDetailData(),
        this.getTrendData()
      ]);

      // 核心图表立即渲染
      this.drawOrBarChart();
      console.log("核心数据加载完成");
    },

    // 第三阶段：次要数据（可以稍后加载）
    async loadSecondaryData() {
      try {
        await Promise.all([
          this.handleUserInfo(),      // 排名信息
          this.getAverageData(),      // 平均数据
          this.getMaxData(),          // 标杆数据
          this.getRepoRankingData(),  // 仓库排名
          this.getTop3RepoLanguages() // 语言数据
        ]);

        // 次要图表渲染
        this.drawSourceBarChart();
        this.drawRadarChart();
        console.log("次要数据加载完成");
      } catch (error) {
        console.error("次要数据加载失败:", error);
      }
    },

  },

  async mounted() {

    try {
      // 第一阶段：立即获取用户基本信息（最高优先级）
      await this.loadUserBasicInfo();

      // 第二阶段：并行加载核心数据
      await this.loadCoreData();

      // 第三阶段：加载次要数据
      this.loadSecondaryData();

    } catch (error) {
      console.error("数据加载失败:", error);
    }
  },

}

</script>

<template #default="scope">
  <div class="member-profile">
    <el-main>
      <div class="metrics-grid">
        <!-- 卡片 1 用户信息-->
        <el-card class="card metric-card user-card">
          <div class="user-info">
            <div>
              <img :src="userData.avatarUrl ? userData.avatarUrl : defaultAvatar" class="user-avatar">
              <div class="user-time">{{ openrankData.currentMounth }}</div>
            </div>

            <div class="user-details">
              <div class="user-metrics">
                <div class="user-name">{{ userData.userName }}</div>
              </div>
              <div class="user-metrics">
                <span>性别: {{ userData.sex || '未知' }}</span>
              </div>
              <div class="user-metrics">
                <span>个人排名: {{ userData.rank || '无' }}</span>
              </div>
              <div class="user-metrics">
                <span>所在组织: {{ userData.orgName || '无' }}</span>
              </div>
              <div class="user-metrics">
                <span>平台名称：{{ userData.platformName }}</span>
              </div>
            </div>
          </div>
          <div class="user-metrics">
            <span>位置: {{ userData.location || '未知' }}</span>
          </div>
        </el-card>

        <!-- 卡片 2 总仓库数量-->
        <el-card class="card metric-card data-card">
          <div class="row1">
            <img src="../../../../assets/images/repository.png" class="detail-img">
            <div class="title">总仓库数量</div>
            <div class="number-data-container">
              <div class="number">{{ repoData.repoNum }}</div>
              <div class="data">{{ repoData.currentMonth }}</div>
            </div>
            <div class="detail-container">
              <img
                :src="repoData.lastRepoNum < repoData.repoNum ? increaseIcon : repoData.lastRepoNum > repoData.repoNum ? downIcon : noChangeIcon"
                style="height: 25px;">

              <span class="detail-number-up">{{ repoData.changePercent }}</span>
              <span class="detail-text">
                {{ repoData.lastRepoNum < repoData.repoNum ? 'Up' : repoData.lastRepoNum > repoData.repoNum ?
                  'Down' :
                  'Same' }} from past month
              </span>

            </div>
          </div>
        </el-card>

        <!-- 卡片 3 Star数量 -->
        <el-card class="card metric-card data-card">
          <div class="row1">
            <img src="../../../../assets/images/star.png" class="detail-img">
            <div class="title">Star数量</div>
            <div class="number-data-container">
              <div class="number">{{ starData.starNum }}</div>
              <div class="data">{{ starData.currentMonth }}</div>
            </div>
            <div class="detail-container">
              <img
                :src="starData.lastStarNum < starData.starNum ? increaseIcon : starData.lastStarNum > starData.starNum ? downIcon : noChangeIcon"
                style="height: 25px;">

              <span class="detail-number-up">{{ starData.changePercent }}</span>
              <span class="detail-text">
                {{ starData.lastStarNum < starData.starNum ? 'Up' : starData.lastStarNum > starData.starNum ?
                  'Down' :
                  'Same' }} from past month
              </span>
            </div>

          </div>
        </el-card>

        <!-- 卡片 4 OpenRank-->
        <el-card class="card metric-card data-card">
          <div class="row1">
            <img src="../../../../assets/images/openrank.png" class="detail-img">
            <div class="title">OpenRank</div>
            <div class="number-data-container">
              <div class="number">{{ openrankData.currentOpenrank }}</div>
              <div class="data">{{ openrankData.currentMounth }}</div>
            </div>
            <div class="detail-container">
              <img
                :src="starData.lastStarNum < starData.starNum ? increaseIcon : starData.lastStarNum > starData.starNum ? downIcon : noChangeIcon"
                style="height: 25px;">

              <span class="detail-number-up">{{ openrankData.changePercent }}</span>
              <span class="detail-text">
                {{ openrankData.lastOpenrank < starData.currentOpenrank ? 'Up' : openrankData.lastOpenrank >
                  openrankData.currentOpenrank ? 'Down' :
                  'Same' }} from past month
              </span>
            </div>

          </div>
        </el-card>

        <!-- 卡片 5 活跃度-->
        <el-card class="card metric-card data-card">
          <div class="row1">
            <img src="../../../../assets/images/activity.png" class="detail-img">
            <div class="title">活跃度</div>
            <div class="number-data-container">
              <div class="number">{{ activityData.currentActivity }}</div>
              <div class="data">{{ activityData.currentMonth }}</div>
            </div>
            <div class="detail-container">

              <img
                :src="activityData.lastActivity < activityData.currentActivity ? increaseIcon : activityData.lastActivity > activityData.currentActivity ? downIcon : noChangeIcon"
                style="height: 25px;">

              <span class="detail-number-up">{{ activityData.changePercent }}</span>
              <span class="detail-text">
                {{ activityData.lastActivity < activityData.currentActivity ? 'Up' : activityData.lastActivity >
                  activityData.currentActivity ? 'Down' :
                  'Same' }} from past month
              </span>
            </div>
          </div>
        </el-card>
      </div>


      <div class="metrics-grid-3">
        <el-card class="card combined-card metric-card">
          <div class="title">活跃度和OpenRank趋势</div>
          <div class="top-section">
            <div class="openrank-container">
              <div class="openrank-sum">累计贡献度(OpenRank)</div>
              <span class="sum-value">{{ currentOpenrankSum }}</span>
            </div>

            <div class="date-picker-group">
              <div class="date-item">
                <label class="light-label">开始月份</label>
              </div>
              <div class="month">
                <el-date-picker v-model="startDate" type="month" :placeholder="`${defaultStartMonth}`" format="YYYY-MM"
                  value-format="YYYY-MM"
                  :picker-options="{ disabledDate: (time) => { if (endDate) { return time.getTime() > new Date(endDate).getTime(); } return false; } }"
                  @change="handleStartDateChange" style="width: 150px;" />
              </div>
            </div>

            <div class="date-picker-group">
              <div class="date-item">
                <label>结束月份</label>
              </div>
              <div class="month">
                <el-date-picker v-model="endDate" type="month" :placeholder="`${defaultEndMonth}`" format="YYYY-MM"
                  value-format="YYYY-MM"
                  :picker-options="{ disabledDate: (time) => { if (startDate) { return time.getTime() < new Date(startDate).getTime(); } return false; } }"
                  @change="handleEndDateChange" style="width: 150px;" />
              </div>
            </div>

            <div class="clear-btn-container">
              <el-button @click="clearDateSelection" class="clear-btn">清除</el-button>
            </div>
          </div>

          <div class="bottom-section">
            <div class="chart-header-with-controls">
            </div>
            <div id="orBarChart" class="echart" style="min-height:220px; width:100%"></div>
          </div>
        </el-card>

        <el-card class="card language-card metric-card">
          <div class="title">Top3仓库语言占比</div>
          <div class="language-scroll-container">
            <div v-if="top3Repos.length === 0" class="no-data提示">
              暂无仓库
            </div>
            <div v-for="(repo, index) in top3Repos" :key="index" class="repo-language-card">
              <div class="repo-name">{{ repo.repoName }}</div>
              <div class="language-item" v-for="(lang, langIndex) in repo.languages" :key="langIndex">
                <div class="language-info">
                  <span class="language-name" :style="{ color: languageColors[lang.language] || '#666' }">
                    {{ lang.language }}
                  </span>
                  <span class="language-ratio">{{ lang.ratio.toFixed(1) }}%</span>
                </div>
                <div class="progress-container">
                  <el-progress :percentage="lang.ratio" :stroke-width="6" :show-text="false"
                    :stroke-color="languageColors[lang.language] || '#409EFF'"></el-progress>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>


      <div class="metrics-grid-2">
        <el-card class="card category-card metric-card">
          <div class="category-container">
            <div class="category-left">
              <div class="title">贡献类别</div>
              <div id="radarChart" class="category-radar echart" aria-label="radar chart"></div>
            </div>

            <div class="category-right">
              <div class="legend-list">
                <div v-for="(item, index) in tableData" :key="index" class="legend-item"
                  :class="{ 'self-contribution': item.isSelf }">
                  <span class="color-indicator" :style="{ backgroundColor: tableColor[item.color - 1] }"></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span v-if="item.value !== undefined" class="legend-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="card source-card metric-card">
          <div>
            <div class="title">开源贡献分布Top5仓库</div>
            <div class="source-chart-container">

              <div class="rank-list">
                <div v-for="(item, index) in top5Repos" :key="index" class="rank-item">
                  <img :src="getRankIcon(item.rank)" class="rank-icon" :alt="`排名${item.rank}`">
                  <span class="repo-name">{{ item.repoName }}</span>
                </div>
              </div>

              <div class="chart-area" id="sourceBarChart"></div>
            </div>
          </div>
        </el-card>
      </div>

    </el-main>
  </div>

</template>


<style scoped>

.member-profile {
  background-color: #F8F8F8;
}

.card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.metrics-grid,
.metrics-grid-3,
.metrics-grid-2 {
  overflow: hidden;
  margin-bottom: 10px;
  padding-top: 5px;
  display: flex;
  gap: 20px;
  grid-auto-rows: min-content;
}

.metrics-grid {
  display: grid;
  height: auto;
  display: flex;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: stretch;
}

.metrics-grid .metric-card {
  flex: 1;
  height: auto;
  min-height: 0;
}

.user-card {
  flex: 0 0 auto;
  /* 不伸缩，保持内容宽度 */
  min-width: auto;
  /* 取消最小宽度限制 */
  white-space: nowrap;
  /* 防止卡片内元素换行 */
}

.data-card {
  flex: 1;
  /* 平均分配剩余空间 */
  min-width: 200px;
  /* 设置最小宽度，防止过窄 */
}



.metrics-grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

@media (min-width: 1200px) {
  .metrics-grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}


.category-card {
  flex:4;
  height: 280px;
  overflow: visible !important;
}


/* 响应式处理 - 小屏幕自动换行 */
@media (max-width: 768px) {
  .top-section {
    gap: 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .date-picker-group {
    width: 100%;
  }

  .el-date-picker {
    width: 100%;
  }
}

/* 当容器非常宽两个 card 始终并排显示，可以在大屏强制 2 列 */
@media (min-width: 1200px) {
  .metrics-grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 按钮、文字在窄屏下更紧凑 */
@media (max-width:767px) {
  .metrics-grid-2 {
    gap: 12px;
  }

  .metric-card {
    padding: 8px;
  }

  .openrank-sum {
    font-size: 14px;
  }

  .sum-value {
    font-size: 18px;
  }
}


/* 窄屏下：让两块垂直排列，radar 在上 */
@media (max-width: 767px) {
  .category-container {
    flex-direction: column;
    gap: 10px;
  }

  .category-left,
  .category-right {
    flex: 1 1 auto;
    min-width: 0;
  }

  .category-radar {
    min-height: 180px;
  }
}


/* 小屏微调 */
@media (max-width: 899px) {

  .combined-card .left-section,
  .combined-card .right-section {
    padding: 8px 6px;
  }

  .echart {
    min-height: 200px;
  }
}










.user-info {
  display: flex;
  align-items: center;
  padding: 0 10px;
  flex-wrap: nowrap;
  width: 100%;
  gap: 10%;
}

.user-details {
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.user-avatar {
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-time {
  margin-top: 10%;
  margin-left: 10%;
  color: #606266;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-role {
  color: #606266;
  margin-bottom: 10px;
}

.user-metrics {
  display: flex;
  color: #606266;
  font-size: 14px;
  margin-top: 2%;
  margin-left: 5%;
}

.row1 {
  height: auto;
  position: relative;
  padding: 0 10px;
}

.detail-img {
  position: absolute;
  height: 50%;
  top: 3%;
  right: 3%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #636566;
}


.number-data-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.number {
  font-weight: bold;
  font-size: 32px;
  margin-top: 18px;
}

.data {
  font-size: 14px;
  color: #979797;
}

.detail-container {
  display: flex;
  align-items: center;
  padding-top: 15px;
  font-size: 15px;
}

.detail-number-down {
  color: #00B69B;
  padding-left: 8px;
  padding-right: 8px;
}

.detail-number-up {
  color: #F93D66;
  padding-left: 8px;
  padding-right: 8px;
}

.detail-text {
  color: #636566;
  word-spacing: 2px;
}

/**第二行openrank和活跃度趋势卡片 */

.combined-card {
  flex: 8;
  width: 0;
}

.language-card {
  flex: 2;
  width: 0;
}

.clear-btn {
  margin-left: 100px;
  background-color: #f0f2f7;
  margin-bottom: 20px;
}

.openrank-sum {
  font-size: 20px;
  color: #FF9000;
  white-space: nowrap;
  margin-left: 24px;
  margin-bottom: 20px;
}

.sum-value {
  color: #FF9000;
  font-weight: bold;
  font-size: 35px;
  margin-left: 80px;
}

.bottom-section {
  height: auto;
}

.date-picker-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  width: 250px;
  font-weight: 600px;
}

.month {
  width: 100px;
}

::v-deep .el-date-editor .el-input__inner {
  color: #000 !important;
  font-size: 18px;
}

::v-deep .el-date-editor .el-input__inner::placeholder {
  color: #000 !important;
  font-size: 18px;
}

.date-item label {
  display: block;
  text-align: center;
  margin-bottom: 5px;
  color: #999999;
  font-size: 18px;
}

.month {
  width: 140px;
}

.top-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px 50px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.openrank-container,
.date-picker-group,
.clear-btn-container {
  margin: 0px 10px;
}

/** 第二行top3语言*/
.repo-language-card {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 8px;
  scroll-margin-bottom: 10px;
}

.no-data提示 {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 24px;
}

.language-scroll-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  overflow: auto;
}

.language-item {
  margin-bottom: 8px;
}

.language-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.language-name {
  font-weight: 500;
}

.language-ratio {
  color: #606266;
}

.progress-container {
  width: 100%;
}

/* 第三行贡献类别卡片 */
.source-card {
  flex: 6;
  width: 0;
}

.category-radar {
  width: 100%;
  min-height: 300px;
  box-sizing: border-box;
}

.category-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 350px;
  padding: 15px;
  box-sizing: border-box;
}

.category-left {
  flex: 6;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.category-right {
  flex: 2;
  display: flex;
  padding-left: 15px;
  box-sizing: border-box;
  margin-top: 100px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 6px 0;
}

.color-indicator {
  width: 22px;
  height: 12px;
  display: inline-block;
  margin-right: 10px;
}

.legend-label {
  font-size: 14px;
  color: #333;
}

/*本人贡献的图例阴影 */
.self-contribution {
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2);
  background-color: rgba(236, 72, 153, 0.1);
}


/*第三行开源贡献分布Top5仓库 */
/* 排名和图表分离布局 */
.source-chart-container {
  display: flex;
  height: 215px;
  gap: 15px;
}

.rank-list {
  width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 10px 0;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 45px;
}

.rank-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.repo-name {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-area {
  flex: 1;
  height: 100%;
}
</style>