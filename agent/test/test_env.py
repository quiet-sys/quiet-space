import os
import sys

print("=== 诊断信息 ===")
print(f"当前工作目录: {os.getcwd()}")
print(f"脚本所在目录: {os.path.dirname(os.path.abspath(__file__))}")
print(f"Python 解释器: {sys.executable}")

# 检查 .env 文件是否存在
dotenv_path = os.path.join(os.getcwd(), '.env')
print(f".env 文件路径: {dotenv_path}")
print(f".env 文件是否存在: {os.path.exists(dotenv_path)}")

if os.path.exists(dotenv_path):
    with open(dotenv_path, 'r') as f:
        print(".env 文件内容预览（隐藏密钥值）:")
        for line in f.readlines():
            if '=' in line and not line.startswith('#'):
                key = line.split('=')[0]
                print(f"  - {key}=***")
else:
    print("  提示：未找到 .env 文件！")

# 尝试加载
from dotenv import load_dotenv
load_dotenv()  # 默认从当前目录加载

print("\n=== 加载后的环境变量 ===")
print(f"OPENAI_API_KEY: {'已设置' if os.getenv('OPENAI_API_KEY') else '未设置'}")
print(f"OPENAI_BASE_URL: {os.getenv('OPENAI_BASE_URL')}")

# 如果你想测试 settings，也需要导入 config，但先确保它能找到
try:
    sys.path.insert(0, os.getcwd())  # 将当前目录加入模块搜索路径
    from config import settings
    print(f"\nconfig.settings.api_key: {'已设置' if settings.api_key else '未设置'}")
    print(f"config.settings.base_url: {settings.base_url}")
    print(f"config.settings.chat_model: {settings.chat_model}")
except Exception as e:
    print(f"\n导入 config 失败: {e}")