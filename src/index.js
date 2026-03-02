const Calculator = require('./calculator');

console.log('========================================');
console.log('欢迎使用 CI/CD 示例项目！');
console.log('========================================\n');

const calc = new Calculator();

// 演示计算器功能
console.log('📊 计算器演示:');
console.log(`  5 + 3 = ${calc.add(5, 3)}`);
console.log(`  10 - 4 = ${calc.subtract(10, 4)}`);
console.log(`  6 × 7 = ${calc.multiply(6, 7)}`);
console.log(`  20 ÷ 4 = ${calc.divide(20, 4)}`);
console.log(`  8 是偶数吗? ${calc.isEven(8) ? '是' : '否'}`);
console.log(`  7 是偶数吗? ${calc.isEven(7) ? '是' : '否'}\n`);

console.log('✅ 应用运行成功！');
console.log('💡 这个项目配置了 GitHub Actions CI/CD');
console.log('   每次 push 代码都会自动运行测试和构建\n');
