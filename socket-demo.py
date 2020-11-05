import argparse
import time, sys


IP = "localhost"
PORT = 8081


from socket import socket, AF_INET, SOCK_STREAM, timeout

class CursorClient:
    def __init__(self, server_addr, port, timeout=1):
        self.my_socket = socket(AF_INET, SOCK_STREAM)
        self.my_socket.settimeout(timeout)
        self.connect(server_addr, port)

    def __exit__(self, type, value, traceback):
        self.close()

    def connect(self, address, port):
        self.my_socket.connect((address, port))
        print(f"client connecting to server: {address}")

    def close(self):
        self.my_socket.close()
        print("remote client socket closed")

    def send(self, touch_state, x, y):
        paras = [touch_state, x, y]
        self.my_socket.send(str(" ".join([str(item) for item in paras]) + "\n").encode())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--ip',help='Server IP Address')
    parser.add_argument('--port', type=int, default=8081,
                    help='Server port')
    args = parser.parse_args()
    print(args)
    if args.ip:
        IP = args.ip
    if args.port:
        PORT = args.port
    my_remote_handle = CursorClient(IP, PORT)
    my_remote_handle.send(1, 0.2, 0.5)
    my_remote_handle.send(2, 0.2, 0.5)
    my_remote_handle.send(2, 0.21, 0.5)
    my_remote_handle.send(2, 0.21, 0.5)
    my_remote_handle.send(2, 0.22, 0.5)
    my_remote_handle.send(2, 0.22, 0.5)
    my_remote_handle.send(2, 0.23, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.24, 0.5)
    my_remote_handle.send(2, 0.25, 0.5)
    my_remote_handle.send(2, 0.25, 0.5)
    my_remote_handle.send(2, 0.26, 0.5)
    my_remote_handle.send(2, 0.27, 0.5)
    my_remote_handle.send(2, 0.28, 0.5)
    my_remote_handle.send(2, 0.29, 0.5)
    my_remote_handle.send(2, 0.3, 0.5)
    my_remote_handle.send(2, 0.33, 0.5)
    my_remote_handle.send(3, 0.35, 0.5)
    my_remote_handle.send(4, 0.5, 0.5)
    my_remote_handle.send(4, 0.5, 0.5)
    my_remote_handle.send(4, 0.8, 0.3)
    my_remote_handle.close()


