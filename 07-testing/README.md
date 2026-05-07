# 07 - Testing 单元测试 🧪

> Bun 内置 Jest 兼容的测试运行器,**比 Jest 快 13 倍**

## 🎯 学习目标

- 使用 `bun:test` 编写单元测试
- 掌握 `expect` 断言 API
- 学习 `describe` 分组、生命周期钩子
- 编写异步测试
- 使用 `mock` 模拟函数

## ▶️ 运行测试

```bash
# 运行所有测试
bun test

# 运行特定文件
bun test math.test.ts

# 监听模式 (文件变化自动重跑)
bun test --watch

# 输出测试覆盖率
bun test --coverage

# 详细输出
bun test --verbose
```

## 💡 核心 API

### 测试结构

```typescript
import { test, describe, expect } from "bun:test";

// 单个测试
test("测试名称", () => {
  expect(actual).toBe(expected);
});

// 分组
describe("一组相关测试", () => {
  test("测试 1", () => { /* ... */ });
  test("测试 2", () => { /* ... */ });
});
```

### 生命周期钩子

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from "bun:test";

beforeAll(() => { /* 所有测试前执行一次 */ });
afterAll(() => { /* 所有测试后执行一次 */ });
beforeEach(() => { /* 每个测试前 */ });
afterEach(() => { /* 每个测试后 */ });
```

### 常用断言 (Matchers)

| 断言 | 说明 | 示例 |
|:---|:---|:---|
| `toBe(x)` | 严格相等 (===) | `expect(1+1).toBe(2)` |
| `toEqual(x)` | 深度相等 | `expect({a:1}).toEqual({a:1})` |
| `toBeTruthy()` | 真值 | `expect("hi").toBeTruthy()` |
| `toBeFalsy()` | 假值 | `expect(0).toBeFalsy()` |
| `toBeNull()` | === null | `expect(null).toBeNull()` |
| `toBeUndefined()` | === undefined | `expect(x).toBeUndefined()` |
| `toBeDefined()` | !== undefined | `expect(x).toBeDefined()` |
| `toBeGreaterThan(x)` | > x | `expect(10).toBeGreaterThan(5)` |
| `toBeLessThan(x)` | < x | `expect(5).toBeLessThan(10)` |
| `toContain(x)` | 包含 | `expect([1,2]).toContain(1)` |
| `toMatch(regex)` | 正则匹配 | `expect("hi").toMatch(/h/)` |
| `toThrow()` | 抛出错误 | `expect(fn).toThrow()` |
| `toHaveBeenCalled()` | mock 被调用 | `expect(fn).toHaveBeenCalled()` |

### 异步测试

```typescript
test("异步操作", async () => {
  const result = await fetchData();
  expect(result).toBe("data");
});
```

### Mock 函数

```typescript
import { mock } from "bun:test";

const fn = mock((x: number) => x * 2);
fn(5);

expect(fn).toHaveBeenCalled();
expect(fn.mock.calls[0]).toEqual([5]);
```

## ⚡ 性能对比

运行 1000 个测试:
- **Jest** (Node.js): ~6.5s
- **Vitest**: ~1.2s
- **bun test**: **~0.5s** ⚡

## 🧪 练习

1. 为 `math.ts` 添加更多函数(如 `power`, `factorial`),并编写测试
2. 测试一个 fetch 函数(可以 mock `fetch` 全局函数)
3. 使用 `--coverage` 生成覆盖率报告,达到 100% 覆盖
