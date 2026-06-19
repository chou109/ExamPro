# 在线考试系统 (ExamPro)

一个基于 Vue + Spring Boot 的在线考试系统，支持多种题型、自动组卷、防作弊机制和成绩分析。

## 项目结构

```
exam_pro/
├── oes-backend/          # Spring Boot 后端项目
│   ├── src/main/java/com/oes/
│   │   ├── common/      # 公共类（响应封装、基础实体）
│   │   ├── config/      # 配置类（跨域、拦截器）
│   │   ├── controller/   # 控制器
│   │   ├── entity/       # 实体类
│   │   ├── interceptor/ # 拦截器
│   │   ├── mapper/       # MyBatis Mapper
│   │   ├── service/      # 服务层
│   │   └── utils/        # 工具类
│   └── src/main/resources/
│       ├── application.yml
│       └── sql/ExamPro.sql
├── oes-frontend/        # Vue 前端项目
│   └── src/
│       ├── layout/      # 布局组件
│       ├── router/      # 路由配置
│       ├── store/       # 状态管理
│       ├── utils/       # 工具函数
│       ├── views/       # 页面组件
│       └── styles/      # 样式文件
└── README.md
```

## 技术栈

### 后端
- Spring Boot 3.2.0
- MyBatis Plus 3.5.5
- JWT (jjwt 0.12.3)
- MySQL 8.0
- Lombok

### 前端
- Vue 3.4
- Vue Router 4
- Pinia 2.1.7
- Element Plus 2.4.4
- Axios
- ECharts 5.4.3

## 环境要求

- JDK 17+
- MySQL 8.0+
- Node.js 18+
- Maven 3.8+

## 快速启动

### 1. 数据库配置

```bash
# 登录 MySQL
mysql -u root -p

# 执行数据库脚本
source oes-backend/src/main/resources/sql/ExamPro.sql
```

### 2. 后端启动

```bash
cd oes-backend

# 修改 application.yml 中的数据库配置
# spring.datasource.username 和 password

# 启动后端
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 前端启动

```bash
cd oes-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 测试账号

| 角色   | 用户名    | 密码      |
|--------|-----------|-----------|
| 管理员 | a    | admin     |
| 教师   | t   | tchr   |
| 学生   | s   | stu   |

## 功能模块

### 管理员端
- 用户管理（学生、教师、管理员CRUD）
- 院系管理（树形结构展示）
- 班级管理（创建、编辑、删除、邀请码）
- 数据统计（考试统计、错题统计）

### 教师端
- 科目管理（创建、编辑、删除科目）
- 题库管理（单选、多选、判断、填空、简答多种题型）
- 试卷管理
  - 手动组卷（勾选题目、支持按题型筛选）
  - 自动组卷（设置题型数量和分值，总分自动计算）
  - 试卷编辑（勾选区分已选/未选题目）
  - 试卷预览（学生视角预览）
- 考试管理
  - 发布考试（设置时间、时长、班级、权限）
  - 允许考后查看试卷设置
  - 监控考试（切屏次数、离开次数）
  - 延时功能
- 成绩管理（查询、导出）

### 学生端
- 考试列表（待参加、进行中、已结束）
- 在线考试
  - 实时计时
  - 题目导航（左侧题目状态显示）
  - 自动保存答案（每30秒自动保存）
  - 手动保存按钮
  - 切屏检测（超过次数自动交卷）
- 考试历史（查看成绩、查看试卷）
- 错题本（按科目筛选、练习功能）

## 核心功能

### 自动组卷
- 支持设置每种题型的题目数量
- 支持设置每种题型的分值
- 总分自动计算（题目数量 × 每题分值）
- 及格分支持百分比设置

### 试卷编辑
- 勾选区分已选和未选题目
- 支持按题型筛选题目
- 筛选后保持勾选状态
- 单题分值显示和设置

### 防作弊机制
- 题目乱序（不同考生题目顺序不同）
- 选项乱序（客观题选项随机排列）
- 切屏检测（超过3次切屏自动交卷）
- 考中离开检测
- 可疑行为标记

### 自动评分
- 客观题（单选、多选、判断）自动判分
- 主观题（填空、简答）需教师手动评分
- 交卷时自动保存错题记录

### 权限控制
- 考后查看试卷权限（教师端控制）
- 主观题未评分时不允许查看详细答案

### 自动保存
- 每30秒自动保存答题进度
- 手动保存按钮
- 退出或刷新页面后答案可恢复

## API 文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/info` - 获取用户信息
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/changePassword` - 修改密码

### 用户管理
- `GET /api/users/page` - 分页查询用户
- `POST /api/users` - 创建用户
- `PUT /api/users` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 班级管理
- `GET /api/classes/page` - 分页查询班级（管理员）
- `POST /api/class/create` - 创建班级（教师）
- `PUT /api/classes` - 更新班级
- `DELETE /api/classes/{id}` - 删除班级
- `GET /api/class/my-classes` - 获取我的班级
- `POST /api/class/join-by-code` - 通过邀请码加入班级

### 题库管理
- `GET /api/questions/page` - 分页查询题目
- `POST /api/questions` - 创建题目
- `PUT /api/questions` - 更新题目
- `DELETE /api/questions/{id}` - 删除题目

### 试卷管理
- `GET /api/papers/page` - 分页查询试卷
- `GET /api/papers/{id}` - 获取试卷详情
- `POST /api/papers` - 创建试卷
- `PUT /api/papers` - 更新试卷
- `DELETE /api/papers/{id}` - 删除试卷
- `POST /api/papers/auto-generate` - 自动组卷

### 考试管理
- `GET /api/exams/page` - 分页查询考试
- `POST /api/exams` - 创建考试
- `PUT /api/exams` - 更新考试
- `DELETE /api/exams/{id}` - 删除考试
- `POST /api/exams/{id}/extend` - 延时考试

### 考试记录
- `POST /api/exam-records/start` - 开始考试
- `POST /api/exam-records/auto-save` - 自动保存答案
- `POST /api/exam-records/submit/{id}` - 交卷
- `POST /api/exam-records/screen-switch` - 切屏记录
- `GET /api/exam-records/history` - 考试历史

### 错题本
- `GET /api/wrong-questions/page` - 分页查询错题
- `POST /api/wrong-questions/practice` - 练习错题

## License

MIT License
