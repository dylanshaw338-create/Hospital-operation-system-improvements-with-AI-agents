#!/usr/bin/env python3
"""
CORS代理服务器 - 解决浏览器跨域问题
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

class CorsProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_POST(self):
        """处理POST请求并转发到目标API"""
        try:
            # 获取请求内容
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # 解析目标URL（从路径或查询参数获取）
            if self.path.startswith('/proxy/'):
                # 从路径中提取目标URL
                target_url = 'https://' + self.path[7:]  # 移除 '/proxy/'
            else:
                # 默认转发到OpenKey API
                target_url = 'https://openkey.cloud/v1/chat/completions'
            
            print(f"代理请求到: {target_url}")
            print(f"请求数据: {post_data.decode('utf-8')}")
            
            # 创建转发请求
            req = urllib.request.Request(target_url, post_data)
            
            # 复制必要的头部
            for header in ['Content-Type', 'Authorization']:
                if header in self.headers:
                    req.add_header(header, self.headers[header])
            
            # 发送请求并获取响应
            with urllib.request.urlopen(req) as response:
                response_data = response.read()
                
                # 发送响应给客户端
                self.send_response(response.status)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                
                # 复制响应头部
                for header, value in response.headers.items():
                    if header.lower() not in ['content-length', 'connection', 'server']:
                        self.send_header(header, value)
                
                self.end_headers()
                self.wfile.write(response_data)
                
                print(f"代理响应: {response.status}")
                print(f"响应数据: {response_data.decode('utf-8')}")
                
        except urllib.error.HTTPError as e:
            print(f"HTTP错误: {e.code} - {e.reason}")
            self.send_error(e.code, e.reason)
        except urllib.error.URLError as e:
            print(f"URL错误: {e.reason}")
            self.send_error(500, str(e.reason))
        except Exception as e:
            print(f"代理错误: {str(e)}")
            self.send_error(500, str(e))
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        sys.stdout.write(f"[CORS代理] {format % args}\n")

def run_proxy_server(port=8080):
    """运行CORS代理服务器"""
    try:
        with socketserver.TCPServer(("", port), CorsProxyHandler) as httpd:
            print(f"🚀 CORS代理服务器启动成功！")
            print(f"📡 监听端口: {port}")
            print(f"🌐 代理地址: http://localhost:{port}")
            print(f"📋 使用说明:")
            print(f"   1. 启动此代理服务器")
            print(f"   2. 修改前端代码中的API地址为: http://localhost:{port}/proxy/openkey.cloud/v1/chat/completions")
            print(f"   3. 或者直接使用: http://localhost:{port}/proxy/")
            print(f"\n⚠️  注意: 这个代理只用于开发环境，生产环境请使用专业的代理服务")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 代理服务器已停止")
    except Exception as e:
        print(f"❌ 代理服务器启动失败: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='CORS代理服务器')
    parser.add_argument('-p', '--port', type=int, default=8080, help='代理服务器端口 (默认: 8080)')
    args = parser.parse_args()
    
    run_proxy_server(args.port)