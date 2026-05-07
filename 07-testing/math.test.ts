// 07-testing/math.test.ts
// 🎯 学习目标:使用 bun:test 编写单元测试
// Bun 内置了与 Jest 兼容的测试运行器,无需安装任何包!

import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import { add, subtract, multiply, divide, power, factorial, fetchUser, fetchPostTitle, Counter } from "./math";

// ============================================
// 1. 基本测试
// ============================================
test("add: 两数相加", () => {
  expect(add(1, 2)).toBe(3);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});

test("subtract: 两数相减", () => {
  expect(subtract(5, 3)).toBe(2);
});

// ============================================
// 2. describe - 分组测试
// ============================================
describe("Math 工具函数", () => {
  describe("multiply", () => {
    test("正数相乘", () => {
      expect(multiply(2, 3)).toBe(6);
    });

    test("乘以 0 等于 0", () => {
      expect(multiply(100, 0)).toBe(0);
    });

    test("负数相乘", () => {
      expect(multiply(-2, -3)).toBe(6);
    });
  });

  describe("divide", () => {
    test("正常除法", () => {
      expect(divide(10, 2)).toBe(5);
    });

    test("除以 0 抛出错误", () => {
      expect(() => divide(10, 0)).toThrow("除数不能为 0");
    });
  });

  describe("power", () => {
    test("基础幂运算", () => {
      expect(power(2, 3)).toBe(8);
      expect(power(5, 0)).toBe(1);
    });
  });

  describe("factorial", () => {
    test("正常阶乘", () => {
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
    });

    test("0 的阶乘是 1", () => {
      expect(factorial(0)).toBe(1);
    });

    test("负数抛出错误", () => {
      expect(() => factorial(-1)).toThrow("n 不能小于 0");
    });
  });
});

// ============================================
// 3. 异步测试
// ============================================
describe("异步函数", () => {
  test("fetchUser 返回正确的用户", async () => {
    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: "User1" });
  });

  test("fetchUser 是异步的", async () => {
    const start = Date.now();
    await fetchUser(1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(10);
  });
});

// ============================================
// 3.1 mock 全局 fetch 测试
// ============================================
describe("fetchPostTitle", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("请求成功时返回 title", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ title: "Hello Bun" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    return expect(fetchPostTitle(1)).resolves.toBe("Hello Bun");
  });

  test("HTTP 非 2xx 时抛错", async () => {
    globalThis.fetch = mock(async () => {
      return new Response("Not Found", { status: 404 });
    }) as unknown as typeof fetch;

    return expect(fetchPostTitle(1)).rejects.toThrow("请求失败: 404");
  });

  test("返回缺少 title 时抛错", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    return expect(fetchPostTitle(1)).rejects.toThrow("返回数据缺少 title");
  });
});

// ============================================
// 4. 生命周期钩子
// ============================================
describe("Counter 类", () => {
  let counter: Counter;

  // 每个 test 前都会执行
  beforeEach(() => {
    counter = new Counter();
  });

  // 每个 test 后都会执行
  afterEach(() => {
    counter.reset();
  });

  test("初始值为 0", () => {
    expect(counter.value).toBe(0);
  });

  test("increment 增加 1", () => {
    counter.increment();
    expect(counter.value).toBe(1);
  });

  test("可以连续 increment", () => {
    counter.increment();
    counter.increment();
    counter.increment();
    expect(counter.value).toBe(3);
  });

  test("decrement 减少 1", () => {
    counter.increment();
    counter.decrement();
    expect(counter.value).toBe(0);
  });

  test("reset 重置为 0", () => {
    counter.increment();
    counter.increment();
    counter.reset();
    expect(counter.value).toBe(0);
  });
});

// ============================================
// 5. 常用断言 (matchers)
// ============================================
describe("断言示例", () => {
  test("精确相等", () => {
    expect(1 + 1).toBe(2);
    expect("hello").toBe("hello");
  });

  test("对象/数组深度相等", () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

  test("真假判断", () => {
    expect(true).toBeTruthy();
    expect(0).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect("hello").toBeDefined();
  });

  test("数值比较", () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
    expect(5).toBeGreaterThanOrEqual(5);
  });

  test("字符串/数组包含", () => {
    expect("Hello World").toContain("World");
    expect([1, 2, 3]).toContain(2);
  });

  test("正则匹配", () => {
    expect("hello@example.com").toMatch(/^\w+@\w+\.\w+$/);
  });

  test("抛出错误", () => {
    expect(() => {
      throw new Error("Boom!");
    }).toThrow("Boom!");
  });
});

// ============================================
// 6. Mock 函数
// ============================================
describe("Mock 函数", () => {
  test("mock 函数调用", () => {
    const fn = mock((x: number) => x * 2);

    fn(1);
    fn(2);
    fn(3);

    expect(fn).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn.mock.calls[0]).toEqual([1]);
    expect(fn.mock.results[0].value).toBe(2);
  });
});
