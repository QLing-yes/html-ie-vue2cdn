# [Vue 2 CDN 多文件组件项目](https://github.com/QLing-yes/html-ie-vue2cdn)

基于 Vue 2.7 + RequireJS 的无编译（no-build）方案，支持 IE11。

---

## 项目结构

```
├── index.html                  入口页面
├── lib/
│   ├── require.js              模块加载器
│   ├── vue2.7.16.min.js        Vue 框架
│   ├── core-js-minified.js     ES6 polyfill（IE11）
│   └── fetch.umd.min.js        Fetch API polyfill（IE11）
└── src/
    ├── plugins/
    │   ├── css.js              CSS 加载插件
    │   └── html.js             HTML 模板加载插件
    ├── styles/
    │   └── global.css            全局样式
    └── components/
        ├── index.js            组件注册表（新增组件时唯一需要改动的文件）
        └── counter/
            ├── index.html   组件模板
            ├── counter.js        组件逻辑(必须和目录同名)
            └── index.css       组件样式
```

---

## 运行方式

必须通过 HTTP 服务器访问，不支持直接双击打开（`file://` 协议下 XHR 请求会被浏览器拦截）。

```bash
# 任意静态服务器均可，例如：
npx serve .
python -m http.server 8080
```

---

## 启动流程

### 第一步：index.html 加载依赖

```html
<!-- polyfill 必须最先加载 -->
<script src="lib/core-js-minified.js"></script>
<script src="lib/vue2.7.16.min.js"></script>
<link rel="stylesheet" href="src/styles/base.css">

<!-- require.js 通过 data-main 属性自动执行 main.js -->
<script src="lib/require.js" data-main="main"></script>
```

`data-main="main"` 告诉 RequireJS 在自身加载完毕后立即异步执行 `main.js`，
整个模块系统从这里启动。

### 第二步：main.js 配置并触发注册

```js
requirejs.config({
  baseUrl: '',          // 所有模块路径以项目根目录为基准
  paths: {
    css:  'src/plugins/css',   // 'css!'  前缀指向该插件
    html: 'src/plugins/html'   // 'html!' 前缀指向该插件
  }
});

// 加载组件注册表，拿到注册表对象后创建 Vue 实例
require(['src/components/index'], function(components) {
  new Vue({
    el: '#app',
    components: components    // { 'counter': CounterDef, ... }
  });
});
```

`main.js` 本身不感知任何具体组件，它只负责两件事：配置路径别名、把注册表交给 Vue。

### 第三步：组件注册表自动收集所有组件

`src/components/index.js` 是唯一的组件清单文件：

```js
define([
  'src/components/Counter/index'
  // 新增组件在这里追加一行
], function(Counter) {
  return {
    'counter': Counter
    // 新增组件在这里追加一行
  };
});
```

RequireJS 在执行这个 `define` 时，会**并行**发起所有依赖的加载请求。每个组件的
`index.js` 内部又会继续声明自己对 `template.html` 和 `index.css` 的依赖，RequireJS
递归解析整棵依赖树，全部就绪后才调用回调，将完整的 `{ 标签名: 组件定义 }` 映射对象
返回给 `main.js`。

**整个过程无需手动 import，无需构建步骤**——组件只要出现在注册表里，就会被自动发现、
加载并注册到 Vue 实例。

---

## 插件机制

RequireJS 通过「插件前缀」来扩展加载能力，格式为 `插件名!资源路径`。

### html 插件

用 XHR 把任意文本文件读取为字符串，专门用来加载 HTML 模板：

```js
// 声明依赖后，template 变量直接是 HTML 字符串
define(['html!src/components/Counter/template.html'], function(template) {
  return { template: template };
});
```

### css 插件

动态向 `<head>` 插入 `<link>` 标签，并在样式加载完成后才允许模块继续执行，
避免组件渲染时出现样式闪烁：

```js
// 以 'css!' 开头，无需接收返回值
define(['css!src/components/Counter/index'], function() { ... });
```

两个插件均兼容 IE11，且内部做了去重处理，同一资源不会被加载两次。

---

## 新增组件

只需三步，`index.html` 和 `main.js` 始终不用动。

### 第一步：创建组件目录

```
src/components/MyWidget/
├── template.html
├── index.js
└── index.css
```

### 第二步：编写组件三件套

**template.html**

```html
<div class="mw-root">
  <p>{{ message }}</p>
</div>
```

**index.js**

```js
define([
  'html!src/components/MyWidget/template.html',
  'css!src/components/MyWidget/index'
], function(template) {
  return {
    template: template,
    props: {
      message: { type: String, default: 'Hello' }
    }
  };
});
```

**index.css**（建议以组件名作为 CSS 类名前缀，避免全局污染）

```css
.mw-root { padding: 16px; }
```

### 第三步：在注册表中添加三行

打开 `src/components/index.js`，追加依赖路径、回调参数、注册名：

```js
define([
  'src/components/Counter/index',
  'src/components/MyWidget/index'   // ① 新增依赖路径
], function(
  Counter,
  MyWidget                          // ② 新增回调参数
) {
  return {
    'counter':   Counter,
    'my-widget': MyWidget           // ③ 新增注册名
  };
});
```

完成后刷新页面，在任意 HTML 模板中使用 `<my-widget>` 即可。

---

## IE11 兼容说明

| 问题 | 解决方案 |
|------|----------|
| 不支持 Promise / Symbol | `lib/core-js-minified.js` 在页面最顶部加载，提前打补丁 |
| 不支持 Fetch API | `lib/fetch.umd.min.js` polyfill |
| 不支持 ES Module | RequireJS AMD 模块系统完全绕过原生 ESM |
| CSS 属性兼容 | 组件样式中对 flexbox 等属性保留 `-ms-` 前缀 |

所有 polyfill 已在 `index.html` 中按顺序引入，新增组件无需额外处理。