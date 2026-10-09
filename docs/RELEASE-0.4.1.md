# UI 0.4.1

0.4.1 是本批正式发布版本。组件、默认行为与文档家族的迁移说明见 [本批迁移说明](RELEASE-0.4.0.md)。

v0.4.0 首次 GitHub Actions 在 Linux 的 API 文档测试失败，Publish 未执行；此标签保留，不改写或重复发布。0.4.1 将公开契约提取时的源码换行统一为 LF，使多行表达式与平台无关，并加入同一实际 Vue 源码 LF/CRLF 提取结果完全一致的回归。

公共组件数量及 API 内容不变。版本、标签、Actions 与官方 npm 的最终结果见 `.Codex/memory/publishing.md`，消费端随后固定升级0.4.1。
