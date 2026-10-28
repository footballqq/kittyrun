#!/usr/bin/env python3
"""
萌喵甜点大作战 - 本地 HTTP 服务器
支持指定端口、绑定主机、环境变量配置等。
"""

import http.server
import socketserver
import os
import sys
import argparse
import webbrowser

DEFAULT_PORT = 8080
DEFAULT_HOST = "0.0.0.0"
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class NoCacheHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """开发友好的静态文件处理器，禁用浏览器缓存以确保代码修改即时生效"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # 更加友好的彩色访问日志
        sys.stderr.write(f"\033[36m[HTTP]\033[0m {self.address_string()} - {format % args}\n")

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="🐾 萌喵甜点大作战 - 本地开发 HTTP 服务器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
常用示例:
  python3 server.py                 # 默认启动在 8080 端口
  python3 server.py 9000            # 指定启动在 9000 端口
  python3 server.py -p 3000         # 使用 -p / --port 指定端口
  python3 server.py --bind 127.0.0.1# 指定仅监听本地回环地址
  PORT=8888 python3 server.py       # 通过环境变量指定端口
        """
    )
    # 支持位置参数指定端口，如 `python3 server.py 9000`
    parser.add_argument(
        'positional_port',
        nargs='?',
        type=int,
        default=None,
        help='指定运行端口 (可选，例如 9000)'
    )
    # 支持命令行选项 `-p / --port`
    parser.add_argument(
        '-p', '--port',
        type=int,
        default=None,
        help='指定运行端口 (例如 -p 9000)'
    )
    # 支持绑定主机
    parser.add_argument(
        '-b', '--bind',
        type=str,
        default=DEFAULT_HOST,
        help=f'绑定的主机地址 (默认: {DEFAULT_HOST})'
    )
    # 自动打开浏览器
    parser.add_argument(
        '-o', '--open',
        action='store_true',
        help='启动后自动在默认浏览器中打开游戏'
    )
    return parser.parse_args()

def get_target_port(args):
    # 优先级: 命令行参数 -p/--port > 位置参数 > 环境变量 PORT > 默认 8080
    if args.port is not None:
        return args.port, True
    if args.positional_port is not None:
        return args.positional_port, True
    env_port = os.getenv('PORT')
    if env_port is not None and env_port.isdigit():
        return int(env_port), True
    return DEFAULT_PORT, False

def create_server(host, port, is_explicit):
    if is_explicit:
        # 用户明确指定了端口，若被占用则明确报错并给出建议
        try:
            return ReusableTCPServer((host, port), NoCacheHTTPHandler), port
        except OSError as e:
            if e.errno == 98:
                print(f"\n❌ 错误: 端口 {port} 已被其他程序占用！")
                print(f"👉 建议尝试更换其他端口，例如: python3 server.py {port + 1}")
                sys.exit(1)
            raise
    else:
        # 默认模式下若 8080 占用，自动顺延探测可用端口
        for offset in range(20):
            test_port = port + offset
            try:
                return ReusableTCPServer((host, test_port), NoCacheHTTPHandler), test_port
            except OSError as e:
                if e.errno == 98:
                    continue
                raise
        print("\n❌ 错误: 8080-8100 端口范围均已被占用，请使用 -p 参数指定可用端口！")
        sys.exit(1)

def main():
    args = parse_arguments()
    port, is_explicit = get_target_port(args)
    host = args.bind

    os.chdir(DIRECTORY)
    httpd, actual_port = create_server(host, port, is_explicit)

    display_host = "localhost" if host in ("0.0.0.0", "", "127.0.0.1") else host
    url = f"http://{display_host}:{actual_port}"

    print("\n" + "=" * 60)
    print("🍰 \033[1;35m萌喵甜点大作战 (Sweet Cat Bakery) 本地服务已启动！\033[0m")
    print("=" * 60)
    print(f"📍 本地访问地址: \033[1;32m{url}\033[0m")
    if host == "0.0.0.0":
        print(f"🌐 局域网设备亦可通过本机 IP 访问对应端口: {actual_port}")
    print(f"📁 网站静态根目录: {DIRECTORY}")
    print("💡 按 \033[1;33mCtrl+C\033[0m 可随时停止服务器")
    print("=" * 60 + "\n")

    if args.open:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🐾 服务器已安全停止，感谢游玩，喵呜~ (Cat waving goodbye)\n")
        sys.exit(0)

if __name__ == '__main__':
    main()
