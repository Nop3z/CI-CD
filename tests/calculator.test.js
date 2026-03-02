const Calculator = require('../src/calculator');

describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('加法测试', () => {
    test('5 + 3 应该等于 8', () => {
      expect(calc.add(5, 3)).toBe(8);
    });

    test('负数相加', () => {
      expect(calc.add(-5, -3)).toBe(-8);
    });

    test('正负数相加', () => {
      expect(calc.add(10, -5)).toBe(5);
    });
  });

  describe('减法测试', () => {
    test('10 - 4 应该等于 6', () => {
      expect(calc.subtract(10, 4)).toBe(6);
    });

    test('负数相减', () => {
      expect(calc.subtract(-5, -3)).toBe(-2);
    });
  });

  describe('乘法测试', () => {
    test('6 × 7 应该等于 42', () => {
      expect(calc.multiply(6, 7)).toBe(42);
    });

    test('任何数乘以0都等于0', () => {
      expect(calc.multiply(100, 0)).toBe(0);
    });

    test('负数相乘', () => {
      expect(calc.multiply(-5, -3)).toBe(15);
    });
  });

  describe('除法测试', () => {
    test('20 ÷ 4 应该等于 5', () => {
      expect(calc.divide(20, 4)).toBe(5);
    });

    test('除以0应该抛出错误', () => {
      expect(() => {
        calc.divide(10, 0);
      }).toThrow('不能除以零');
    });

    test('负数除法', () => {
      expect(calc.divide(-10, 2)).toBe(-5);
    });
  });

  describe('偶数判断测试', () => {
    test('8 是偶数', () => {
      expect(calc.isEven(8)).toBe(true);
    });

    test('7 不是偶数', () => {
      expect(calc.isEven(7)).toBe(false);
    });

    test('0 是偶数', () => {
      expect(calc.isEven(0)).toBe(true);
    });

    test('负偶数也是偶数', () => {
      expect(calc.isEven(-4)).toBe(true);
    });
  });
});
