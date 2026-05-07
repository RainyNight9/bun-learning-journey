// 07-testing/math.ts
// 待测试的工具函数

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("除数不能为 0");
  }
  return a / b;
}

export function power(base: number, exponent: number): number {
  return base ** exponent;
}

export function factorial(n: number): number {
  if (n < 0) {
    throw new Error("n 不能小于 0");
  }
  if (n === 0 || n === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  // 模拟异步操作
  await new Promise((resolve) => setTimeout(resolve, 10));
  return { id, name: `User${id}` };
}

export async function fetchPostTitle(id: number): Promise<string> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }

  const data = await res.json() as { title?: string };
  if (!data.title) {
    throw new Error("返回数据缺少 title");
  }
  return data.title;
}

export class Counter {
  private count = 0;

  increment() {
    this.count++;
    return this.count;
  }

  decrement() {
    this.count--;
    return this.count;
  }

  reset() {
    this.count = 0;
  }

  get value() {
    return this.count;
  }
}
