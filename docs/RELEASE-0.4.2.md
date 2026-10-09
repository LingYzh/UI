# 0.4.2

修复 UiDialog、UiMenu、UOverlay 未传 `transition` 时被 Vue Boolean 属性转换为 `false` 的问题。省略属性恢复默认动画，显式 `transition=false` 继续禁用动画。

缺陷由 UAH 使用正式 0.4.1 包的生产搜索弹窗验证发现。增加真实编译组件的省略属性入场动画回归。组件协议及迁移仍见 [0.4.0 迁移说明](RELEASE-0.4.0.md)。
