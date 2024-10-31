存放自定义的JavaScript脚本。

假设你有一个名为`test.js`的JavaScript文件，可以在模板文件中这样应用它：

```
{% include _scripts/script.js %}
```

这样，当jekyll处理模板时，会自动将script.js文件的内容插入到相应的位置。