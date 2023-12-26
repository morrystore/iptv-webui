# Docker 说明

在没有 `node` 环境的情况下， 可以使用当前构建脚本。

## 使用

### 构建命令

```
docker build --no-cache -t autocue:latest -f docker/dockerfile .
```

### 运行容器

```
docker run -d -p 12833:12833 --name autocue autocue:latest
```

访问 [http://localhost:12833](http://localhost:12833) 就可以了


