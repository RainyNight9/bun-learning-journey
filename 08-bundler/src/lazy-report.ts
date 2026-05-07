// 仅在动态导入时加载,用于观察 splitting 输出
export function printBuildReport() {
  const report = {
    time: new Date().toISOString(),
    mode: "lazy",
    note: "这个模块通过 dynamic import 加载",
  };

  console.log("📊 Lazy Build Report:", report);
}
