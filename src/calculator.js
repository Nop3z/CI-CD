/**
 * 简单的计算器模块 - 用于演示CI/CD
 */

class Calculator {
  /**
   * 加法
   */
  add(a, b) {
    return a + b;
  }

  /**
   * 减法
   */
  subtract(a, b) {
    return a - b;
  }

  /**
   * 乘法
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * 除法
   */
  divide(a, b) {
    if (b === 0) {
      throw new Error('不能除以零');
    }
    return a / b;
  }

  /**
   * 判断是否为偶数
   */
  isEven(num) {
    return num % 2 === 0;
  }
}

module.exports = Calculator;
// test
