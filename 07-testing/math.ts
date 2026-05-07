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

export async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  // 模拟异步操作
  await new Promise((resolve) => setTimeout(resolve, 10));
  return { id, name: `User${id}` };
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
