from sys import stdin

line = stdin.readline()
num = int(line)

for i in range(0,num):
    line = stdin.readline()
    (n, m) = map(int, line.split())
    print n*m
