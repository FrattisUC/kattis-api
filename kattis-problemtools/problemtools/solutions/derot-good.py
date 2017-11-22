N = int(input())
s = input()

a = "abcdefghijklmnopqrstuvwxyz"
A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
L = len(a)

def derot(x,N):
  if not x.isalpha():
    return x

  d = (-N)%L
  
  if ord(x) >= ord("a") and ord(x) <= ord("z"):
    pos = ord(x) - ord("a")
    newpos = (pos + d)%L
    return a[newpos]
    
  if ord(x) >= ord("A") and ord(x) <= ord("Z"):
    pos = ord(x) - ord("A")
    newpos = (pos + d)%L
    return A[newpos]

  return x


sdec = ""
for c in s:
  sdec += derot(c,N)

print(sdec)

