# 使用官方的Python镜像作为基础镜像
FROM python:3.11.10

# 设置工作目录
WORKDIR /app

# 复制requirements.txt
COPY requirements.txt ./

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["python", "app.py"]