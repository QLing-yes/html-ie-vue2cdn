# Vue 2 CDN 多文件项目

基于 Vue 2.7 + RequireJS 的无编译（no-build）方案，支持 IE11。

## 项目结构

```
├── index.html              入口页面（永不改动）
├── main.js                 初始化入口（永不改动）
├── plugins/
│   ├── css.js              CSS 加载插件
│   └── text.js             HTML 模板加载插件
├── styles/
│   └── base.css            全局样式
└── components/
    ├── index.js            组件注册表（新增组件时改动）
    ├── AppHeader/
    │   ├── template.html   组件模板
    │   ├── index.js         组件逻辑
    │   └── index.css        组件样式
    ├── TaskCard/
    └── AddModal/
```

## 运行逻辑

### 1. 入口加载

```html
<!-- index.html -->
<script src="lib/require.js"></script>
<script src="main.js"></script>
```

### 2. RequireJS 配置

[main.js](file:///d:\Users\Administrator\Desktop\vue2-ie11\main.js) 配置模块路径和插件：

```js
requirejs.config({
  baseUrl: '',
  paths: {
    css:  'plugins/css',
    text: 'plugins/text'
  }
});
```

### 3. 插件机制

| 插件 | 作用 | 用法 |
|------|------|------|
| text.js | 通过 XHR 加载 `.html` 模板为字符串 | `define(['text!path/to/template.html'], function(tpl) {...})` |
| css.js | 动态插入 `<link>` 标签加载 CSS | `define(['css!path/to/style'], function() {...})` |

### 4. 组件注册

[components/index.js](file:///d:\Users\Administrator\Desktop\vue2-ie11\components\index.js) 是唯一的「配置入口」：

```js
define([
  'components/AppHeader/index',
  'components/TaskCard/index',
  'components/AddModal/index'
], function(AppHeader, TaskCard, AddModal) {
  return {
    'app-header': AppHeader,
    'task-card':  TaskCard,
    'add-modal':  AddModal
  };
});
```

main.js 加载该注册表后，将所有组件注入 Vue 实例的 `components` 选项。

## 新增组件

只需三步：

### 1. 创建组件目录

```
components/MyWidget/
├── template.html
├── index.js
└── index.css
```

### 2. 编写组件文件

**template.html** — 干净的 HTML：

```html
<div class="wdg-root">
  <h3>{{ title }}</h3>
</div>
```

**index.js** — 固定格式：

```js
define([
  'text!components/MyWidget/template.html',
  'css!components/MyWidget/index'
], function(template) {
  return {
    template: template,
    props: {
      title: { type: String, default: '' }
    }
  };
});
```

**index.css** — 作用域样式（建议以组件名为前缀）：

```css
.wdg-root { padding: 16px; }
```

### 3. 注册组件

在 [components/index.js](file:///d:\Users\Administrator\Desktop\vue2-ie11\components\index.js) 中添加三行：

```js
define([
  'components/AppHeader/index',
  'components/TaskCard/index',
  'components/AddModal/index',
  'components/MyWidget/index'   // 新增：依赖路径
], function(
  AppHeader,
  TaskCard,
  AddModal,
  MyWidget                     // 新增：参数
) {
  return {
    'app-header': AppHeader,
    'task-card':  TaskCard,
    'add-modal':  AddModal,
    'my-widget':  MyWidget     // 新增：注册名
  };
});
```

## IE11 兼容

- Vue 2.7.16
- core-js：ES6 Promise / Symbol 等 polyfill
- fetch.umd：Fetch API polyfill

已在 index.html 中引入，无需额外配置。
