# Docker 说明

在没有 `node` 环境的情况下， 可以使用当前构建脚本。

## 使用

### 构建命令

```
docker build --no-cache -t iptv:latest -f docker/dockerfile .
```

### 运行容器

```
docker run -d -p 4173:4173 -p 9001:9001 --name iptv iptv:latest
```

访问 [http://localhost:5173](http://localhost:5173) 就可以了


